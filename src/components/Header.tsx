import { Flame, Heart, Star } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Header() {
  const { streak, hearts, xp } = useStore();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold text-[#58CC02] tracking-tight">
            ChemMemo
          </span>
        </div>

        <div className="flex items-center space-x-6 font-bold">
          <div className="flex items-center space-x-1 text-[#FFC800]">
            <Flame className="w-6 h-6 fill-current" />
            <span>{streak}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-[#FF4B4B]">
            <Heart className="w-6 h-6 fill-current" />
            <span>{hearts}</span>
          </div>

          <div className="flex items-center space-x-1 text-[#1CB0F6]">
            <Star className="w-6 h-6 fill-current" />
            <span>{xp}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
