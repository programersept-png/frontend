import React, { useState, useEffect } from 'react';
import API from '../api';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    quantity: ''
  });
  const [editing, setEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

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
      } else {
        await API.post('/api/books', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setFormData({ title: '', author: '', quantity: '' });
      setEditing(false);
      fetchBooks();

    } catch (error) {
      console.error('Error saving book:', error);
      alert(error.response?.data?.error || 'Error saving book');
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
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      const token = localStorage.getItem('token');

      try {
        await API.delete(`/api/books/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="books">
      <h1>Books Management</h1>

      <div className="form-container">
        <h2>{editing ? 'Edit Book' : 'Add New Book'}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Book Title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="author"
            placeholder="Author"
            value={formData.author}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="1"
          />

          <button type="submit">
            {editing ? 'Update' : 'Add'} Book
          </button>

          {editing && (
            <button type="button" onClick={() => {
              setEditing(false);
              setFormData({ title: '', author: '', quantity: '' });
            }}>
              Cancel
            </button>
          )}
        </form>
      </div>

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
                    <button onClick={() => handleDelete(book.book_id)}>Delete</button>
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
