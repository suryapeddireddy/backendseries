import connectDB from "./db/index.js";
import dotenv from "dotenv";
import express from "express";
import app from "./app.js";

// Load environment variables
dotenv.config();

// Destructure the PORT from environment variables
const { PORT } = process.env;

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
