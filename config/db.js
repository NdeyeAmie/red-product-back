const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = async () => {
   
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connexion à MongoDB réussie");
  } catch (error) {
    console.error(" Erreur de connexion à MongoDB :", error.message);
    process.exit(1); // Arrête l'application si la DB échoue
  }
};

module.exports = connectDB; 