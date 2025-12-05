const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // New Import
const { Server } = require('socket.io'); // New Import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- SOCKET.IO SETUP ---
const server = http.createServer(app); // Wrap Express in HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow your React Frontend
    methods: ["GET", "POST"]
  }
});

// Listen for connection events
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Join a specific chat room (Unique per book)
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    // Broadcast message to everyone in that room EXCEPT sender
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// --- MODELS ---
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  condition: String,
  location: String,
  imageUrl: String,
  owner: String,
  status: { type: String, default: 'Available' }
});
const Book = mongoose.model('Book', bookSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedBooks: [{ type: String }] 
});
const User = mongoose.model('User', userSchema);

// --- ROUTES ---
app.get('/api/books', async (req, res) => {
  try { const books = await Book.find(); res.json(books); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/books', async (req, res) => {
  try { const newBook = new Book(req.body); await newBook.save(); res.status(201).json(newBook); } 
  catch (error) { res.status(400).json({ error: error.message }); }
});

app.put('/api/books/:id', async (req, res) => {
  try { const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updatedBook); } 
  catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete('/api/books/:id', async (req, res) => {
  try { await Book.findByIdAndDelete(req.params.id); res.json({ message: "Book deleted" }); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already taken" });
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: "User created" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || user.password !== password) return res.status(400).json({ error: "Invalid credentials" });
    res.json({ token: "dummy-token-123", username: user.username });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/users/:username', async (req, res) => {
  try { const user = await User.findOne({ username: req.params.username }); res.json(user); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/users/wishlist/:bookId', async (req, res) => {
  try {
    const { username } = req.body;
    const bookId = req.params.bookId;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.savedBooks.indexOf(bookId);
    if (index === -1) user.savedBooks.push(bookId);
    else user.savedBooks.splice(index, 1);

    await user.save();
    res.json({ savedBooks: user.savedBooks, message: "Updated" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// IMPORTANT: Use server.listen, not app.listen
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});