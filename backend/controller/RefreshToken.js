import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    // Ambil refresh token, simpan ke dalam variabel
    const refreshToken = req.cookies.refreshToken;

    // Kalau refresh token gaada
    if (!refreshToken) return res.sendStatus(401);

    // Cari user yg punya refresh token yg sama
    const user = await User.findOne({
      where: {
        refresh_token: refreshToken,
      },
    });

    // Kalo ga ketemu
    if (!user.refresh_token) return res.sendStatus(403);
    // Kalo ketemu
    else
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err) return res.sendStatus(403);
          console.log("sudah lewat 403 ke dua di controller");
          const userPlain = user.toJSON(); // Konversi ke object
          const { password: _, refresh_token: __, ...safeUserData } = userPlain;
          const accessToken = jwt.sign(
            safeUserData,
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "15m",
            }
          );
          res.json({ accessToken });
        }
      );
  } catch (error) {
    console.log(error);
  }
};