const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

// Book Schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  });

const bookModal = mongoose.model("Book", bookSchema);

module.exports = bookModal;