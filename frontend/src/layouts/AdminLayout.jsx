import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Users, Calendar, BarChart2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils'; // cn 유틸리티 import

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로를 알기 위해 사용

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: '대시보드', href: '/admin', icon: <Home className="w-5 h-5 mr-3" /> },
    { name: '회원 관리', href: '/admin/members', icon: <Users className="w-5 h-5 mr-3" /> },
    { name: '일정 관리', href: '/admin/schedule', icon: <Calendar className="w-5 h-5 mr-3" /> },
    { name: '성과 관리', href: '/admin/progress', icon: <BarChart2 className="w-5 h-5 mr-3" /> }, // ⭐️ 메뉴 추가
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-gray-200 p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 text-white text-center">관리자 페이지</h2>
        <nav className="flex flex-col space-y-2 flex-grow">
          {navItems.map(item => {
            // 현재 경로와 메뉴의 경로가 일치하는지 확인 (대시보드는 정확히 일치할 때만 활성화)
            const isActive = item.href === '/admin' 
              ? location.pathname === item.href 
              : location.pathname.startsWith(item.href);
            
            return (
              <Link 
                key={item.name}
                to={item.href} 
                // ⭐️ 활성화된 메뉴 스타일 적용
                className={cn(
                  "flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors",
                  isActive && "bg-gray-700 text-white font-semibold"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-gray-300 hover:bg-red-500 hover:text-white">
          <LogOut className="w-5 h-5 mr-3" />
          로그아웃
        </Button>
      </aside>
      <main className="flex-1 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}