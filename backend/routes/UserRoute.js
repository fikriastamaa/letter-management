import express from "express";
import { getPetugasList, getUser } from "../controller/UserController.js";
const router = express.Router();

// Endpoint untuk ambil semua user (opsional)
router.get("/users", async (req, res) => {
  if (req.query.role === "petugas") {
    return getPetugasList(req, res);
  }
  return getUser(req, res);
});

export default router;
