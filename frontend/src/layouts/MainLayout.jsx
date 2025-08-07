import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function MainLayout() {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-brand-green">축구의 모든것</Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-brand-green">대시보드</Link>
            <Link to="/schedule" className="text-gray-600 hover:text-brand-green">훈련 일정</Link>
            <Link to="/community" className="text-gray-600 hover:text-brand-green">커뮤니티</Link>
            {currentUser ? (
              <Button variant="secondary" onClick={logout}>로그아웃</Button>
            ) : null}
          </div>
          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 ${isMenuOpen ? '' : 'pointer-events-none'}`}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md transform transition-transform duration-300 p-6 flex flex-col ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            className="mb-4 text-gray-600"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
          <nav className="flex flex-col space-y-4 flex-1">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-brand-green"
              onClick={closeMenu}
            >
              대시보드
            </Link>
            <Link
              to="/schedule"
              className="text-gray-600 hover:text-brand-green"
              onClick={closeMenu}
            >
              훈련 일정
            </Link>
            <Link
              to="/community"
              className="text-gray-600 hover:text-brand-green"
              onClick={closeMenu}
            >
              커뮤니티
            </Link>
          </nav>
          {currentUser ? (
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => {
                logout();
                closeMenu();
              }}
            >
              로그아웃
            </Button>
          ) : null}
        </div>
      </div>

      <main className="bg-gray-50 min-h-screen">
        <Outlet />
      </main>
      <footer className="bg-brand-footer-bg text-gray-300 py-12 text-center">
        <p>&copy; 2024 Soccer Academy. All Rights Reserved.</p>
      </footer>
    </div>
  );
}