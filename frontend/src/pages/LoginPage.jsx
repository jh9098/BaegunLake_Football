import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { auth, signInWithEmailAndPassword } from '../firebaseConfig';

export default function LoginPage() {
  const { currentUser, kakaoLogin, handleKakaoRedirect } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingKakao, setLoadingKakao] = useState(false);
  const [error, setError] = useState(null);

  // 이미 로그인 되어 있다면 대시보드로 리다이렉트
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
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm space-y-4">
        <Link to="/" className="text-3xl font-bold text-brand-green mb-2 inline-block text-center">축구의 모든것</Link>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loadingEmail}>
            {loadingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            이메일로 로그인
          </Button>
        </form>
        <Button className="w-full" onClick={handleKakaoLogin} disabled={loadingKakao}>
          {loadingKakao && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          카카오로 로그인
        </Button>
        <p className="text-sm text-center">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-brand-green">회원가입</Link>
        </p>
      </div>
    </div>
  );
}