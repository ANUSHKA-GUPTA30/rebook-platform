const mongoose = require('mongoose');
const Book = require('./models/Book');

// 1. Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/rebook')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error(err));

// 2. The New Data (Matched to your Categories)
const books = [
  // --- STUDYING ---
  { "title": "Concepts of Physics", "author": "H.C. Verma", "genre": "Studying", "condition": "Good", "location": "Delhi", "owner": "Rahul", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/12386927-L.jpg" },
  { "title": "Introduction to Algorithms", "author": "Cormen", "genre": "Studying", "condition": "Worn", "location": "Mumbai", "owner": "Sneha", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/36630-L.jpg" },
  { "title": "Organic Chemistry", "author": "Morrison & Boyd", "genre": "Studying", "condition": "Fair", "location": "Bangalore", "owner": "Amit", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/12537446-L.jpg" },
  { "title": "Cracking the Coding Interview", "author": "Gayle Laakmann", "genre": "Studying", "condition": "New", "location": "Pune", "owner": "Priya", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8254425-L.jpg" },
  { "title": "Head First Java", "author": "Kathy Sierra", "genre": "Studying", "condition": "Good", "location": "Hyderabad", "owner": "Vikram", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/36679-L.jpg" },
  { "title": "Biology Class 11", "author": "NCERT", "genre": "Studying", "condition": "Good", "location": "Chennai", "owner": "Anjali", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8756853-L.jpg" },
  { "title": "University Physics", "author": "Young & Freedman", "genre": "Studying", "condition": "New", "location": "Kolkata", "owner": "Rohan", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/10521873-L.jpg" },

  // --- COMIC ---
  { "title": "The Amazing Spider-Man", "author": "Stan Lee", "genre": "Comic", "condition": "Good", "location": "Mumbai", "owner": "Kabir", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/10600109-L.jpg" },
  { "title": "Naruto Vol. 1", "author": "Masashi Kishimoto", "genre": "Comic", "condition": "New", "location": "Delhi", "owner": "Aryan", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8233370-L.jpg" },
  { "title": "Tintin in Tibet", "author": "Herge", "genre": "Comic", "condition": "Old", "location": "Bangalore", "owner": "Meera", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8235212-L.jpg" },
  { "title": "Batman: The Killing Joke", "author": "Alan Moore", "genre": "Comic", "condition": "Good", "location": "Pune", "owner": "Siddharth", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8576472-L.jpg" },
  { "title": "One Piece Vol. 1", "author": "Eiichiro Oda", "genre": "Comic", "condition": "Fair", "location": "Chennai", "owner": "Luffy", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/7350732-L.jpg" },
  { "title": "Asterix the Gaul", "author": "Goscinny", "genre": "Comic", "condition": "Good", "location": "Goa", "owner": "Tara", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8766487-L.jpg" },
  { "title": "Watchmen", "author": "Alan Moore", "genre": "Comic", "condition": "Worn", "location": "Delhi", "owner": "Rorschach", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/6497276-L.jpg" },

  // --- PLAYFUL ---
  { "title": "Diary of a Wimpy Kid", "author": "Jeff Kinney", "genre": "Playful", "condition": "Good", "location": "Mumbai", "owner": "Greg", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8584873-L.jpg" },
  { "title": "Harry Potter and the Sorcerer's Stone", "author": "J.K. Rowling", "genre": "Playful", "condition": "New", "location": "London", "owner": "Harry", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/10522812-L.jpg" },
  { "title": "Charlie and the Chocolate Factory", "author": "Roald Dahl", "genre": "Playful", "condition": "Fair", "location": "Bangalore", "owner": "Wonka", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/10492809-L.jpg" },
  { "title": "The Cat in the Hat", "author": "Dr. Seuss", "genre": "Playful", "condition": "Good", "location": "USA", "owner": "Sam", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8354719-L.jpg" },
  { "title": "Geronimo Stilton", "author": "Elisabetta Dami", "genre": "Playful", "condition": "New", "location": "Italy", "owner": "Mouse", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8258287-L.jpg" },
  { "title": "Matilda", "author": "Roald Dahl", "genre": "Playful", "condition": "Good", "location": "UK", "owner": "Trunchbull", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/7891724-L.jpg" },

  // --- FICTION ---
  { "title": "The Alchemist", "author": "Paulo Coelho", "genre": "Fiction", "condition": "Good", "location": "Brazil", "owner": "Santiago", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/7360060-L.jpg" },
  { "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "genre": "Fiction", "condition": "Old", "location": "New York", "owner": "Nick", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/7222246-L.jpg" },
  { "title": "To Kill a Mockingbird", "author": "Harper Lee", "genre": "Fiction", "condition": "Worn", "location": "Alabama", "owner": "Scout", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/1261770-L.jpg" },
  { "title": "The Kite Runner", "author": "Khaled Hosseini", "genre": "Fiction", "condition": "Good", "location": "Kabul", "owner": "Amir", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8231583-L.jpg" },
  { "title": "Life of Pi", "author": "Yann Martel", "genre": "Fiction", "condition": "New", "location": "Canada", "owner": "Pi", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8367963-L.jpg" },

  // --- CLASSIC ---
  { "title": "Pride and Prejudice", "author": "Jane Austen", "genre": "Classic", "condition": "Good", "location": "UK", "owner": "Elizabeth", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8136357-L.jpg" },
  { "title": "1984", "author": "George Orwell", "genre": "Classic", "condition": "Fair", "location": "London", "owner": "Winston", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/7222247-L.jpg" },
  { "title": "Moby Dick", "author": "Herman Melville", "genre": "Classic", "condition": "Worn", "location": "Sea", "owner": "Ahab", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/7222262-L.jpg" },
  { "title": "War and Peace", "author": "Leo Tolstoy", "genre": "Classic", "condition": "Old", "location": "Russia", "owner": "Pierre", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/7222264-L.jpg" },
  { "title": "The Odyssey", "author": "Homer", "genre": "Classic", "condition": "Good", "location": "Greece", "owner": "Odysseus", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8233373-L.jpg" },

  // --- BIOGRAPHY ---
  { "title": "Steve Jobs", "author": "Walter Isaacson", "genre": "Biography", "condition": "New", "location": "California", "owner": "AppleFan", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/12555624-L.jpg" },
  { "title": "Wings of Fire", "author": "A.P.J. Abdul Kalam", "genre": "Biography", "condition": "Good", "location": "India", "owner": "Student", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8254425-L.jpg" },
  { "title": "Becoming", "author": "Michelle Obama", "genre": "Biography", "condition": "New", "location": "USA", "owner": "Reader", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/8336336-L.jpg" },
  { "title": "The Diary of a Young Girl", "author": "Anne Frank", "genre": "Biography", "condition": "Old", "location": "Amsterdam", "owner": "Anne", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/10522812-L.jpg" },
  { "title": "Elon Musk", "author": "Ashlee Vance", "genre": "Biography", "condition": "Good", "location": "Texas", "owner": "Techie", "status": "Available", "imageUrl": "https://covers.openlibrary.org/b/id/12555624-L.jpg" }
];

// 3. Insert Data
const seedDB = async () => {
  await Book.deleteMany({}); // Clears old data
  await Book.insertMany(books); // Inserts new data
  console.log('✅ 35 Books Added Successfully!');
  mongoose.connection.close();
};

seedDB();