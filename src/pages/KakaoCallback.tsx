// src/pages/KakaoCallback.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CircleNotch } from "@phosphor-icons/react";
// import { useClub } from "../app/store";

export default function KakaoCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // const { setUser } = useClub(); // 필요 시

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
        navigate("/");
        return;
    };

    (async () => {
      try {
        // 백엔드에 인가 코드를 보내 토큰을 요청합니다.
        const { data } = await axios.post("/api/auth/kakao", { code });
        
        // 토큰을 localStorage에 저장합니다.
        localStorage.setItem("token", data.token);
        // Zustand 스토어에 유저 정보를 저장합니다.
        // setUser(data.user);

        // 로그인 성공 후 대시보드로 이동합니다.
        navigate("/dashboard");
      } catch (e) {
        console.error("카카오 로그인 실패:", e);
        // 에러 발생 시 홈으로 이동합니다.
        navigate("/");
      }
    })();
  }, [navigate, params]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <CircleNotch size={48} className="animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">로그인 중입니다...</p>
    </div>
  );
}