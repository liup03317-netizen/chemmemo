import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Loader2, Users, ArrowLeft, Trophy, Crown } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const tagLabels: Record<string, string> = {
  condition_missing: '条件遗漏',
  condition_wrong: '条件错误',
  symbol_missing_or_wrong: '符号错误',
  products_wrong: '产物错误',
  balance_wrong: '配平错误',
};

export function TeacherDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getClassDetails(id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1CB0F6]" /></div>;
  }

  if (!data) {
    return <div className="text-center py-20 font-bold text-gray-500">无法加载班级数据</div>;
  }

  const { classInfo, students, progressRecords } = data;

  // Aggregate mistakes
  const totalMistakes: Record<string, number> = {
    condition_missing: 0,
    condition_wrong: 0,
    symbol_missing_or_wrong: 0,
    products_wrong: 0,
    balance_wrong: 0,
  };

  progressRecords.forEach((p: any) => {
    if (p.wrong_counts) {
      Object.keys(p.wrong_counts).forEach(k => {
        if (totalMistakes[k] !== undefined) {
          totalMistakes[k] += p.wrong_counts[k];
        }
      });
    }
  });

  const radarData = Object.entries(totalMistakes).map(([key, value]) => ({
    subject: tagLabels[key] || key,
    A: value,
    fullMark: Math.max(10, ...Object.values(totalMistakes)),
  }));

  const totalErrors = Object.values(totalMistakes).reduce((a, b) => a + b, 0);
  const avgMastery = students.length > 0 
    ? students.reduce((acc: number, s: any) => acc + s.mastery_rate, 0) / students.length 
    : 0;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center text-gray-400 font-bold hover:text-gray-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> 返回档案
        </button>

        <div className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800 flex items-center">
                <Crown className="w-6 h-6 text-[#FFC800] mr-2" />
                {classInfo.name}
              </h1>
              <p className="text-gray-500 font-bold mt-1 flex items-center">
                <Users className="w-4 h-4 mr-1" /> {students.length} 名学生
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-400 uppercase">邀请码</div>
              <div className="text-2xl font-black text-[#1CB0F6] tracking-widest">{classInfo.join_code}</div>
            </div>
          </div>
        </div>

        {/* Class Average Mastery */}
        <div className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">全班平均掌握率</h2>
            <p className="text-gray-500 text-sm font-medium">连续3次答对即视为掌握</p>
          </div>
          <div className="text-4xl font-black text-[#58CC02]">{avgMastery.toFixed(1)}%</div>
        </div>

        {/* Class Weakness Radar */}
        <div className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">全班易错点诊断</h2>
          {totalErrors === 0 ? (
            <div className="text-center py-10 text-gray-400 font-bold">暂无学生错误数据</div>
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar name="错误次数" dataKey="A" stroke="#FF4B4B" fill="#FF4B4B" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Roster */}
        <h2 className="text-xl font-extrabold text-gray-800 mb-4 px-2">学生列表</h2>
        <div className="space-y-3">
          {students.map((student: any) => (
            <div key={student.id} className="bg-white rounded-xl p-4 border-2 border-b-4 border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl mr-3">
                  {student.avatar_emoji}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{student.display_name} <span className="text-xs text-gray-400 font-normal">@{student.username}</span></div>
                  <div className="text-xs font-bold text-[#FFC800] flex items-center mt-1">
                    <Trophy className="w-3 h-3 mr-1" /> {student.xp} XP
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-[#58CC02]">{student.mastery_rate.toFixed(0)}%</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">掌握率</div>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="text-center py-8 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-xl">
              还没有学生加入班级，把邀请码发给他们吧！
            </div>
          )}
        </div>
      </main>
    </>
  );
}
