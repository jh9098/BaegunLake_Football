import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileForm from '../components/ProfileForm';
import {
  db,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from '../firebaseConfig';

export default function CompleteProfilePage() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ username, name, contact, children }) => {
    if (!currentUser) return;
    setLoading(true);
    try {
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

      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          ...userData,
          username,
          displayName: username,
          name,
          contact,
          children: childIds,
        },
        { merge: true }
      );

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <ProfileForm onSubmit={handleSubmit} submitLabel="정보 저장" loading={loading} />
    </div>
  );
}

