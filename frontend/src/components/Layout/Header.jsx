import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, FileText, Home, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="text-xl font-semibold text-gray-900"
            >
              <span className="font-medium">Task Manager</span>
            </Link>
          </div>
          
          {/* Right Side - User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info with Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">  
                <Link
                  to="/reports"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4" />
                  <span>View Reports</span>
                </Link>
                
                <div className="border-t border-gray-200 my-1"></div>
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            
            {/* Mobile Menu Button (optional) */}
            <div className="md:hidden flex items-center space-x-2">
              <Link
                to="/reports"
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Reports"
              >
                <FileText className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-center space-x-6 py-3 border-t border-gray-200">
          <Link
            to="/dashboard"
            className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </Link>
          
          <Link
            to="/reports"
            className="flex flex-col items-center space-y-1 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Reports</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;