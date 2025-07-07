const express = require("express")
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http"); // ✅ AJOUT IMPORTANT
const connectDB = require("./config/db.js");
const usersRoutes = require("./routes/usersRoutes.js");
const hotelRoutes = require("./routes/hotelRoutes.js");


dotenv.config();

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", usersRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/hotels", hotelRoutes);


// Démarrer le serveur
connectDB().then(() => {
  server.listen(process.env.PORT || 8000, () => {
    console.log(`✅ Server running on port ${process.env.PORT}`);
  });
});
