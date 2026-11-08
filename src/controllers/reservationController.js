
const prisma = require("../database/prisma");
const { randomUUID } = require("crypto");

// POST /api/reservations/hold
const createSeatHold = async (req, res) => {
  try {
    const { showId, seatId } = req.body;

    // Validate input
    if (
      !Number.isInteger(showId) ||
      !Number.isInteger(seatId) ||
      showId <= 0 ||
      seatId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid showId and seatId are required",
      });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const reservation = await prisma.$transaction(async (tx) => {
      // Check that the seat belongs to the requested show
      const seat = await tx.seat.findFirst({
        where: {
          id: seatId,
          showId: showId,
        },
      });

      if (!seat) {
        const error = new Error("Seat not found for this show");
        error.statusCode = 404;
        throw error;
      }

      // Release expired holds for this seat
      await tx.reservation.updateMany({
        where: {
          seatId,
          status: "HOLD",
          expiresAt: { lte: now },
          activeSeatKey: { not: null },
        },
        data: {
          status: "EXPIRED",
          activeSeatKey: null,
        },
      });

      // Create a temporary hold
      return tx.reservation.create({
        data: {
          bookingCode: `BK-${randomUUID()}`,
          seatId,
          status: "HOLD",
          expiresAt,
          activeSeatKey: `seat-${seatId}`,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Seat held successfully for 5 minutes",
      data: reservation,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This seat is already held or booked",
      });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Reservation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to hold seat",
    });
  }
};


const confirmReservation = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID",
      });
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) {
        return { error: "NOT_FOUND" };
      }

      if (reservation.status !== "HOLD") {
        return { error: "NOT_ON_HOLD" };
      }

      if (!reservation.expiresAt || reservation.expiresAt <= now) {
        await tx.reservation.update({
          where: { id: reservationId },
          data: {
            status: "EXPIRED",
            activeSeatKey: null,
          },
        });

        return { error: "EXPIRED" };
      }

      const updated = await tx.reservation.updateMany({
        where: {
          id: reservationId,
          status: "HOLD",
          expiresAt: { gt: now },
        },
        data: {
          status: "CONFIRMED",
          expiresAt: null,
        },
      });

      if (updated.count !== 1) {
        return { error: "NOT_ON_HOLD" };
      }

      return {
        reservation: await tx.reservation.findUnique({
          where: { id: reservationId },
        }),
      };
    });

    if (result.error === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (result.error === "EXPIRED") {
      return res.status(410).json({
        success: false,
        message: "Reservation hold has expired",
      });
    }

    if (result.error === "NOT_ON_HOLD") {
      return res.status(409).json({
        success: false,
        message: "Reservation cannot be confirmed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reservation confirmed successfully",
      data: result.reservation,
    });
  } catch (error) {
    console.error("Confirmation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to confirm reservation",
    });
  }
};


const cancelReservation = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID",
      });
    }

    const result = await prisma.reservation.updateMany({
      where: {
        id: reservationId,
        status: {
          in: ["HOLD", "CONFIRMED"],
        },
      },
      data: {
        status: "CANCELLED",
        activeSeatKey: null,
        expiresAt: null,
      },
    });

    if (result.count === 0) {
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Reservation cannot be cancelled",
      });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    return res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      data: reservation,
    });
  } catch (error) {
    console.error("Cancellation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel reservation",
    });
  }
};


module.exports = {
  createSeatHold,
  confirmReservation,
  cancelReservation,
};