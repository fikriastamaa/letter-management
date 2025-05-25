import JawabanSurat from '../models/JawabanSuratModel.js';
import SuratMasuk from '../models/SuratMasukModel.js';

// GET jawaban surat by id_surat_masuk (khusus 1 surat masuk)
async function getJawabanSuratBySuratMasukId(req, res) {
  try {
    const { id } = req.params;
    const jawaban = await JawabanSurat.findAll({
      where: { id_surat_masuk: id },
      include: [{ model: SuratMasuk }]
    });
    res.status(200).json(jawaban);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// GET semua jawaban surat (untuk admin/petugas/user melihat semua balasan)
async function getAllJawabanSurat(req, res) {
  try {
    const jawaban = await JawabanSurat.findAll({
      include: [{ model: SuratMasuk }]
    });
    res.status(200).json(jawaban);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// POST jawaban surat
async function createJawabanSurat(req, res) {
  try {
    const { id_surat_masuk, tanggal_jawaban, isi_jawaban, file_path } = req.body;
    const newJawaban = await JawabanSurat.create({ id_surat_masuk, tanggal_jawaban, isi_jawaban, file_path });
    res.status(201).json(newJawaban);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export { getJawabanSuratBySuratMasukId, getAllJawabanSurat, createJawabanSurat };
