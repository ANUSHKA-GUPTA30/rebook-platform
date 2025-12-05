const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

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

// Reliable Public Image URLs (Open Library) - NO COORDINATES
const books = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", condition: "Good", location: "Central Library", owner: "admin", imageUrl: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg" },
  { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", condition: "Fair", location: "North Campus", owner: "admin", imageUrl: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg" },
  { title: "1984", author: "George Orwell", genre: "Fiction", condition: "New", location: "Student Union", owner: "admin", imageUrl: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg" },
  { title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", condition: "Good", location: "Main Hall", owner: "admin", imageUrl: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg" },
  { title: "The Kite Runner", author: "Khaled Hosseini", genre: "Fiction", condition: "Good", location: "Dorm A", owner: "admin", imageUrl: "https://covers.openlibrary.org/b/isbn/9781594631931-L.jpg" },
  { title: "Atomic Habits", author: "James Clear", genre: "Studying", condition: "New", location: "Home Library", owner: "admin", imageUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" },
  { title: "Clean Code", author: "Robert C. Martin", genre: "Studying", condition: "Good", location: "Tech Park", owner: "admin", imageUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg" },
  { title: "Steve Jobs", author: "Walter Isaacson", genre: "Biography", condition: "Good", location: "Biz School", owner: "admin", imageUrl: "https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg" },
  { title: "Becoming", author: "Michelle Obama", genre: "Biography", condition: "New", location: "Main Hall", owner: "admin", imageUrl: "https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg" },
  { title: "Harry Potter", author: "J.K. Rowling", genre: "Playful", condition: "Good", location: "Library", owner: "admin", imageUrl: "https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to Database");
    
    await Book.deleteMany({});
    console.log("🧹 Old books cleared");

    await Book.insertMany(books);
    console.log("📚 Books Successfully Added (No Map Data)!");
    
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();