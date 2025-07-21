// src/components/Navbar.tsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useClub } from "@/app/store";
import { SoccerBall, UserCircle, SignOut, SignIn } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const links = [
  { to: "/", label: "소개" },
  { to: "/calendar", label: "훈련 일정" },
  { to: "/children", label: "원생 관리" }, // "내 아이 정보"에서 "원생 관리"로 텍스트 변경
  { to: "/dashboard", label: "대시보드" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout, login } = useClub();

  const handleLogout = () => {
    logout();
    navigate("/"); // 로그아웃 후 홈으로 이동
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center px-4">
        <Link to="/" className="flex items-center font-bold text-primary gap-2 text-xl mr-8">
          <SoccerBall size={32} weight="duotone" />
          <span>백운호수 FC</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-muted text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name} {currentUser.role === 'parent' ? '학부모님' : '코치님'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.role === 'parent' ? '환영합니다!' : '오늘도 화이팅!'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>마이페이지</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <SignOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => login('parent')}>
              <SignIn className="mr-2 h-4 w-4" />
              카카오로 로그인
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}