import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaMapMarkerAlt, FaExchangeAlt, FaPlus, FaCheckCircle, FaClock, FaSearch, FaUser, FaSignOutAlt, FaHandshake } from 'react-icons/fa';

function App() {
  // --- STATE ---
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });

  const [books, setBooks] = useState([]);
  const [view, setView] = useState('home'); 
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const genres = ['Studying', 'Comic', 'Playful', 'Fiction', 'Classic', 'Biography'];

  const [form, setForm] = useState({
    title: '', author: '', genre: 'Studying', condition: 'Good', location: '', imageUrl: ''
  });

  // --- INITIAL LOAD ---
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser({ username: savedUser });
      fetchBooks();
    }
  }, []);

  // --- AUTH HANDLERS ---
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
      } else {
        alert('Registration Successful! Please Login.');
        setAuthMode('login');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    setBooks([]);
    setView('home');
  };

  // --- DATA HANDLERS ---
  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books');
      setBooks(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookData = { ...form, owner: user.username };
      await axios.post('http://localhost:5000/api/books', bookData);
      alert('Book Added!');
      setForm({ title: '', author: '', genre: 'Studying', condition: 'Good', location: '', imageUrl: '' });
      setView('home');
      fetchBooks();
    } catch (err) { alert('Error adding book'); }
  };

  // Request Book
  const handleRequest = async (id) => {
    const updatedBooks = books.map(b => b._id === id ? { ...b, status: 'Pending Exchange' } : b);
    setBooks(updatedBooks); 
    try { await axios.put(`http://localhost:5000/api/books/${id}`, { status: 'Pending Exchange' }); } 
    catch (err) { console.error(err); fetchBooks(); }
  };

  // Accept Request
  const handleAccept = async (id) => {
    const updatedBooks = books.map(b => b._id === id ? { ...b, status: 'Exchanged' } : b);
    setBooks(updatedBooks); 
    try { await axios.put(`http://localhost:5000/api/books/${id}`, { status: 'Exchanged' }); } 
    catch (err) { console.error(err); fetchBooks(); }
  };

  // --- FILTER LOGIC ---
  const filteredBooks = books.filter(book => {
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  // --- RENDER LOGIN ---
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm">
          <h1 className="text-4xl font-bold text-center text-blue-600 mb-2 flex justify-center items-center gap-2"><FaBook /> ReBook</h1>
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6 mt-6">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-md font-bold transition ${authMode === 'login' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Login</button>
            <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 rounded-md font-bold transition ${authMode === 'register' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Sign Up</button>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input className="w-full p-3 border rounded-lg" placeholder="Username" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required />
            <input className="w-full p-3 border rounded-lg" type="password" placeholder="Password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">{authMode === 'login' ? 'Login' : 'Create Account'}</button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER APP ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <nav className="bg-blue-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}><FaBook /> ReBook</h1>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-2 bg-blue-700 px-3 py-1 rounded-full"><FaUser /><span className="font-semibold">{user?.username}</span></span>
            <button onClick={logout} className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white font-bold flex items-center gap-1"><FaSignOutAlt /> Logout</button>
            <button onClick={() => setView(view === 'home' ? 'add' : 'home')} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-100">{view === 'home' ? <><FaPlus /> Add Book</> : 'Browse'}</button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {view === 'home' && (
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 rounded-full border shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => setSelectedGenre('All')} className={`px-4 py-2 rounded-full font-semibold ${selectedGenre === 'All' ? 'bg-blue-600 text-white' : 'bg-white'}`}>All</button>
              {genres.map(genre => (<button key={genre} onClick={() => setSelectedGenre(genre)} className={`px-4 py-2 rounded-full font-semibold ${selectedGenre === genre ? 'bg-blue-600 text-white shadow-md' : 'bg-white'}`}>{genre}</button>))}
            </div>
          </div>
        )}

        {view === 'add' && (
          <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Share a Book</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full p-2 border rounded" placeholder="Title" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <input className="w-full p-2 border rounded" placeholder="Author" required value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
              <div className="flex gap-2"><div className="w-1/2"><select className="w-full p-2 border rounded" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})}>{genres.map(g => <option key={g} value={g}>{g}</option>)}</select></div><div className="w-1/2"><select className="w-full p-2 border rounded" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}><option>New</option><option>Good</option><option>Fair</option><option>Worn</option></select></div></div>
              <input className="w-full p-2 border rounded" placeholder="City" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              <input className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed" value={user?.username} disabled />
              <input className="w-full p-2 border rounded" placeholder="Image URL (optional)" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
              <button className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">Submit Book</button>
            </form>
          </div>
        )}

        {view === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredBooks.map(book => {
              
              // 🔥 Clean Case Insensitive Check 🔥
              const isOwner = user?.username && book.owner && user.username.trim().toLowerCase() === book.owner.trim().toLowerCase();

              return (
                <div key={book._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="h-48 bg-gray-200 relative"><img src={book.imageUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover"/></div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold truncate">{book.title}</h3>
                    <p className="text-gray-600">{book.author}</p>
                    <p className="text-sm text-gray-500 mt-2 flex justify-between"><span><FaMapMarkerAlt className="inline"/> {book.location}</span><span className="bg-blue-100 text-blue-800 px-2 rounded text-xs py-1">{book.genre}</span></p>
                    <div className="mt-3 text-xs text-gray-400"><FaUser className="inline"/> Owner: {book.owner}</div>
                    
                    <div className="mt-4">
                      {isOwner && book.status === 'Pending Exchange' && (
                        <button onClick={() => handleAccept(book._id)} className="w-full py-2 rounded font-bold flex justify-center items-center gap-2 bg-green-500 text-white hover:bg-green-600">
                          <FaHandshake /> Accept Request
                        </button>
                      )}

                      {!isOwner && book.status === 'Pending Exchange' && (
                        <button disabled className="w-full py-2 rounded font-bold flex justify-center items-center gap-2 bg-yellow-500 text-white cursor-not-allowed">
                          <FaClock /> Pending...
                        </button>
                      )}

                      {!isOwner && book.status === 'Available' && (
                        <button onClick={() => handleRequest(book._id)} className="w-full py-2 rounded font-bold flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                          <FaExchangeAlt /> Request
                        </button>
                      )}

                      {isOwner && book.status === 'Available' && (
                        <button disabled className="w-full py-2 rounded font-bold bg-gray-100 text-gray-500 cursor-default">
                          Your Book
                        </button>
                      )}

                      {book.status === 'Exchanged' && (
                        <button disabled className="w-full py-2 rounded font-bold flex justify-center items-center gap-2 bg-gray-400 text-white cursor-not-allowed">
                          <FaCheckCircle /> Exchanged
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;