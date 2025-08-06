import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { kakaoLogin, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 이미 로그인 되어 있다면 대시보드로 리다이렉트
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await kakaoLogin();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('로그인에 실패했습니다. 팝업 차단을 해제하고 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded-lg shadow-md text-center w-full max-w-sm">
        <Link to="/" className="text-3xl font-bold text-brand-green mb-2 inline-block">축구의 모든것</Link>
        <p className="text-gray-600 mb-8">학부모님, 환영합니다!</p>
        
        {/* public 폴더에 kakao_login.png 같은 이미지를 넣고 사용 */}
        <button onClick={handleLogin} disabled={isLoading} className="w-full">
            <img src="/kakao_login_medium_wide.png" alt="카카오 로그인" className="w-full" />
        </button>

        {isLoading && <Loader2 className="mx-auto mt-4 h-6 w-6 animate-spin" />}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}