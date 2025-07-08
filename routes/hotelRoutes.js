const express = require("express");
const router = express.Router();
const { createHotel, getAllHotels } = require("../controllers/hotelControllers");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configuration de multer avec Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hotels", // 📁 Nom du dossier Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

router.post("/", upload.single("photo"), createHotel);
router.get("/", getAllHotels);

module.exports = router;
