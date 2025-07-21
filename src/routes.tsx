// src/routes.tsx
import { createBrowserRouter, Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Children from "@/pages/Children";
import KakaoCallback from "@/pages/KakaoCallback";

function AppLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "calendar", element: <Calendar /> },
      { path: "children", element: <Children /> },
    ],
  },
  { 
    path: "/auth/kakao/callback", 
    element: <KakaoCallback /> 
  },
]);