
const prisma = require("../database/prisma");

// GET /api/shows
const getAllShows = async (req, res) => {
  try {
    const shows = await prisma.show.findMany({
      orderBy: {
        startsAt: "asc",
      },
      include: {
        _count: {
          select: {
            seats: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    console.error("Error fetching shows:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch shows",
    });
  }
};


const getShowSeats = async (req, res) => {
  try {
    const showId = Number(req.params.id);

    if (!Number.isInteger(showId) || showId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid show ID",
      });
    }

    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        seats: {
          include: {
            reservations: {
              where: {
                OR: [
                  { status: "CONFIRMED" },
                  {
                    status: "HOLD",
                    expiresAt: { gt: new Date() },
                  },
                ],
              },
              select: {
                status: true,
                expiresAt: true,
              },
            },
          },
        },
      },
    });

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const seats = show.seats.map((seat) => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      category: seat.category,
      price: seat.price,
      isAvailable: seat.reservations.length === 0,
    }));

    res.status(200).json({
      success: true,
      show: {
        id: show.id,
        movieTitle: show.movieTitle,
        screenName: show.screenName,
        startsAt: show.startsAt,
      },
      seats,
    });
  } catch (error) {
    console.error("Error fetching seats:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch seats",
    });
  }
};

module.exports = { getAllShows };
module.exports = { getAllShows };
module.exports = { getAllShows, getShowSeats };