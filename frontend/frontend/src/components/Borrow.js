import React, { useState, useEffect } from 'react';
import API from '../api';

const Borrow = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);

  const [formData, setFormData] = useState({
    student_id: '',
    book_id: '',
    borrow_date: ''
  });

  useEffect(() => {
    fetchData();
    fetchBorrowedBooks();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    try {
      const [studentsRes, booksRes] = await Promise.all([
        API.get('/api/students', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        API.get('/api/books', {
          headers: { Authorization: `Bearer ${token}` }
        })
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
      fetchData();
      fetchBorrowedBooks();

      alert('Book borrowed successfully!');

    } catch (error) {
      console.error('Error borrowing book:', error);
      alert(error.response?.data?.error || 'Error borrowing book');
    }
  };

  const handleReturn = async (borrowId) => {
    if (window.confirm('Confirm book return?')) {
      const token = localStorage.getItem('token');

      try {
        await API.put(`/api/return/${borrowId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        fetchData();
        fetchBorrowedBooks();

        alert('Book returned successfully!');

      } catch (error) {
        console.error('Error returning book:', error);
        alert('Error returning book');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="borrow">
      <h1>Borrow/Return Books</h1>

      <div className="form-container">
        <h2>Borrow a Book</h2>

        <form onSubmit={handleBorrow}>
          <select
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student._id} value={student.student_id}>
                {student.name} - {student.class}
              </option>
            ))}
          </select>

          <select
            name="book_id"
            value={formData.book_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Book</option>
            {books.map(book => (
              <option key={book._id} value={book.book_id}>
                {book.title} by {book.author} (Available: {book.available_quantity})
              </option>
            ))}
          </select>

          <input
            type="date"
            name="borrow_date"
            value={formData.borrow_date}
            onChange={handleChange}
          />

          <button type="submit">Borrow Book</button>
        </form>
      </div>

      <div className="borrowed-list">
        <h2>Currently Borrowed Books</h2>

        {borrowedBooks.length === 0 ? (
          <p>No books currently borrowed</p>
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
                  <td>{borrow.student_name} (ID: {borrow.student_id})</td>
                  <td>{borrow.book_title}</td>
                  <td>{new Date(borrow.borrow_date).toLocaleDateString()}</td>
                  <td>{borrow.days_borrowed}</td>
                  <td>
                    <button onClick={() => handleReturn(borrow.borrow_id)}>
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
