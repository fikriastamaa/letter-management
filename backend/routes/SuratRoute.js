import express from 'express';
import { getSuratMasuk, createSuratMasuk, updateSuratMasuk, deleteSuratMasuk, updateStatusSurat } from '../controller/SuratMasukController.js';
import { getJawabanSuratBySuratMasukId, getAllJawabanSurat, createJawabanSurat } from '../controller/JawabanSuratController.js';
import { login, register, logout, updateUserRole } from '../controller/UserController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { refreshToken } from '../controller/RefreshToken.js';

const router = express.Router();

// Surat Masuk (PostgreSQL)
router.get('/surat-masuk', verifyToken, getSuratMasuk);
// POST surat masuk: user_id_pengirim diambil dari JWT/session, user_id_tujuan dari body
router.post('/surat-masuk', verifyToken, createSuratMasuk);
router.put('/surat-masuk/:id', verifyToken, updateSuratMasuk);
router.delete('/surat-masuk/:id', verifyToken, deleteSuratMasuk);
router.patch('/surat-masuk/:id/status', verifyToken, updateStatusSurat);

// Jawaban Surat (PostgreSQL)
router.get('/jawaban-surat', verifyToken, getAllJawabanSurat); // untuk semua jawaban surat (list balasan)
router.get('/jawaban-surat/:id', verifyToken, getJawabanSuratBySuratMasukId); // untuk 1 surat masuk
router.post('/jawaban-surat', verifyToken, createJawabanSurat);

// Endpoint user (MySQL)
router.get("/token", refreshToken);
router.post("/login", login);
router.post("/register", register);
router.get("/logout", verifyToken, logout);
router.patch("/users/:id/role", verifyToken, updateUserRole);

export default router;