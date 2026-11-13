import React from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <header className="top-navbar">
      <h1 className="top-navbar-title">Library Management System</h1>
      <button
        className="hamburger"
        type="button"
        aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isSidebarOpen}
        aria-controls="main-sidebar"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
};

export default Navbar;