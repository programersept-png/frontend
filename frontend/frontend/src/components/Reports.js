import React, { useState } from 'react';
import API from '../api';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: ''
  });

  const generateReport = async () => {
    const token = localStorage.getItem('token');

    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.status) params.status = filters.status;

      const response = await API.get('/api/reports/borrowing', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setReportData(response.data);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const exportToCSV = () => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Borrow ID',
      'Student Name',
      'Class',
      'Book Title',
      'Author',
      'Borrow Date',
      'Return Date',
      'Status',
      'Days Borrowed'
    ];

    const csvData = reportData.map(item => [
      item.borrow_id,
      item.student_name,
      item.student_class,
      item.book_title,
      item.book_author,
      new Date(item.borrow_date).toLocaleDateString(),
      item.return_date ? new Date(item.return_date).toLocaleDateString() : 'Not returned',
      item.status,
      item.days_borrowed
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `borrowing_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="reports">
      <h1>Borrowing Reports</h1>

      <div className="filters">
        <h2>Filter Reports</h2>

        <input
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={handleFilterChange}
        />

        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleFilterChange}
        />

        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
        </select>

        <button onClick={generateReport}>Generate Report</button>

        {reportData.length > 0 && (
          <button onClick={exportToCSV}>Export CSV</button>
        )}
      </div>

      {reportData.length > 0 && (
        <div className="report-results">
          <h2>Results ({reportData.length})</h2>

          <table>
            <thead>
              <tr>
                <th>Borrow ID</th>
                <th>Student</th>
                <th>Class</th>
                <th>Book</th>
                <th>Author</th>
                <th>Borrow Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Days</th>
              </tr>
            </thead>

            <tbody>
              {reportData.map((record, index) => (
                <tr key={index}>
                  <td>{record.borrow_id}</td>
                  <td>{record.student_name}</td>
                  <td>{record.student_class}</td>
                  <td>{record.book_title}</td>
                  <td>{record.book_author}</td>
                  <td>{new Date(record.borrow_date).toLocaleDateString()}</td>
                  <td>{record.return_date ? new Date(record.return_date).toLocaleDateString() : '-'}</td>
                  <td>{record.status}</td>
                  <td>{record.days_borrowed}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
