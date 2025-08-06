import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // ⭐️ 'path' 모듈을 import 합니다.

export default defineConfig({
  plugins: [react()],
  
  // ⭐️ [핵심] 이 부분을 추가합니다.
  resolve: {
    alias: {
      // "@" 라는 별칭을 "./src" 폴더로 매핑합니다.
      // 이제 "@/components/ui/button" 은 "src/components/ui/button" 과 동일하게 작동합니다.
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3000,
  },
})