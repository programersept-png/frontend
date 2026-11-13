import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Book, Users, ArrowLeftRight, FileText, LogOut, Library, X, AlertCircle } from 'lucide-react';

const Sidebar = ({ onLogout, isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
    navigate('/login');
  };

  return (
    <>
      <div id="main-sidebar" className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Library size={28} />
            <h2>Library MS</h2>
          </div>
          
          <button className="sidebar-close-btn" type="button" aria-label="Close navigation menu" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-links">
          <NavLink to="/dashboard" onClick={toggleSidebar} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/books" onClick={toggleSidebar} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Book size={20} /> Books
          </NavLink>
          <NavLink to="/students" onClick={toggleSidebar} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <Users size={20} /> Students
          </NavLink>
          <NavLink to="/borrow" onClick={toggleSidebar} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <ArrowLeftRight size={20} /> Borrow / Return
          </NavLink>
          <NavLink to="/reports" onClick={toggleSidebar} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FileText size={20} /> Reports
          </NavLink>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="avatar">{username?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span>{username}</span>
              <small>Admin</small>
            </div>
          </div>
          {/* Click this to open the confirmation modal */}
          <button onClick={() => setShowLogoutModal(true)} className="sidebar-logout">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="modal-header" style={{ flexDirection: 'column', gap: '10px' }}>
              <AlertCircle size={40} color="#ef4444" />
              <h2>Confirm Logout</h2>
            </div>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem', textAlign: 'center' }}>
              Are you sure you want to log out of your account?
            </p>
            <div className="form-actions">
              <button onClick={confirmLogout} className="delete-confirm-btn">
                Yes, Logout
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;