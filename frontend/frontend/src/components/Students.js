import React, { useState, useEffect } from 'react';
import API from '../api';
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react'; 

const Students = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    class: ''
  });
  const [editing, setEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  
  // UI States
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null); 
  const [deleteId, setDeleteId] = useState(null); 

  useEffect(() => {
    fetchStudents();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchStudents = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await API.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (editing) {
        await API.put(`/api/students/${currentStudentId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToast({ type: 'success', message: 'Student updated successfully!' });
      } else {
        await API.post('/api/students', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToast({ type: 'success', message: 'Student added successfully!' });
      }

      setFormData({ name: '', class: '' });
      setEditing(false);
      setShowForm(false); 
      fetchStudents();

    } catch (error) {
      console.error('Error saving student:', error);
      setToast({ type: 'error', message: error.response?.data?.error || 'Error saving student' });
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      class: student.class
    });
    setEditing(true);
    setCurrentStudentId(student.student_id);
    setShowForm(true); 
  };

  // Open custom confirm modal
  const confirmDelete = (studentId) => {
    setDeleteId(studentId);
  };

  // Actually delete after confirmation
  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await API.delete(`/api/students/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ type: 'success', message: 'Student deleted successfully!' });
      setDeleteId(null);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      setToast({ type: 'error', message: 'Error deleting student' });
      setDeleteId(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="students">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Students Management</h1>
        <button 
          className="add-btn" 
          onClick={() => {
            setEditing(false);
            setFormData({ name: '', class: '' });
            setShowForm(true);
          }}
        >
          <Plus size={18} /> Add New Student
        </button>
      </div>

      {/* ADD/EDIT FORM MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editing ? 'Edit Student' : 'Add New Student'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label>Student Name</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Enter student name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="input-group">
                <label>Class</label>
                <input 
                  type="text" 
                  name="class" 
                  placeholder="Enter class (e.g. Grade 10)" 
                  value={formData.class} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editing ? 'Update Student' : 'Add Student'}
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
              <h2>Delete Student?</h2>
            </div>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this student? This action cannot be undone.
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

      {/* Students List Table */}
      <div className="students-list">
        <h2>Students List</h2>

        {students.length === 0 ? (
          <p>No students found. Add your first student above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.student_id}</td>
                  <td>{student.name}</td>
                  <td>{student.class}</td>
                  <td>
                    <button onClick={() => handleEdit(student)}>Edit</button>
                    <button onClick={() => confirmDelete(student.student_id)}>Delete</button>
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

export default Students;