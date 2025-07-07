const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createHotel, getAllHotels } = require("../controllers/hotelControllers");

// 📁 Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 📌 POST /api/hotels — créer un hôtel
router.post("/", upload.single("photo"), createHotel);
router.get('/', getAllHotels);

module.exports = router;
