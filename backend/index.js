import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import NoteRoute from './routes/SuratRoute.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Configure CORS for credentials
app.use(cors({
  // Allow requests from these origins (add your frontend URL)
  origin: [
    'http://localhost:5000'
    // Add any other frontend origins as needed
  ],
  // Allow credentials (cookies)
  credentials: true,
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Allowed headers
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse cookies
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());

// Use routes
app.use(NoteRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.listen(5000, () => console.log('Server running on port 5000'));