import { DataTypes } from "sequelize";
import { pgDb } from "../config/database.js";

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
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  freezeTableName: true,
  timestamps: false,
});

pgDb.sync().then(() => console.log("PostgreSQL: jawaban_surat table synced"));

export default JawabanSurat;
