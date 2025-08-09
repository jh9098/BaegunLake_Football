import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CalendarDays, BarChart2, Users, Menu, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-lg shadow-md text-center transform hover:-translate-y-2 transition-transform duration-300">
        {icon}
        <h3 className="mt-4 text-xl font-bold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
    </div>
);

export default function HomePage() {
  const { currentUser, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-brand-green">축구의 모든것</Link>
          <div className="hidden sm:flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-brand-green">대시보드</Link>
            <Link to="/schedule" className="text-gray-600 hover:text-brand-green">훈련 일정</Link>
            <Link to="/community" className="text-gray-600 hover:text-brand-green">커뮤니티</Link>
            <Link to="/admin" className="text-gray-600 hover:text-brand-green">관리자</Link>

            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : currentUser ? (
              <Button variant="secondary" onClick={logout}>로그아웃</Button>
            ) : (
              <>
                <Button asChild>
                  <Link to="/login">로그인</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/signup">회원가입</Link>
                </Button>
              </>
            )}
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
            <Link to="/dashboard" className="text-gray-600 hover:text-brand-green" onClick={closeMenu}>대시보드</Link>
            <Link to="/schedule" className="text-gray-600 hover:text-brand-green" onClick={closeMenu}>훈련 일정</Link>
            <Link to="/community" className="text-gray-600 hover:text-brand-green" onClick={closeMenu}>커뮤니티</Link>
            <Link to="/admin" className="text-gray-600 hover:text-brand-green" onClick={closeMenu}>관리자</Link>
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
          ) : (
            <div className="mt-4 w-full space-y-2">
              <Button className="w-full" asChild>
                <Link to="/login" onClick={closeMenu}>로그인</Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/signup" onClick={closeMenu}>회원가입</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <main>
        <section className="bg-brand-green text-white text-center py-20">
          <h1 className="text-5xl font-extrabold">우리 아이의 성장이 시작되는 곳</h1>
          <p className="mt-4 text-xl text-green-100">체계적인 훈련과 투명한 관리로 최고의 경험을 선물합니다.</p>
          <Button size="lg" className="mt-8 bg-white text-brand-green hover:bg-gray-100" asChild>
            <Link to="/dashboard">학부모 대시보드 바로가기</Link>
          </Button>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard icon={<ShieldCheck className="w-12 h-12 mx-auto text-brand-green-soft"/>} title="실시간 출결 확인" description="등원/하원 시 알림으로 아이의 안전을 실시간으로 확인하세요."/>
              <FeatureCard icon={<BarChart2 className="w-12 h-12 mx-auto text-brand-green-soft"/>} title="성장 리포트" description="훈련 영상과 데이터 기반 그래프로 아이의 성장을 한눈에 보세요."/>
              <FeatureCard icon={<CalendarDays className="w-12 h-12 mx-auto text-brand-green-soft"/>} title="투명한 훈련 일정" description="팀별, 학년별 훈련 일정을 캘린더에서 언제든 확인할 수 있습니다."/>
              <FeatureCard icon={<Users className="w-12 h-12 mx-auto text-brand-green-soft"/>} title="학부모 커뮤니티" description="중고 용품을 거래하고 유용한 정보를 나누는 소통의 공간입니다."/>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-brand-footer-bg text-gray-300 py-12 text-center">
        <p>&copy; 2024 Soccer Academy. All Rights Reserved.</p>
      </footer>
    </div>
  );
}