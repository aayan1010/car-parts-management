import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <i className="ri-car-line text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">AutoParts</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/') ? 'text-amber-600' : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/search') ? 'text-amber-600' : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              Search Parts
            </Link>
            <Link
              to="/add-item"
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/add-item') ? 'text-amber-600' : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              Add Item
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/dashboard') ? 'text-amber-600' : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
