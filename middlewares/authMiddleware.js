const jwt = require("jsonwebtoken");
const User = require("../models/userModels");
const dotenv = require("dotenv");
dotenv.config();


const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded; // garde juste les données du token


      if (!req.user) {
        return res.status(401).json({ message: "Utilisateur introuvable" });
      }

      next();
    } catch (err) {
      console.error("Erreur dans protect :", err);
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }
  } else {
    return res.status(401).json({ message: "Non autorisé, pas de token" });
  }
};



const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Accès refusé : admin uniquement" });
  }
};




module.exports = { protect ,admin };
