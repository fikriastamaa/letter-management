import SuratMasuk from '../models/SuratModel.js';

// GET all surat masuk
async function getSuratMasuk(req, res) {
  try {
    const result = await SuratMasuk.findAll();
    res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// POST surat masuk
async function createSuratMasuk(req, res) {
  try {
    const { no_surat, tanggal, pengirim, perihal, file_path } = req.body;
    const newSurat = await SuratMasuk.create({ no_surat, tanggal, pengirim, perihal, file_path });
    res.status(201).json(newSurat);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// PUT surat masuk
async function updateSuratMasuk(req, res) {
  try {
    const { id } = req.params;
    const updateInput = req.body;
    const surat = await SuratMasuk.findByPk(id);
    if (!surat) {
      return res.status(404).json({ message: 'Surat masuk not found' });
    }
    await surat.update(updateInput);
    res.status(200).json({ message: 'Surat masuk updated successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// DELETE surat masuk
async function deleteSuratMasuk(req, res) {
  try {
    const { id } = req.params;
    const surat = await SuratMasuk.findByPk(id);
    if (!surat) {
      return res.status(404).json({ message: 'Surat masuk not found' });
    }
    await surat.destroy();
    res.status(200).json({ message: 'Surat masuk deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// UPDATE status surat masuk
async function updateStatusSurat(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['Menunggu Jawaban', 'Selesai', 'Ditolak'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }
    const surat = await SuratMasuk.findByPk(id);
    if (!surat) {
      return res.status(404).json({ message: 'Surat masuk not found' });
    }
    await surat.update({ status });
    res.status(200).json({ message: `Status surat berhasil diubah menjadi '${status}'` });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export { getSuratMasuk, createSuratMasuk, updateSuratMasuk, deleteSuratMasuk, updateStatusSurat };