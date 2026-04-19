import React from 'react';
import { useStore } from '../../store/useStore';

export function ProgressMatrix() {
  const { levels, reviewItems } = useStore();

  // Calculate stats for each level
  const levelStats = levels.map((level) => {
    const total = level.equations.length;
    let mastered = 0;
    let learning = 0;

    level.equations.forEach((eqId) => {
      const item = reviewItems[eqId];
      if (item) {
        if (item.streak >= 3) {
          mastered++;
        } else {
          learning++;
        }
      }
    });

    const notStarted = total - mastered - learning;

    return {
      id: level.id,
      title: level.title,
      total,
      mastered,
      learning,
      notStarted,
      masteredPct: total > 0 ? (mastered / total) * 100 : 0,
      learningPct: total > 0 ? (learning / total) * 100 : 0,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200 mb-8">
      <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center">
        <span className="text-2xl mr-2">📊</span> 掌握度矩阵
      </h2>
      
      <div className="space-y-6">
        {levelStats.map((stat) => {
          if (stat.total === 0) return null;
          
          return (
            <div key={stat.id}>
              <div className="flex justify-between items-end mb-2">
                <div className="text-sm font-bold text-gray-700">{stat.title}</div>
                <div className="text-xs font-bold text-gray-400">
                  {stat.mastered} / {stat.total}
                </div>
              </div>
              
              <div className="h-3 bg-gray-100 rounded-full flex overflow-hidden">
                {stat.masteredPct > 0 && (
                  <div 
                    style={{ width: `${stat.masteredPct}%` }} 
                    className="bg-[#58CC02] h-full"
                    title={`已掌握: ${stat.mastered}`}
                  />
                )}
                {stat.learningPct > 0 && (
                  <div 
                    style={{ width: `${stat.learningPct}%` }} 
                    className="bg-[#FFC800] h-full"
                    title={`学习中: ${stat.learning}`}
                  />
                )}
              </div>
              
              <div className="flex text-[10px] font-bold text-gray-400 mt-1 gap-3">
                {stat.mastered > 0 && <span className="text-[#58CC02]">{stat.mastered} 已掌握</span>}
                {stat.learning > 0 && <span className="text-[#FFC800]">{stat.learning} 学习中</span>}
                {stat.notStarted > 0 && <span>{stat.notStarted} 未开始</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center mt-6 gap-4 text-xs font-bold text-gray-500">
        <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-[#58CC02] mr-1" /> 已掌握 (连续3次答对)</div>
        <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-[#FFC800] mr-1" /> 学习中</div>
        <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-gray-100 mr-1" /> 未开始</div>
      </div>
    </div>
  );
}
