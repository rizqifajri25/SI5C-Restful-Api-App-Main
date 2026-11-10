const mongoose = require('mongoose');

const penerjemahSchema = new mongoose.Schema({
  kode: { type: String, required: [true, 'kode wajib diisi'], unique: true, trim: true },
  nama: { type: String, required: [true, 'nama wajib diisi'], trim: true },
});

module.exports = mongoose.model('Penerjemah', penerjemahSchema);