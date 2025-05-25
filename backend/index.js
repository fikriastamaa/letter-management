import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import NoteRoute from './routes/SuratRoute.js';
import UserRoute from './routes/UserRoute.js'; // tambahkan ini
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Perbaiki CORS agar frontend (React) bisa akses backend
app.use(cors({
  origin: [
    'https://fe-surat-dot-pemuda-tobat.uc.r.appspot.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());
app.use(NoteRoute);
app.use(UserRoute); // tambahkan ini agar route /users aktif

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port', PORT));