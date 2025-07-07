const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  adresse: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String, required: true },
  prix: { type: String, required: true },
  devise: { type: String, required: true },
  photo: { type: String, required: false }, // chemin vers l'image
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
