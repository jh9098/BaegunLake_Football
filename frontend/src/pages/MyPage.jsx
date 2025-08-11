import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileForm from '../components/ProfileForm';
import {
  db,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from '../firebaseConfig';

export default function MyPage() {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData) return;
      const childrenData = await Promise.all(
        (userData.children || []).map(async (id) => {
          const snap = await getDoc(doc(db, 'children', id));
          return { id: snap.id, ...snap.data() };
        })
      );
      setInitialData({
        username: userData.username || '',
        name: userData.name || '',
        contact: userData.contact || '',
        children: childrenData.map((c) => ({
          id: c.id,
          name: c.name || '',
          gender: c.gender || '',
          age: c.age || '',
          grade: c.grade || '',
          note: c.note || '',
        })),
      });
    };
    fetchData();
  }, [userData]);

  const handleSubmit = async ({ username, name, contact, children }) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const childIds = await Promise.all(
        children.map(async (c) => {
          if (c.id) {
            await updateDoc(doc(db, 'children', c.id), {
              name: c.name,
              gender: c.gender,
              age: c.age,
              grade: c.grade,
              note: c.note,
            });
            return c.id;
          } else {
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
          }
        })
      );

      await updateDoc(doc(db, 'users', currentUser.uid), {
        username,
        displayName: username,
        name,
        contact,
        children: childIds,
      });

      setInitialData({
        username,
        name,
        contact,
        children: children.map((c, i) => ({ ...c, id: childIds[i] })),
      });

      await refreshUserData();
      alert('정보가 저장되었습니다.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <ProfileForm
        initialData={initialData}
        onSubmit={handleSubmit}
        submitLabel="정보 수정"
        loading={loading}
      />
    </div>
  );
}

