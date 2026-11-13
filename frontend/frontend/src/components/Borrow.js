import React, { useState, useEffect } from 'react';
import API from '../api';
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react';

const Borrow = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);

  const [formData, setFormData] = useState({
    student_id: '',
    book_id: '',
    borrow_date: ''
  });

  // UI States
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [returnId, setReturnId] = useState(null); // For Return confirmation modal

  useEffect(() => {
    fetchData();
    fetchBorrowedBooks();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [studentsRes, booksRes] = await Promise.all([
        API.get('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
        API.get('/api/books', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStudents(studentsRes.data);
      setBooks(booksRes.data.filter(book => book.available_quantity > 0));

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchBorrowedBooks = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await API.get('/api/borrow/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBorrowedBooks(response.data);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    }
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await API.post('/api/borrow', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData({ student_id: '', book_id: '', borrow_date: '' });
      setShowForm(false); // Close modal
      setToast({ type: 'success', message: 'Book borrowed successfully!' });
      fetchData();
      fetchBorrowedBooks();

    } catch (error) {
      console.error('Error borrowing book:', error);
      setToast({ type: 'error', message: error.response?.data?.error || 'Error borrowing book' });
    }
  };

  // Open custom confirm modal
  const confirmReturn = (borrowId) => {
    setReturnId(borrowId);
  };

  // Actually return after confirmation
  const handleReturn = async () => {
    const token = localStorage.getItem('token');
    try {
      await API.put(`/api/return/${returnId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setToast({ type: 'success', message: 'Book returned successfully!' });
      setReturnId(null); // Close modal
      fetchData();
      fetchBorrowedBooks();

    } catch (error) {
      console.error('Error returning book:', error);
      setToast({ type: 'error', message: 'Error returning book' });
      setReturnId(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="borrow">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Borrow / Return</h1>
        <button 
          className="add-btn" 
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} /> Borrow a Book
        </button>
      </div>

      {/* BORROW FORM MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Borrow a Book</h2>
              <button type="button" onClick={() => setShowForm(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleBorrow} className="modal-form">
              <div className="input-group">
                <label>Select Student</label>
                <select 
                  name="student_id" 
                  value={formData.student_id} 
                  onChange={handleChange} 
                  required
                  className="modal-select"
                >
                  <option value="">Choose a student...</option>
                  {students.map(student => (
                    <option key={student._id} value={student.student_id}>
                      {student.name} - {student.class}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Select Book</label>
                <select 
                  name="book_id" 
                  value={formData.book_id} 
                  onChange={handleChange} 
                  required
                  className="modal-select"
                >
                  <option value="">Choose a book...</option>
                  {books.map(book => (
                    <option key={book._id} value={book.book_id}>
                      {book.title} (Available: {book.available_quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Borrow Date (Optional)</label>
                <input
                  type="date"
                  name="borrow_date"
                  value={formData.borrow_date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Confirm Borrow
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN CONFIRMATION MODAL */}
      {returnId && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="modal-header">
              <h2>Return Book?</h2>
            </div>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
              Are you sure you want to mark this book as returned?
            </p>
            <div className="form-actions">
              <button onClick={handleReturn} className="save-btn">
                Yes, Return
              </button>
              <button onClick={() => setReturnId(null)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Borrowed Books Table */}
      <div className="borrowed-list">
        <h2>Currently Borrowed Books</h2>

        {borrowedBooks.length === 0 ? (
          <p>No books are currently borrowed.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Book Title</th>
                <th>Borrow Date</th>
                <th>Days Borrowed</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {borrowedBooks.map((borrow) => (
                <tr key={borrow.borrow_id}>
                  <td>{borrow.student_name} <br/><small style={{color:'#9ca3af'}}>ID: {borrow.student_id}</small></td>
                  <td>{borrow.book_title}</td>
                  <td>{new Date(borrow.borrow_date).toLocaleDateString()}</td>
                  <td>
                    <span style={{ 
                      background: '#fef3c7', 
                      color: '#d97706', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}>
                      {borrow.days_borrowed} days
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => confirmReturn(borrow.borrow_id)}
                      style={{ borderColor: '#10b981', color: '#10b981' }}
                    >
                      Return
                    </button>
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

export default Borrow;