import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LogIn, MessageCircle, Phone, Loader2 } from 'lucide-react';
import { auth, signInWithEmailAndPassword } from '../firebaseConfig';

export default function LoginPage() {
  const { currentUser, kakaoLogin, handleKakaoRedirect } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingKakao, setLoadingKakao] = useState(false);
  const [error, setError] = useState(null);

  // redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoadingEmail(true);
    try {
      await signInWithEmailAndPassword(auth, userId, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setLoadingEmail(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setLoadingKakao(true);
      handleKakaoRedirect(code)
        .then((user) => {
          const incomplete = !user.username || !user.name || !user.contact;
          navigate(incomplete ? '/complete-profile' : '/dashboard');
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error(err);
          setError('로그인에 실패했습니다. 다시 시도해주세요.');
        })
        .finally(() => setLoadingKakao(false));
    }
  }, [handleKakaoRedirect, navigate]);

  const handleKakaoLogin = () => {
    setError(null);
    kakaoLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-10 px-4">
      <div className="w-full max-w-[360px] bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <LogIn className="w-10 h-10 text-[#2563EB]" />
          <h1 className="text-2xl font-bold text-[#2563EB]">로그인</h1>
        </div>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="text"
            placeholder="아이디"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-[#2563EB] text-white py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors"
            disabled={loadingEmail}
          >
            {loadingEmail ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            로그인
          </button>
        </form>
        <button
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center rounded-lg py-2 bg-[#FEE500] text-[#3C1E1E] hover:bg-[#E5CC00] transition-colors"
          disabled={loadingKakao}
        >
          {loadingKakao ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <MessageCircle className="mr-2 h-5 w-5" />
          )}
          카카오 로그인
        </button>
        <button
          onClick={() => navigate('/consult')}
          className="w-full flex items-center justify-center border border-[#2563EB] text-[#2563EB] rounded-lg py-2 hover:bg-blue-50 transition-colors"
        >
          <Phone className="mr-2 h-5 w-5" />
          상담신청
        </button>
        <p className="text-center text-xs text-[#9CA3AF]">
          접근이 허용된 사용자만 이용이 가능합니다.
        </p>
      </div>
    </div>
  );
}
