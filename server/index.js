const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: ".env" });
const connection = require("./src/database/db");
const bookModal = require('./src/models/book');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/books', async (req, res) => {
  try {
    const books = await bookModal.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new book
app.post('/books', async (req, res) => {
  const book = new bookModal({
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
  });

  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE book
app.delete('/books/:id', async (req, res) => {
  try {
    await bookModal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;


app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to our website" });
});

app.listen(PORT, async () => {
  await connection;
  console.log(`server start at ${PORT}`);
});
