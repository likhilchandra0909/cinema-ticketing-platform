const express = require("express");
const router = express.Router();

const {
  getAllShows,
  getShowSeats,
} = require("../controllers/showController");

router.get("/", getAllShows);
router.get("/:id/seats", getShowSeats);

module.exports = router;