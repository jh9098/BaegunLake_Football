import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function LoginPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인 되어 있다면 대시보드로 리다이렉트
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded-lg shadow-md text-center w-full max-w-sm">
        <Link to="/" className="text-3xl font-bold text-brand-green mb-2 inline-block">축구의 모든것</Link>
        <p className="text-gray-600 mb-8">로그인 기능이 일시적으로 비활성화되었습니다.</p>
      </div>
    </div>
  );
}