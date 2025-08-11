import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Users, Calendar, BarChart2, CheckCircle, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로를 알기 위해 사용
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: '대시보드', href: '/admin', icon: <Home className="w-5 h-5 mr-2" /> },
    { name: '회원 관리', href: '/admin/members', icon: <Users className="w-5 h-5 mr-2" /> },
    { name: '일정 관리', href: '/admin/schedule', icon: <Calendar className="w-5 h-5 mr-2" /> },
    { name: '성과 관리', href: '/admin/progress', icon: <BarChart2 className="w-5 h-5 mr-2" /> },
    { name: '출결 관리', href: '/admin/attendance', icon: <CheckCircle className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-brand-green">
            관리자 페이지
          </Link>
          <div className="hidden sm:flex items-center space-x-4">
            {navItems.map(item => {
              const isActive = item.href === '/admin'
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center text-gray-600 hover:text-brand-green',
                    isActive && 'text-brand-green font-semibold'
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
            <Button onClick={handleLogout} variant="secondary" className="flex items-center">
              <LogOut className="w-5 h-5 mr-2" />
              로그아웃
            </Button>
          </div>
          <button
            className="sm:hidden text-gray-600"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-[60] ${isMenuOpen ? '' : 'pointer-events-none'}`}>
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
            {navItems.map(item => {
              const isActive = item.href === '/admin'
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center text-gray-600 hover:text-brand-green',
                    isActive && 'text-brand-green font-semibold'
                  )}
                  onClick={closeMenu}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <Button
            onClick={() => { handleLogout(); closeMenu(); }}
            variant="secondary"
            className="mt-4 w-full flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>
      <main className="bg-gray-100 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}