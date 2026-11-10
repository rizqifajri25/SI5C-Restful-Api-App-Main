const mongoose = require('mongoose');
const OrderTerjemahan = require('../models/orderTerjemahanModel');
const { errorHttp } = require('../middlewares/errorHandler');

const LIMIT_DEFAULT = 10;
const LIMIT_MAKS = 50;
const FIELD_SORT = ['id', 'kodeOrder', 'judulDokumen', 'jumlahHalaman', 'bahasa', 'createdAt'];
const FIELD_BOLEH_DIPILIH = [
  'id',
  'kodeOrder',
  'judulDokumen',
  'jumlahHalaman',
  'bahasa',
  'klien',
  'penerjemahId',
  'createdAt',
];

function filterOrderDenganId(id) {
  if (/^\d+$/.test(id)) {
    return { id: Number(id) };
  }
  if (mongoose.isValidObjectId(id)) {
    return { _id: id };
  }
  throw errorHttp(400, 'ID order harus berupa angka');
}

function angkaAman(nilai, bawaan, min, maks) {
  const n = parseInt(nilai, 10);
  if (Number.isNaN(n)) return bawaan;
  return Math.min(Math.max(n, min), maks);
}

exports.create = async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.id;
    delete body._id;
    const data = await OrderTerjemahan.create(body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  const filter = {};
  if (req.query.bahasa) {
    filter.bahasa = String(req.query.bahasa).trim();
  }

  const page = angkaAman(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
  const limit = angkaAman(req.query.limit, LIMIT_DEFAULT, 1, LIMIT_MAKS);
  const sortParam = String(req.query.sort || '-createdAt');
  const arah = sortParam.startsWith('-') ? -1 : 1;
  const sortField = sortParam.replace(/^-/, '');
  if (!FIELD_SORT.includes(sortField)) {
    throw errorHttp(400, `sort hanya boleh: ${FIELD_SORT.join(', ')}`);
  }

  let select = '';
  if (req.query.fields) {
    const fields = String(req.query.fields).split(',').map((field) => field.trim());
    if (!fields.every((field) => FIELD_BOLEH_DIPILIH.includes(field))) {
      throw errorHttp(400, `fields hanya boleh: ${FIELD_BOLEH_DIPILIH.join(', ')}`);
    }
    select = fields.join(' ');
  }

  const query = OrderTerjemahan.find(filter)
    .select(select)
    .sort({ [sortField]: arah, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  if (!select || select.split(' ').includes('penerjemahId')) {
    query.populate('penerjemahId', 'kode nama');
  }

  const [data, total] = await Promise.all([
    query,
    OrderTerjemahan.countDocuments(filter),
  ]);

  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
};

exports.getById = async (req, res) => {
  const data = await OrderTerjemahan.findOne(filterOrderDenganId(req.params.id))
    .populate('penerjemahId', 'kode nama');
  if (!data) throw errorHttp(404, 'Data order terjemahan tidak ditemukan');
  res.json(data);
};

exports.update = async (req, res) => {
  const body = { ...req.body };
  delete body.id;
  delete body._id;
  const data = await OrderTerjemahan.findOneAndUpdate(
    filterOrderDenganId(req.params.id),
    body,
    { returnDocument: 'after', runValidators: true }
  ).populate('penerjemahId', 'kode nama');
  if (!data) throw errorHttp(404, 'Data order terjemahan tidak ditemukan');
  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await OrderTerjemahan.findOneAndDelete(filterOrderDenganId(req.params.id));
  if (!data) throw errorHttp(404, 'Data order terjemahan tidak ditemukan');
  res.status(204).send();
};
