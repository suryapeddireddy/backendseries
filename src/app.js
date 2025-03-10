import express from 'express';
import cookieParser from 'cookie-parser';  // Optional, only if you plan to use cookies
import cors from 'cors';
import dotenv from 'dotenv'; // Make sure to import dotenv to load environment variables

// Load environment variables from .env file
dotenv.config();

const app = express();

// CORS configuration to allow requests from specific origin
app.use(cors({
  origin: process.env.CORS_ORIGIN,  // Use environment variable without quotes
  credentials: true,
}));

// Middleware to parse incoming JSON requests
app.use(express.json({ limit: '20kb' }));

// Middleware to parse URL-encoded data (from form submissions)
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

// Serve static files from the 'public' directory (e.g., images, assets)
app.use(express.static('public'));

app.use(cookieParser());// Optional, only if you plan to use cookies
// Import routes from user.routes.js
import userRoutes from '../routes/user.routes.js';

// Define routes
app.use('/api/v1/users', userRoutes);


// Export the app instance for use in index.js
export default app;
