import { Link, useLocation } from 'react-router-dom';
import { SoccerBall } from 'phosphor-react';

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: "/children", label: "Profiles" },
  { to: '/calendar', label: 'Calendar' }
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky top-0 z-50 bg-white border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <SoccerBall size={24} className="text-primary mr-2" />
        <span className="font-bold mr-6">Soccer Club</span>
        <ul className="flex gap-4 text-sm">
          {links.map(l => (
            <li key={l.to}>
              <Link
                className={\`\${pathname === l.to ? 'text-primary font-semibold' : ''} py-2\`}
                to={l.to}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
