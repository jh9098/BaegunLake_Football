import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import MyPage from './pages/MyPage';

// Parent Pages
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import CommunityPage from './pages/CommunityPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberManagementPage from './pages/admin/MemberManagementPage';
import ScheduleManagementPage from './pages/admin/ScheduleManagementPage';
import ProgressManagementPage from './pages/admin/ProgressManagementPage'; // ⭐️ 1. import 추가

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes & Parent Routes (테스트용으로 제한 해제된 상태) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<MemberManagementPage />} />
            <Route path="schedule" element={<ScheduleManagementPage />} />
            <Route path="progress" element={<ProgressManagementPage />} /> {/* ⭐️ 2. 라우트 추가 */}
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}