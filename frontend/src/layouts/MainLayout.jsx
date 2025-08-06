import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function MainLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-brand-green">축구의 모든것</Link>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-brand-green">대시보드</Link>
            <Link to="/schedule" className="text-gray-600 hover:text-brand-green">훈련 일정</Link>
            <Link to="/community" className="text-gray-600 hover:text-brand-green">커뮤니티</Link>
            {currentUser && <Button variant="secondary" onClick={logout}>로그아웃</Button>}
          </div>
        </nav>
      </header>
      <main className="bg-gray-50 min-h-screen">
        <Outlet />
      </main>
      <footer className="bg-brand-footer-bg text-gray-300 py-12 text-center">
        <p>&copy; 2024 Soccer Academy. All Rights Reserved.</p>
      </footer>
    </div>
  );
}