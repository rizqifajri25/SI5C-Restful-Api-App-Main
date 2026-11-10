require('dotenv').config();
const mongoose = require('mongoose'); 
const express = require('express');
const cors = require('cors');

const logger = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const orderTerjemahanRoutes = require('./routes/orderTerjemahanRoutes');
const fakultasRoutes = require('./routes/fakultasRoutes');
const penerjemahRoutes = require('./routes/penerjemahRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware global ----------
app.use(logger);
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// ---------- Route dasar ----------
app.get('/', (req, res) => {
  res.send('Server Express.js berjalan!');
});

// ---------- Route per modul ----------
app.use('/order-terjemahan', orderTerjemahanRoutes);
app.use('/fakultas', fakultasRoutes);
app.use('/penerjemah', penerjemahRoutes);

// ---------- Handler 404 dan error handler (paling bawah) ----------
app.use(notFoundHandler);
app.use(errorHandler);

// app.listen(PORT, () => {
//   console.log(`Server berjalan di http://localhost:${PORT}`);
// });

mongoose.connect(process.env.DB_URI)
  .then(() => {
    console.log('Terhubung ke MongoDB');
    app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Gagal terhubung:', err.message);
    process.exit(1);
  });