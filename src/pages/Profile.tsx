import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useStore } from '../store/useStore';
import { Flame, Star, BookOpen, CheckCircle, LogOut } from 'lucide-react';
import { ProgressMatrix } from '../components/profile/ProgressMatrix';
import { WeaknessRadar } from '../components/profile/WeaknessRadar';
import { HabitCalendar } from '../components/profile/HabitCalendar';
import { ClassManager } from '../components/profile/ClassManager';
import { useAuthStore } from '../store/authStore';

export function Profile() {
  const { streak, xp, getGlobalStats } = useStore();
  const { user, logout } = useAuthStore();
  const stats = getGlobalStats();

  const masteryRate = stats.totalEquations > 0 
    ? Math.round((stats.masteredCount / stats.totalEquations) * 100) 
    : 0;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        
        {/* User Info Card */}
        <div className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200 mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-[#1CB0F6] rounded-full border-4 border-white shadow-sm flex items-center justify-center text-4xl font-bold text-white uppercase overflow-hidden">
              {user?.avatar_emoji || '👨‍🎓'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">{user?.display_name || '学习者'}</h1>
              <p className="text-gray-500 font-medium mt-1">
                @{user?.username || 'user'}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-3 text-gray-400 hover:text-[#FF4B4B] transition-colors rounded-xl border-2 border-transparent hover:border-[#FF4B4B] hover:bg-red-50"
            title="退出登录"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        {/* Class Manager */}
        <ClassManager />

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border-2 border-b-4 border-gray-200 flex flex-col items-center">
            <Flame className="w-10 h-10 text-[#FF4B4B] fill-current mb-2" />
            <div className="text-xl font-bold text-gray-800">{streak}</div>
            <div className="text-sm font-bold text-gray-400 uppercase">连胜天数</div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border-2 border-b-4 border-gray-200 flex flex-col items-center">
            <Star className="w-10 h-10 text-[#FFC800] fill-current mb-2" />
            <div className="text-xl font-bold text-gray-800">{xp}</div>
            <div className="text-sm font-bold text-gray-400 uppercase">总经验值</div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border-2 border-b-4 border-gray-200 flex flex-col items-center">
            <BookOpen className="w-10 h-10 text-[#CE82FF] fill-current mb-2" />
            <div className="text-xl font-bold text-gray-800">{stats.learningCount + stats.masteredCount} / {stats.totalEquations}</div>
            <div className="text-sm font-bold text-gray-400 uppercase">已学方程式</div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border-2 border-b-4 border-gray-200 flex flex-col items-center">
            <CheckCircle className="w-10 h-10 text-[#58CC02] mb-2" />
            <div className="text-xl font-bold text-gray-800">{masteryRate}%</div>
            <div className="text-sm font-bold text-gray-400 uppercase">综合掌握率</div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <HabitCalendar />
        <WeaknessRadar />
        <ProgressMatrix />
        
      </main>
      <BottomNav />
    </>
  );
}
