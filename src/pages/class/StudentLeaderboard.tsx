import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Loader2, ArrowLeft, Trophy, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function StudentLeaderboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getClassDetails(id)
      .then(res => {
        // Sort students by mastery rate
        res.students.sort((a: any, b: any) => b.mastery_rate - a.mastery_rate);
        setData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1CB0F6]" /></div>;
  }

  if (!data) {
    return <div className="text-center py-20 font-bold text-gray-500">无法加载班级数据</div>;
  }

  const { classInfo, students } = data;

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

        <div className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center">
              {classInfo.name}
            </h1>
            <p className="text-gray-500 font-bold mt-1 flex items-center">
              <Users className="w-4 h-4 mr-1" /> 班级排行榜
            </p>
          </div>
          <div className="w-16 h-16 bg-[#1CB0F6] rounded-2xl flex items-center justify-center text-3xl">
            🏆
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-gray-800 mb-4 px-2">掌握度排名</h2>
        <div className="space-y-3">
          {students.map((student: any, idx: number) => {
            const isMe = student.id === user?.id;
            
            return (
              <div 
                key={student.id} 
                className={`rounded-xl p-4 border-2 border-b-4 flex items-center justify-between transition-transform ${
                  isMe 
                    ? 'bg-blue-50 border-[#1CB0F6] scale-[1.02]' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-8 font-black text-xl text-gray-400 mr-2 text-center">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl mr-3">
                    {student.avatar_emoji}
                  </div>
                  <div>
                    <div className={`font-bold ${isMe ? 'text-[#1CB0F6]' : 'text-gray-800'}`}>
                      {student.display_name} {isMe && '(我)'}
                    </div>
                    <div className="text-xs font-bold text-[#FFC800] flex items-center mt-1">
                      <Trophy className="w-3 h-3 mr-1" /> {student.xp} XP
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black ${isMe ? 'text-[#1CB0F6]' : 'text-[#58CC02]'}`}>
                    {student.mastery_rate.toFixed(1)}%
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">掌握率</div>
                </div>
              </div>
            );
          })}
          {students.length === 0 && (
            <div className="text-center py-8 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-xl">
              暂无学生排名
            </div>
          )}
        </div>
      </main>
    </>
  );
}
