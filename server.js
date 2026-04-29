const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Allows the server to understand JSON data
app.use(cors());         // Allows your React frontend to talk to this server

// Import the Routes you created earlier
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");

// Define API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Root route for testing
app.get("/", (req, res) => {
  res.send("NEET Notes Backend is running... 🚀");
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
  });

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live on http://localhost:${PORT}`);
});