import { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged, signOut, signInWithCustomToken, db, doc, getDoc, setDoc, serverTimestamp } from '../firebaseConfig';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const kakaoLogin = () => {
    return new Promise((resolve, reject) => {
      if (!window.Kakao || !window.Kakao.Auth || !window.Kakao.Auth.login) {
        return reject(new Error('Kakao SDK not loaded'));
      }

      window.Kakao.Auth.login({
        success: async (authObj) => {
          try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/kakao`, {
              accessToken: authObj.access_token,
            });
            
            const { firebaseToken } = response.data;
            const userCredential = await signInWithCustomToken(auth, firebaseToken);
            const firebaseUser = userCredential.user;
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
              window.Kakao.API.request({
                url: '/v2/user/me',
                success: async (profileRes) => {
                  const newUser = {
                    uid: firebaseUser.uid,
                    kakaoId: profileRes.id,
                    displayName: profileRes.properties.nickname,
                    email: profileRes.kakao_account.email || null,
                    profileImageUrl: profileRes.properties.profile_image,
                    role: 'parent',
                    children: [],
                    createdAt: serverTimestamp(),
                  };
                  await setDoc(userRef, newUser);
                  setUserData(newUser);
                },
                fail: (err) => reject(new Error('Failed to fetch Kakao profile.'))
              });
            }
            resolve(userCredential);
          } catch (error) {
            console.error("Firebase custom auth error:", error);
            reject(error);
          }
        },
        fail: (err) => {
          console.error("Kakao login failed:", err);
          reject(err);
        },
      });
    });
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    kakaoLogin,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}