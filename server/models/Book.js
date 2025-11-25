const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: String,
  condition: String,
  location: String,
  owner: String,
  status: { type: String, default: 'Available' },
  imageUrl: String
});

module.exports = mongoose.model('Book', BookSchema);