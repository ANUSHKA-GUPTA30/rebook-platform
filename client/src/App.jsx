import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client'; // Import Socket.io
import { FaBook, FaMapMarkerAlt, FaExchangeAlt, FaPlus, FaCheckCircle, FaClock, FaSearch, FaUser, FaSignOutAlt, FaHandshake, FaTimes, FaTrash, FaEdit, FaHeart, FaRegHeart, FaCommentDots, FaPaperPlane } from 'react-icons/fa';

// Connect to Backend Socket
const socket = io.connect("http://localhost:5000");

const Toast = ({ message, onClose }) => (
  <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce z-50">
    <div className="bg-green-500 rounded-full p-1"><FaCheckCircle className="text-white text-xs"/></div>
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="text-gray-400 hover:text-white ml-4"><FaTimes /></button>
  </div>
);

// --- NEW: CHAT COMPONENT ---
const ChatBox = ({ book, user, onClose }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    // Join a room based on Book ID
    if(book?._id) {
        socket.emit("join_room", book._id);
    }
    
    // Listen for incoming messages
    const handler = (data) => {
      setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", handler);

    // Cleanup on close
    return () => socket.off("receive_message", handler);
  }, [book]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: book._id,
        author: user.username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  return (
    <div className="fixed bottom-20 right-5 w-80 bg-white rounded-t-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden font-sans">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center rounded-t-xl">
            <div>
                <h3 className="font-bold flex items-center gap-2"><FaCommentDots /> Chat</h3>
                <p className="text-xs opacity-90">Discussing: {book.title.substring(0, 15)}...</p>
            </div>
            <button onClick={onClose}><FaTimes /></button>
        </div>
        <div className="h-64 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-2">
            {messageList.map((msg, idx) => {
                const isMe = msg.author === user.username;
                return (
                    <div key={idx} className={`max-w-[80%] p-2 rounded-lg text-sm ${isMe ? "bg-blue-500 text-white self-end rounded-br-none" : "bg-gray-200 text-gray-800 self-start rounded-bl-none"}`}>
                        <p className="font-bold text-[10px] opacity-70 mb-1">{msg.author}</p>
                        <p>{msg.message}</p>
                        <p className="text-[9px] text-right mt-1 opacity-70">{msg.time}</p>
                    </div>
                );
            })}
        </div>
        <div className="p-2 bg-white border-t flex gap-2">
            <input 
                type="text" 
                value={currentMessage} 
                onChange={(event) => setCurrentMessage(event.target.value)}
                onKeyPress={(event) => event.key === "Enter" && sendMessage()}
                placeholder="Type a message..." 
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"><FaPaperPlane /></button>
        </div>
    </div>
  );
};

const HeroSection = ({ onStart }) => (
  <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-24 px-6 text-center mb-12 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
    <div className="relative z-10 max-w-4xl mx-auto">
      <h1 className="text-6xl font-extrabold mb-6 tracking-tight leading-tight">Give a Book. <span className="text-yellow-300">Get a Story.</span></h1>
      <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10 font-light">Join the circular reading economy. Exchange your old favorites for new adventures within your community.</p>
      <div className="flex justify-center gap-4">
        <button onClick={onStart} className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition transform flex items-center gap-2"><FaPlus /> Start Sharing</button>
        <button className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition">Browse Library</button>
      </div>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [toastMsg, setToastMsg] = useState('');

  const [books, setBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]); 
  const [view, setView] = useState('home'); 
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editBookId, setEditBookId] = useState(null);
  
  // --- CHAT STATE ---
  const [activeChatBook, setActiveChatBook] = useState(null); // The book we are discussing

  const genres = ['Studying', 'Comic', 'Playful', 'Fiction', 'Classic', 'Biography'];
  const [form, setForm] = useState({ title: '', author: '', genre: 'Studying', condition: 'Good', location: '', imageUrl: '' });

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 4000); };

  const fetchUserData = async (username) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${username}`);
      if(res.data?.savedBooks) setWishlist(res.data.savedBooks);
    } catch (err) { console.error("Error fetching user data", err); }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser({ username: savedUser });
      fetchBooks();
      fetchUserData(savedUser); 
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? 'login' : 'register';
    try {
      const res = await axios.post(`http://localhost:5000/api/${endpoint}`, authForm);
      if (authMode === 'login') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        setToken(res.data.token);
        setUser({ username: res.data.username });
        fetchBooks();
        fetchUserData(res.data.username);
        showToast(`Welcome back, ${res.data.username}! 👋`);
      } else {
        showToast('Registration Successful! Please Login.');
        setAuthMode('login');
      }
    } catch (err) { alert(err.response?.data?.error || 'Authentication failed'); }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null); setUser(null); setBooks([]); setWishlist([]); setView('home');
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books');
      setBooks(res.data);
    } catch (err) { console.error(err); }
  };

  const toggleWishlist = async (bookId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/users/wishlist/${bookId}`, { username: user.username });
      setWishlist(res.data?.savedBooks || []);
      showToast(res.data.message.includes('Added') ? 'Added to Wishlist ❤️' : 'Removed from Wishlist 💔');
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookData = { ...form, owner: user.username };
      if (editBookId) {
        await axios.put(`http://localhost:5000/api/books/${editBookId}`, bookData);
        showToast('Book updated successfully! ✏️');
      } else {
        await axios.post('http://localhost:5000/api/books', bookData);
        showToast('Book successfully listed! 📚');
      }
      setForm({ title: '', author: '', genre: 'Studying', condition: 'Good', location: '', imageUrl: '' });
      setEditBookId(null);
      setView('home');
      fetchBooks();
    } catch (err) { alert('Error saving book'); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to remove this book?")) return;
    const newBooks = books.filter(b => b._id !== id);
    setBooks(newBooks);
    showToast('Book deleted successfully 🗑️');
    try { await axios.delete(`http://localhost:5000/api/books/${id}`); } catch (err) { console.error(err); fetchBooks(); }
  };

  const handleRequest = async (id) => {
    const updatedBooks = books.map(b => b._id === id ? { ...b, status: 'Pending Exchange' } : b);
    setBooks(updatedBooks); 
    showToast('Request sent! Waiting for approval ⏳');
    try { await axios.put(`http://localhost:5000/api/books/${id}`, { status: 'Pending Exchange' }); } catch (err) { console.error(err); fetchBooks(); }
  };

  const handleAccept = async (id) => {
    const updatedBooks = books.map(b => b._id === id ? { ...b, status: 'Exchanged' } : b);
    setBooks(updatedBooks); 
    showToast('Exchange confirmed! 🎉');
    try { await axios.put(`http://localhost:5000/api/books/${id}`, { status: 'Exchanged' }); } catch (err) { console.error(err); fetchBooks(); }
  };

  const handleEditClick = (book) => {
    setEditBookId(book._id);
    setForm({ title: book.title, author: book.author, genre: book.genre, condition: book.condition, location: book.location, imageUrl: book.imageUrl });
    setView('add');
  };

  const filteredBooks = books.filter(book => {
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const myBooks = books.filter(book => user?.username && book.owner && user.username.toLowerCase() === book.owner.toLowerCase());
  const savedBooksList = books.filter(book => wishlist.includes(book._id)); 

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm transform hover:scale-105 transition duration-500">
          <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-2 flex justify-center items-center gap-2"><FaBook /> ReBook</h1>
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6"><button onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-md font-bold transition ${authMode === 'login' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Login</button><button onClick={() => setAuthMode('register')} className={`flex-1 py-2 rounded-md font-bold transition ${authMode === 'register' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Sign Up</button></div>
          <form onSubmit={handleAuth} className="space-y-5"><input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Username" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required /><input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" type="password" placeholder="Password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required /><button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition transform active:scale-95">{authMode === 'login' ? 'Enter Library' : 'Join Now'}</button></form>
        </div>
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold flex items-center gap-2 cursor-pointer text-blue-600" onClick={() => setView('home')}><FaBook /> ReBook</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setView('profile')} className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-100 transition"><FaUser /> {user?.username}</button>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 font-bold transition flex items-center gap-1"><FaSignOutAlt /> <span className="hidden sm:inline">Logout</span></button>
            <button onClick={() => { setView('add'); setEditBookId(null); setForm({ title: '', author: '', genre: 'Studying', condition: 'Good', location: '', imageUrl: '' }); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition flex items-center gap-2"><FaPlus /> Add Book</button>
          </div>
        </div>
      </nav>

      {view === 'home' && !searchTerm && selectedGenre === 'All' && <HeroSection onStart={() => setView('add')} />}

      <div className="container mx-auto px-6 py-8">
        {view === 'profile' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-gray-100 flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-6xl shadow-lg">{user?.username ? user.username[0].toUpperCase() : 'U'}</div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-2">{user?.username}</h2>
                <div className="flex gap-6 mt-6 justify-center md:justify-start">
                  <div className="bg-blue-50 px-6 py-3 rounded-2xl text-center"><span className="block text-2xl font-bold text-blue-600">{myBooks.length}</span><span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Books Shared</span></div>
                  <div className="bg-red-50 px-6 py-3 rounded-2xl text-center"><span className="block text-2xl font-bold text-red-500">{wishlist.length}</span><span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Wishlist</span></div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FaHeart className="text-red-500"/> My Wishlist</h3>
            {savedBooksList.length === 0 ? <p className="text-gray-400 mb-10">No favorites yet. Click the heart icon on books!</p> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {savedBooksList.map(book => (
                  <div key={book._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4">
                    <img src={book.imageUrl} className="w-20 h-24 object-cover rounded-lg bg-gray-200"/>
                    <div>
                      <h4 className="font-bold text-gray-800 line-clamp-1">{book.title}</h4>
                      <p className="text-sm text-gray-500">{book.author}</p>
                      <button onClick={() => toggleWishlist(book._id)} className="text-red-500 text-sm font-bold mt-2 hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FaBook className="text-blue-500"/> My Inventory</h3>
            {myBooks.length === 0 ? <p className="text-gray-400">No books listed.</p> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {myBooks.map(book => (
                  <div key={book._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden flex flex-col relative">
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      <img src={book.imageUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover"/>
                      <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full shadow-md bg-white/90 ${book.status === 'Available' ? 'text-green-700' : 'text-yellow-700'}`}>{book.status}</span>
                      <div className="absolute top-3 left-3 flex gap-2"><button onClick={() => handleEditClick(book)} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition"><FaEdit /></button><button onClick={() => handleDelete(book._id)} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition"><FaTrash /></button></div>
                    </div>
                    <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{book.title}</h3>
                        {book.status === 'Pending Exchange' && (
                            <div className='flex gap-2 mt-2'>
                                <button onClick={() => handleAccept(book._id)} className="flex-1 py-2 rounded-lg font-bold flex justify-center items-center gap-2 bg-green-500 text-white hover:bg-green-600 text-xs"><FaHandshake /> Accept</button>
                                {/* CHAT BUTTON FOR OWNER */}
                                <button onClick={() => setActiveChatBook(book)} className="flex-1 py-2 rounded-lg font-bold flex justify-center items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 text-xs"><FaCommentDots /> Chat</button>
                            </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'home' && (
          <div className="flex flex-col items-center gap-8 mb-12">
            <div className="relative w-full max-w-2xl group"><FaSearch className="absolute left-5 top-4 text-gray-400 group-focus-within:text-blue-500 transition" /><input type="text" placeholder="Search by Title or Author..." className="w-full pl-14 pr-6 py-3.5 rounded-full border border-gray-200 bg-white shadow-sm focus:shadow-md focus:border-blue-500 focus:outline-none transition-all text-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="flex flex-wrap justify-center gap-3"><button onClick={() => setSelectedGenre('All')} className={`px-5 py-2 rounded-full font-bold transition ${selectedGenre === 'All' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>All</button>{genres.map(genre => (<button key={genre} onClick={() => setSelectedGenre(genre)} className={`px-5 py-2 rounded-full font-bold transition ${selectedGenre === genre ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>{genre}</button>))}</div>
          </div>
        )}

        {view === 'add' && (
          <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-extrabold mb-8 text-gray-800">{editBookId ? 'Edit Book Details' : 'Contribute to the Library'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Title</label><input className="w-full p-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Book Title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div><div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Author</label><input className="w-full p-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Author Name" required value={form.author} onChange={e => setForm({...form, author: e.target.value})} /></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Genre</label><select className="w-full p-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})}>{genres.map(g => <option key={g} value={g}>{g}</option>)}</select></div><div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Condition</label><select className="w-full p-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}><option>New</option><option>Good</option><option>Fair</option><option>Worn</option></select></div></div>
              <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</label><input className="w-full p-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="City / Campus" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cover Image (URL)</label><input className="w-full p-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} /></div>
              <div className="pt-4 flex gap-4"><button type="button" onClick={() => { setView('home'); setEditBookId(null); }} className="flex-1 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button><button className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-600/30 transition transform active:scale-95">{editBookId ? 'Update Book' : 'Post Book'}</button></div>
            </form>
          </div>
        )}

        {view === 'home' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBooks.map(book => {
              const isOwner = user?.username && book.owner && user.username.trim().toLowerCase() === book.owner.trim().toLowerCase();
              const isSaved = wishlist.includes(book._id); 

              return (
                <div key={book._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden flex flex-col relative">
                  <div className="h-64 bg-gray-100 relative overflow-hidden">
                    <img src={book.imageUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full shadow-md uppercase tracking-wider bg-white/90 backdrop-blur-sm ${book.status === 'Available' ? 'text-green-700' : 'text-yellow-700'}`}>{book.status}</span>
                    
                    {!isOwner && (
                      <button 
                        onClick={() => toggleWishlist(book._id)}
                        className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-lg transition hover:scale-110"
                      >
                        {isSaved ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400" />}
                      </button>
                    )}

                    {isOwner && (<div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition"><button onClick={() => handleEditClick(book)} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition"><FaEdit /></button><button onClick={() => handleDelete(book._id)} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition"><FaTrash /></button></div>)}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2"><span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">{book.genre}</span><span className="text-xs text-gray-400 flex items-center gap-1"><FaMapMarkerAlt /> {book.location}</span></div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-gray-500 font-medium mb-4">by {book.author}</p>
                    <div className="mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2 mb-4"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">{book.owner ? book.owner[0].toUpperCase() : '?'}</div><span className="text-xs text-gray-500 font-medium">{isOwner ? 'You' : book.owner}</span></div>
                      
                      {isOwner && book.status === 'Pending Exchange' && (
                          <div className='flex gap-2'>
                              <button onClick={() => handleAccept(book._id)} className="flex-1 py-2 rounded-lg font-bold flex justify-center items-center gap-2 bg-green-500 text-white hover:bg-green-600 text-xs"><FaHandshake /> Accept</button>
                              {/* CHAT BUTTON FOR OWNER */}
                              <button onClick={() => setActiveChatBook(book)} className="flex-1 py-2 rounded-lg font-bold flex justify-center items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 text-xs"><FaCommentDots /> Chat</button>
                          </div>
                      )}
                      {!isOwner && book.status === 'Pending Exchange' && (
                          <div className="flex gap-2">
                             <button disabled className="flex-1 py-2 rounded-lg font-bold flex justify-center items-center gap-2 bg-yellow-100 text-yellow-700 cursor-not-allowed text-xs"><FaClock /> Pending</button>
                             {/* CHAT BUTTON FOR REQUESTER */}
                             <button onClick={() => setActiveChatBook(book)} className="flex-1 py-2 rounded-lg font-bold flex justify-center items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 text-xs"><FaCommentDots /> Chat</button>
                          </div>
                      )}

                      {!isOwner && book.status === 'Available' && (<button onClick={() => handleRequest(book._id)} className="w-full py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition"><FaExchangeAlt /> Request Exchange</button>)}
                      {isOwner && book.status === 'Available' && (<button disabled className="w-full py-2.5 rounded-lg font-bold bg-gray-50 text-gray-400 border border-gray-200 cursor-default">Your Book</button>)}
                      {book.status === 'Exchanged' && (<button disabled className="w-full py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 bg-gray-100 text-gray-400 cursor-not-allowed"><FaCheckCircle /> Exchanged</button>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- FLOATING CHAT BOX --- */}
        {activeChatBook && (
            <ChatBox book={activeChatBook} user={user} onClose={() => setActiveChatBook(null)} />
        )}

        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
      </div>
    </div>
  );
}

export default App;