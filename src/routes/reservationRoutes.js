const express = require("express");
const router = express.Router();

const {
  createSeatHold,
  confirmReservation,
  cancelReservation,
} = require("../controllers/reservationController");

router.post("/hold", createSeatHold);
router.post("/:id/confirm", confirmReservation);
router.post("/:id/cancel", cancelReservation);

module.exports = router;