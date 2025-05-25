import User from '../models/UserModel.js'; // Import model User dari sequelize
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Get all users
async function getUser(req, res) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'username', 'role'] // Tambahkan 'role' di sini
    });
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ 
      status: "Error", 
      message: error.message 
    });
  }
}

// Register new user
async function register(req, res) {
  try {
    const { email, username, password } = req.body;
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({
      where: {
        email: email
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Email already registered" 
      });
    }
    
    // Hash the password
    const encryptPassword = await bcrypt.hash(password, 5);
    
    // Create new user
    const newUser = await User.create({
      email,
      username,
      password: encryptPassword,
      refresh_token: null
    });
    
    // Return success but don't include password in response
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    
    res.status(201).json({
      status: "Success",
      message: "Registration successful",
      data: userWithoutPassword
    });
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ 
      status: "Error", 
      message: error.message 
    });
  }
}

async function login(req, res) {
    try {
      // Login menggunakan email dan password
      const { email, password } = req.body;
  
      // Cek apakah email terdaftar
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
  
      // Kalo email ada (terdaftar)
      if (user) {
        // Data User itu nanti bakalan dipake buat ngesign token
        // Data user dari sequelize itu harus diubah dulu ke bentuk object
        const userPlain = user.toJSON(); // Konversi ke object
  
        // Ngecek isi dari userplain (tidak wajib ditulis, cuma buat ngecek saja)
        console.log(userPlain);
  
        // Disini kita mau mengcopy isi dari variabel userPlain ke variabel baru namanya safeUserData
        // Tapi di sini kita gamau copy semuanya, kita gamau copy password sama refresh_token karena itu sensitif
        const { password: _, refresh_token: __, ...safeUserData } = userPlain;
  
        // Ngecek apakah password sama kaya yg ada di DB
        const decryptPassword = await bcrypt.compare(password, user.password);
  
        // Kalau password benar, artinya berhasil login
        if (decryptPassword) {
          // Access token expire selama 15 menit
          const accessToken = jwt.sign(
            safeUserData,
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "15m",
            }
          );

          // Refresh token expire selama 1 hari
          const refreshToken = jwt.sign(
            safeUserData,
            process.env.REFRESH_TOKEN_SECRET,
            {
              expiresIn: "1d",
            }
          );
  
          // Update tabel refresh token pada DB
          await User.update(
            { refresh_token: refreshToken },
            {
              where: {
                id: user.id,
              },
            }
          );
  
          // Masukkin refresh token ke cookie
          res.cookie("refreshToken", refreshToken, {
            httpOnly: false, // Ngatur cross-site scripting, untuk penggunaan asli aktifkan karena bisa nyegah serangan fetch data dari website "document.cookies"
            sameSite: "none", // Ngatur domain yg request misal kalo strict cuman bisa akses ke link dari dan menuju domain yg sama, lax itu bisa dari domain lain tapi cuman bisa get
            maxAge: 24 * 60 * 60 * 1000, // Ngatur lamanya token disimpan di cookie (dalam satuan ms)
            secure: true, // Ini ngirim cookies cuman bisa dari https, kenapa? nyegah skema MITM di jaringan publik, tapi pas development di false in aja
          });
  
          // Kirim respons berhasil (200)
          res.status(200).json({
            status: "Succes",
            message: "Login Berhasil",
            safeUserData,
            accessToken,
          });
        } else {
          // Kalau password salah
          const error = new Error("Paassword atau email salah");
          error.statusCode = 400;
          throw error;
        }
      } else {
        // Kalau email salah
        const error = new Error("Paassword atau email salah");
        error.statusCode = 400;
        throw error;
      }
    } catch (error) {
      res.status(error.statusCode || 500).json({
        status: "Error",
        message: error.message,
      });
    }
  }
  
  async function logout(req, res) {
    // mengecek refresh token sama gak sama di database
    const refreshToken = req.cookies.refreshToken;
  
    // Kalo ga sama atau ga ada kirim status code 204
    if (!refreshToken) return res.sendStatus(204);
  
    // Kalau sama, cari user berdasarkan refresh token tadi
    const user = await User.findOne({
      where: {
        refresh_token: refreshToken,
      },
    });
  
    // Kalau user gaada, kirim status code 204
    if (!user.refresh_token) return res.sendStatus(204);
  
    // Kalau user ketemu, ambil user id
    const userId = user.id;
  
    // Hapus refresh token dari DB berdasarkan user id tadi
    await User.update(
      { refresh_token: null },
      {
        where: {
          id: userId,
        },
      }
    );
  
    // Ngehapus cookies yg tersimpan
    res.clearCookie("refreshToken");
    return res.sendStatus(200);
  }

// Setelah login berhasil, safeUserData berisi user_id, username, role, dst.
// Frontend dapat menyimpan safeUserData ke localStorage/sessionStorage untuk akses user_id, username, dan role selama sesi login.

export { login, logout, getUser, register };

export async function getPetugasList(req, res) {
  try {
    const petugas = await User.findAll({
      where: { role: "petugas" },
      attributes: ["id", "username", "email"]
    });
    res.json(petugas);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data petugas" });
  }
}