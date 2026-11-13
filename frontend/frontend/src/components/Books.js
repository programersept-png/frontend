import React, { useState, useEffect } from 'react';
import API from '../api';
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react'; 

const Books = () => {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    quantity: ''
  });
  const [editing, setEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  
  // UI States
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null); // For success/error messages
  const [deleteId, setDeleteId] = useState(null); // For custom delete confirmation

  useEffect(() => {
    fetchBooks();
  }, []);

  // Show toast automatically after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchBooks = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await API.get('/api/books', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (editing) {
        await API.put(`/api/books/${currentBookId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToast({ type: 'success', message: 'Book updated successfully!' });
      } else {
        await API.post('/api/books', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToast({ type: 'success', message: 'Book added successfully!' });
      }

      setFormData({ title: '', author: '', quantity: '' });
      setEditing(false);
      setShowForm(false); 
      fetchBooks();

    } catch (error) {
      console.error('Error saving book:', error);
      setToast({ type: 'error', message: error.response?.data?.error || 'Error saving book' });
    }
  };

  const handleEdit = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      quantity: book.quantity
    });
    setEditing(true);
    setCurrentBookId(book.book_id);
    setShowForm(true); 
  };

  // Open custom confirm modal
  const confirmDelete = (bookId) => {
    setDeleteId(bookId);
  };

  // Actually delete after confirmation
  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await API.delete(`/api/books/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: 'success', message: 'Book deleted successfully!' });
      setDeleteId(null); // Close modal
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      setToast({ type: 'error', message: 'Error deleting book' });
      setDeleteId(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="books">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Books Management</h1>
        <button 
          className="add-btn" 
          onClick={() => {
            setEditing(false);
            setFormData({ title: '', author: '', quantity: '' });
            setShowForm(true);
          }}
        >
          <Plus size={18} /> Add New Book
        </button>
      </div>

      {/* ADD/EDIT FORM MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editing ? 'Edit Book' : 'Add New Book'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label>Book Title</label>
                <input type="text" name="title" placeholder="Enter book title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Author</label>
                <input type="text" name="author" placeholder="Enter author name" value={formData.author} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Quantity</label>
                <input type="number" name="quantity" placeholder="Enter quantity" value={formData.quantity} onChange={handleChange} required min="1" />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editing ? 'Update Book' : 'Add Book'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="modal-header">
              <h2>Delete Book?</h2>
            </div>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this book? This action cannot be undone.
            </p>
            <div className="form-actions">
              <button onClick={handleDelete} className="delete-confirm-btn">
                Yes, Delete
              </button>
              <button onClick={() => setDeleteId(null)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Books List Table */}
      <div className="books-list">
        <h2>Books List</h2>

        {books.length === 0 ? (
          <p>No books found. Add your first book above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Quantity</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td>{book.book_id}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.quantity}</td>
                  <td>{book.available_quantity}</td>
                  <td>
                    <button onClick={() => handleEdit(book)}>Edit</button>
                    <button onClick={() => confirmDelete(book.book_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Books;