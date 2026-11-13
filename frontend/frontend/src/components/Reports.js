import React, { useState } from 'react';
import API from '../api';
import { CheckCircle, AlertCircle, Download, Filter, Search } from 'lucide-react';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: ''
  });
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-hide toast
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const generateReport = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);

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
      if (response.data.length === 0) {
        setToast({ type: 'error', message: 'No records found for these filters.' });
      }

    } catch (error) {
      console.error('Error generating report:', error);
      setToast({ type: 'error', message: 'Error generating report' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const exportToCSV = () => {
    if (reportData.length === 0) {
      setToast({ type: 'error', message: 'No data to export' });
      return;
    }

    const headers = [
      'Borrow ID', 'Student Name', 'Class', 'Book Title', 
      'Author', 'Borrow Date', 'Return Date', 'Status', 'Days Borrowed'
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
    setToast({ type: 'success', message: 'Report exported successfully!' });
  };

  // Calculate summary stats
  const totalRecords = reportData.length;
  const currentlyBorrowed = reportData.filter(r => r.status === 'borrowed').length;
  const totalReturned = reportData.filter(r => r.status === 'returned').length;

  return (
    <div className="reports">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Borrowing Reports</h1>
      </div>

      {/* Filter Card */}
      <div className="filters-card">
        <div className="filter-header">
          <Filter size={20} color="#2563eb" />
          <h2>Filter Reports</h2>
        </div>

        <div className="filter-grid">
          <div className="input-group">
            <label>Start Date</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="input-group">
            <label>End Date</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="input-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="modal-select">
              <option value="">All Statuses</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={generateReport} className="add-btn" disabled={loading}>
            <Search size={18} /> {loading ? 'Generating...' : 'Generate Report'}
          </button>

          {reportData.length > 0 && (
            <button onClick={exportToCSV} className="export-btn">
              <Download size={18} /> Export to CSV
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards (Only shows if data exists) */}
      {reportData.length > 0 && (
        <div className="report-summary-cards">
          <div className="summary-box">
            <h4>Total Records</h4>
            <p>{totalRecords}</p>
          </div>
          <div className="summary-box orange">
            <h4>Currently Borrowed</h4>
            <p>{currentlyBorrowed}</p>
          </div>
          <div className="summary-box green">
            <h4>Returned</h4>
            <p>{totalReturned}</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      {reportData.length > 0 && (
        <div className="report-results">
          <h2>Report Results</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Class</th>
                <th>Book Title</th>
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
                  <td>#{record.borrow_id}</td>
                  <td>{record.student_name}</td>
                  <td>{record.student_class}</td>
                  <td>{record.book_title}</td>
                  <td>{record.book_author}</td>
                  <td>{new Date(record.borrow_date).toLocaleDateString()}</td>
                  <td>{record.return_date ? new Date(record.return_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
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