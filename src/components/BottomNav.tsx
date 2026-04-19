import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Repeat2, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { to: '/', label: '学习', Icon: BookOpen },
    { to: '/review', label: '复习', Icon: Repeat2 },
    { to: '/profile', label: '档案', Icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-md mx-auto flex justify-around p-2">
        {items.map(({ to, label, Icon }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={twMerge(
                clsx(
                  'p-3 flex flex-col items-center transition-colors',
                  active ? 'text-[#1CB0F6]' : 'text-gray-400 hover:text-gray-600'
                )
              )}
            >
              <div className="w-8 h-8 rounded-xl border-2 border-current flex items-center justify-center">
                <Icon className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <span className="text-xs font-bold mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

