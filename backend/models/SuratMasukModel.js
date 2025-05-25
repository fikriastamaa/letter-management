import { DataTypes } from "sequelize";
import { pgDb } from "../config/database.js";

const SuratMasuk = pgDb.define("surat_masuk", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  no_surat: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  pengirim: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  perihal: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  file_path: {
    type: DataTypes.TEXT, // Ubah dari STRING(255) ke TEXT agar bisa simpan suratan panjang
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("Menunggu Jawaban", "Selesai", "Ditolak"),
    allowNull: false,
    defaultValue: "Menunggu Jawaban",
  },
  user_id_pengirim: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id_tujuan: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

pgDb.sync().then(() => console.log("PostgreSQL: surat_masuk table synced"));

export default SuratMasuk;
