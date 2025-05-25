import express from "express";
import { getPetugasList, getUser, updateRole } from "../controller/UserController.js";
import verifyToken from "../middleware/verifyToken.js";
const router = express.Router();

// Endpoint untuk ambil semua user (opsional)
router.get("/users", async (req, res) => {
  if (req.query.role === "petugas") {
    return getPetugasList(req, res);
  }
  return getUser(req, res);
});

// Endpoint untuk update role user (admin only)
router.patch("/users/:id/role", verifyToken, updateRole);

export default router;
