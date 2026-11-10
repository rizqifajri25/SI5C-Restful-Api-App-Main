const mongoose = require('mongoose');
const Counter = require('./counterModel');

const klienSchema = new mongoose.Schema({
  nama: String,
  email: String,
}, { _id: false });

const orderTerjemahanSchema = new mongoose.Schema({
  id: { type: Number, immutable: true },
  kodeOrder: { type: String, required: [true, 'kodeOrder wajib diisi'], unique: true, trim: true },
  judulDokumen: { type: String, required: [true, 'judulDokumen wajib diisi'], trim: true },
  jumlahHalaman: { type: Number, required: [true, 'jumlahHalaman wajib diisi'], min: [1, 'jumlahHalaman minimal 1'] },
  bahasa: { type: String, required: [true, 'bahasa wajib diisi'], trim: true },
  klien: klienSchema,
  penerjemahId: { type: mongoose.Schema.Types.ObjectId, ref: 'Penerjemah', required: [true, 'penerjemahId wajib diisi'] },
  createdAt: { type: Date, default: Date.now },
}, { id: false });

orderTerjemahanSchema.index(
  { id: 1 },
  { unique: true, partialFilterExpression: { id: { $type: 'number' } } }
);

orderTerjemahanSchema.pre('save', async function () {
  if (!this.isNew || this.id != null) return;

  const counterId = 'orderTerjemahan';
  let counterExists = await Counter.exists({ _id: counterId });

  if (!counterExists) {
    const highestOrder = await this.constructor.findOne({ id: { $type: 'number' } })
      .sort({ id: -1 })
      .select('id')
      .lean();

    try {
      await Counter.create({
        _id: counterId,
        sequence: highestOrder ? highestOrder.id : 0,
      });
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  this.id = counter.sequence;
});

module.exports = mongoose.model('OrderTerjemahan', orderTerjemahanSchema);
