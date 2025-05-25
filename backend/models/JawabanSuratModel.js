import { DataTypes } from "sequelize";
import { pgDb } from "../config/database.js";
import SuratMasuk from "./SuratMasukModel.js";

const JawabanSurat = pgDb.define("jawaban_surat", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_surat_masuk: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tanggal_jawaban: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  isi_jawaban: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  file_path: {
    type: DataTypes.TEXT, // Ubah ke TEXT agar bisa simpan jawaban panjang
    allowNull: true,
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

// Relasi ke SuratMasuk
JawabanSurat.belongsTo(SuratMasuk, { foreignKey: "id_surat_masuk" });

pgDb.sync().then(() => console.log("PostgreSQL: jawaban_surat table synced"));

export default JawabanSurat;
