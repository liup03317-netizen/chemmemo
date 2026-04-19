import React from 'react';
import { useStore } from '../../store/useStore';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { ShieldAlert } from 'lucide-react';

const tagLabels: Record<string, string> = {
  condition_missing: '条件遗漏',
  condition_wrong: '条件错误',
  symbol_missing_or_wrong: '符号错误',
  products_wrong: '产物错误',
  balance_wrong: '配平错误',
};

export function WeaknessRadar() {
  const { getGlobalStats } = useStore();
  const stats = getGlobalStats();

  const data = Object.entries(stats.totalMistakes).map(([key, value]) => ({
    subject: tagLabels[key] || key,
    A: value,
    fullMark: Math.max(10, ...Object.values(stats.totalMistakes)), // dynamic max to keep shape reasonable
  }));

  const totalErrors = Object.values(stats.totalMistakes).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200 mb-8 relative">
      <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center">
        <ShieldAlert className="w-7 h-7 text-[#FF4B4B] mr-2" />
        薄弱点诊断
      </h2>

      {totalErrors === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4 opacity-50">🎯</div>
          <p className="text-gray-500 font-bold text-center">
            暂无错误记录<br />
            <span className="text-sm font-normal">多练习几次，诊断图就会在这里出现哦</span>
          </p>
        </div>
      ) : (
        <>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 'auto']} 
                  tick={false} 
                  axisLine={false} 
                />
                <Radar
                  name="错误次数"
                  dataKey="A"
                  stroke="#FF4B4B"
                  fill="#FF4B4B"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick list summary */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.map((item) => (
              <div key={item.subject} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                <span className="font-bold text-gray-600">{item.subject}</span>
                <span className="font-bold text-[#FF4B4B]">{item.A} 次</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
