import React, { useState, useEffect } from 'react';
import API from '../api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    class: ''
  });

  const [editing, setEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

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
      } else {
        await API.post('/api/students', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setFormData({ name: '', class: '' });
      setEditing(false);
      fetchStudents();

    } catch (error) {
      console.error('Error saving student:', error);
      alert(error.response?.data?.error || 'Error saving student');
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      class: student.class
    });

    setEditing(true);
    setCurrentStudentId(student.student_id);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Delete this student?')) return;

    const token = localStorage.getItem('token');

    try {
      await API.delete(`/api/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="students">
      <h1>Students Management</h1>

      <div className="form-container">
        <h2>{editing ? 'Edit Student' : 'Add New Student'}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Student Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="class"
            placeholder="Class"
            value={formData.class}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editing ? 'Update' : 'Add'} Student
          </button>

          {editing && (
            <button type="button" onClick={() => {
              setEditing(false);
              setFormData({ name: '', class: '' });
            }}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="students-list">
        <h2>Students List</h2>

        {students.length === 0 ? (
          <p>No students found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
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
                    <button onClick={() => handleDelete(student.student_id)}>Delete</button>
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
