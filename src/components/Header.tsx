import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Send size={32} className="text-white transform rotate-45" />
          <span className="text-3xl font-bold text-white tracking-tight">sndit</span>
        </Link>
        {isAuthenticated && (
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2 rounded-md transition duration-300 hover:bg-indigo-100"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;