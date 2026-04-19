import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useStore } from '../store/useStore';
import { Star, Check, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export function Home() {
  const { levels, updateStreak } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <div className="flex flex-col items-center space-y-12 relative">
          {levels.map((level, index) => {
            const isLeft = index % 2 === 0;
            const xOffset = isLeft ? -40 : 40;
            const status = level.isCompleted
              ? 'completed'
              : 'unlocked';
            
            const isZhongkao = level.id === 'lvl-zhongkao';
            const isGaokao = level.id === 'lvl-gaokao';
            const isBoss = isZhongkao || isGaokao;

            return (
              <div key={level.id} className="relative w-full flex flex-col items-center group">
                <div className={twMerge(
                  clsx(
                    "text-sm font-bold mb-2 uppercase tracking-wider text-center",
                    isZhongkao ? "text-[#CE82FF] text-base" : isGaokao ? "text-[#FF4B4B] text-base" : "text-gray-400"
                  )
                )}>
                  {level.title}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/lesson/${level.id}`)}
                  className={twMerge(
                    clsx(
                      'relative w-20 h-20 rounded-full flex items-center justify-center border-b-[6px] shadow-sm transition-colors duration-200 z-10',
                      {
                        'bg-[#FFC800] border-[#D4A600] text-white': status === 'completed' && !isBoss,
                        'bg-[#58CC02] border-[#46A302] text-white': status === 'unlocked' && !isBoss,
                        'bg-[#CE82FF] border-[#A552DC] text-white': (status === 'completed' || status === 'unlocked') && isZhongkao,
                        'bg-[#FF4B4B] border-[#EA2B2B] text-white': (status === 'completed' || status === 'unlocked') && isGaokao,
                      }
                    )
                  )}
                  style={{ transform: isBoss ? 'translateX(0px)' : `translateX(${xOffset}px)` }}
                >
                  {isBoss ? (
                    <Trophy className="w-10 h-10 stroke-[2px] fill-current" />
                  ) : (
                    <>
                      {status === 'completed' && <Check className="w-10 h-10 stroke-[3px]" />}
                      {status === 'unlocked' && <Star className="w-10 h-10 fill-current stroke-[2px]" />}
                    </>
                  )}
                  
                  {/* Level Path Line */}
                  {index < levels.length - 1 && (
                    <svg
                      className="absolute -bottom-[60px] left-1/2 w-32 h-[60px] -translate-x-1/2 pointer-events-none -z-10"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <path
                        d={
                          levels[index + 1].id.includes('lvl-zhongkao') || levels[index + 1].id.includes('lvl-gaokao')
                            ? (isLeft ? "M 50 0 C 50 50, 100 50, 100 100" : "M 50 0 C 50 50, 0 50, 0 100")
                            : isBoss 
                              ? (index % 2 === 1 ? "M 50 0 C 50 50, 100 50, 100 100" : "M 50 0 C 50 50, 0 50, 0 100")
                              : (isLeft ? "M 50 0 C 50 50, 150 50, 150 100" : "M 50 0 C 50 50, -50 50, -50 100")
                        }
                        stroke={level.isCompleted ? '#58CC02' : '#E5E7EB'}
                        strokeWidth="12"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  )}
                </motion.button>
              </div>
            );
          })}
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe">
        <div className="max-w-md mx-auto flex justify-around p-2">
          <button className="p-3 text-[#1CB0F6] flex flex-col items-center">
            <div className="w-8 h-8 rounded-xl border-2 border-current flex items-center justify-center">
              🏠
            </div>
            <span className="text-xs font-bold mt-1">学习</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="p-3 text-gray-400 hover:text-gray-600 flex flex-col items-center transition-colors"
          >
            <div className="w-8 h-8 rounded-xl border-2 border-current flex items-center justify-center">
              👤
            </div>
            <span className="text-xs font-bold mt-1">档案</span>
          </button>
        </div>
      </nav>
      <BottomNav />
    </>
  );
}
