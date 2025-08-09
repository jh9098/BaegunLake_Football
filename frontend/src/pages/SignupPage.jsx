import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  auth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  db,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from '../firebaseConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [children, setChildren] = useState([
    { name: '', gender: '', age: '', grade: '', note: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddChild = () => {
    setChildren([...children, { name: '', gender: '', age: '', grade: '', note: '' }]);
  };

  const handleChildChange = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        setError('이미 사용중인 이메일입니다.');
        setLoading(false);
        return;
      }
      const usernameQuery = query(collection(db, 'users'), where('displayName', '==', username));
      const usernameSnap = await getDocs(usernameQuery);
      if (!usernameSnap.empty) {
        setError('이미 사용중인 아이디입니다.');
        setLoading(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 자녀 정보를 children 컬렉션에 저장하고 해당 문서 ID를 수집합니다.
      const childIds = await Promise.all(
        children.map(async (c) => {
          const childDoc = await addDoc(collection(db, 'children'), {
            name: c.name,
            gender: c.gender,
            age: c.age,
            grade: c.grade,
            note: c.note,
            team: '',
            attendanceStatus: '미등원',
            createdAt: serverTimestamp(),
          });
          return childDoc.id;
        })
      );

      const userData = {
        uid,
        email,
        username,
        displayName: username,
        role: 'parent',
        children: childIds,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', uid), userData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSignup} className="p-8 bg-white rounded-lg shadow-md w-full max-w-md space-y-4">
        <Link to="/" className="text-3xl font-bold text-brand-green mb-6 inline-block">축구의 모든것</Link>
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">아이디</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>자녀 정보</Label>
          {children.map((child, idx) => (
            <div key={idx} className="border p-4 rounded-md space-y-2">
              <div className="space-y-2">
                <Label htmlFor={`child-name-${idx}`}>이름</Label>
                <Input id={`child-name-${idx}`} value={child.name} onChange={(e) => handleChildChange(idx, 'name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>성별</Label>
                <Select value={child.gender} onValueChange={(val) => handleChildChange(idx, 'gender', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="성별 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">남</SelectItem>
                    <SelectItem value="female">여</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`child-age-${idx}`}>연령</Label>
                <Input id={`child-age-${idx}`} type="number" value={child.age} onChange={(e) => handleChildChange(idx, 'age', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`child-grade-${idx}`}>학년</Label>
                <Input id={`child-grade-${idx}`} value={child.grade} onChange={(e) => handleChildChange(idx, 'grade', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`child-note-${idx}`}>특이사항</Label>
                <Textarea id={`child-note-${idx}`} value={child.note} onChange={(e) => handleChildChange(idx, 'note', e.target.value)} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddChild}>자녀 추가</Button>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          회원가입
        </Button>
        <p className="text-sm text-center">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-brand-green">로그인</Link>
        </p>
      </form>
    </div>
  );
}
