import { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  onAuthStateChanged,
  signOut,
  signInWithCustomToken,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '../firebaseConfig';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const kakaoLogin = () => {
    const redirectUri = `${window.location.origin}/login`;
    const clientId = import.meta.env.VITE_KAKAO_REST_API_KEY;
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
  };

  const handleKakaoRedirect = async (code) => {
    const redirectUri = `${window.location.origin}/login`;
    const response = await axios.post(`${apiBaseUrl}/auth/kakao`, { code, redirectUri });
    const { firebaseToken, profile } = response.data;
    const userCredential = await signInWithCustomToken(auth, firebaseToken);
    const firebaseUser = userCredential.user;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const newUser = {
        uid: firebaseUser.uid,
        kakaoId: profile.kakaoId,
        displayName: profile.displayName,
        email: profile.email,
        // Firestore does not allow undefined field values. Some Kakao accounts
        // may not include a profile image, so ensure we store an empty string
        // instead of `undefined` to avoid setDoc throwing an error on first
        // login.
        profileImageUrl: profile.profileImageUrl ?? '',
        role: 'parent',
        children: [],
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, newUser);
      setUserData(newUser);
      return newUser;
    } else {
      const existingUser = userSnap.data();
      setUserData(existingUser);
      return existingUser;
    }
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
        setUserData(userSnap.exists() ? userSnap.data() : null);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUserData = async () => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    setUserData(userSnap.exists() ? userSnap.data() : null);
  };

  const value = {
    currentUser,
    userData,
    kakaoLogin,
    handleKakaoRedirect,
    refreshUserData,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

