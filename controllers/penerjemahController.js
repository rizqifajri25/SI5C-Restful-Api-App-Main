const Penerjemah = require('../models/penerjemahModel');

exports.create = async (req, res) => {
  try {
    const penerjemah = await Penerjemah.create(req.body);
    res.status(201).json(penerjemah);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  res.json(await Penerjemah.find());
};