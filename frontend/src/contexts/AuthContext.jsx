import { createContext, useContext, useState, useEffect } from 'react';

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
        success: () => {
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: (profileRes) => {
              const user = {
                kakaoId: profileRes.id,
                displayName: profileRes.properties.nickname,
                email: profileRes.kakao_account?.email || null,
                profileImageUrl: profileRes.properties.profile_image,
              };
              setCurrentUser(user);
              setUserData(user);
              resolve(user);
            },
            fail: (err) => {
              reject(err);
            },
          });
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  };

  const logout = () => {
    return new Promise((resolve) => {
      if (window.Kakao && window.Kakao.Auth) {
        window.Kakao.Auth.logout(() => {
          setCurrentUser(null);
          setUserData(null);
          resolve();
        });
      } else {
        setCurrentUser(null);
        setUserData(null);
        resolve();
      }
    });
  };

  useEffect(() => {
    if (window.Kakao && window.Kakao.Auth) {
      window.Kakao.Auth.getStatusInfo((statusInfo) => {
        if (statusInfo.status === 'connected') {
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: (profileRes) => {
              const user = {
                kakaoId: profileRes.id,
                displayName: profileRes.properties.nickname,
                email: profileRes.kakao_account?.email || null,
                profileImageUrl: profileRes.properties.profile_image,
              };
              setCurrentUser(user);
              setUserData(user);
              setLoading(false);
            },
            fail: () => {
              setLoading(false);
            },
          });
        } else {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
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
