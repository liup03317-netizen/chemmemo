import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Users, Plus, LogIn, Loader2, Crown } from 'lucide-react';

export function ClassManager() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  
  const [teaching, setTeaching] = useState<any>([]);
  const [learning, setLearning] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const loadClasses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getUserClasses(user.id);
      setTeaching(data.teaching);
      setLearning(data.learning);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [user]);

  const handleAction = async () => {
    if (!user || !inputValue.trim()) return;
    setError('');
    try {
      if (isCreating) {
        await api.createClass(user.id, inputValue.trim());
      } else {
        await api.joinClass(user.id, inputValue.trim());
      }
      setInputValue('');
      setIsCreating(false);
      setIsJoining(false);
      await loadClasses();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200 mb-8">
      <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center">
        <Users className="w-7 h-7 text-[#1CB0F6] mr-2" />
        我的班级
      </h2>

      {/* Teaching Classes */}
      {teaching.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">我是老师</h3>
          <div className="space-y-3">
            {teaching.map(c => (
              <div 
                key={c.id} 
                onClick={() => navigate(`/class/${c.id}/teacher`)}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#1CB0F6] cursor-pointer transition-colors group flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-gray-800 text-lg flex items-center">
                    <Crown className="w-5 h-5 text-[#FFC800] mr-2" />
                    {c.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500 mt-1">邀请码: <span className="font-bold text-[#1CB0F6]">{c.join_code}</span></div>
                </div>
                <div className="text-[#1CB0F6] font-bold opacity-0 group-hover:opacity-100 transition-opacity">管理</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Classes */}
      {learning.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">我是学生</h3>
          <div className="space-y-3">
            {learning.map(c => (
              <div 
                key={c.id} 
                onClick={() => navigate(`/class/${c.id}/student`)}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#58CC02] cursor-pointer transition-colors group flex justify-between items-center"
              >
                <div className="font-bold text-gray-800 text-lg">{c.name}</div>
                <div className="text-[#58CC02] font-bold opacity-0 group-hover:opacity-100 transition-opacity">排行榜</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {!isCreating && !isJoining ? (
        <div className="flex gap-4 mt-4">
          <button 
            onClick={() => setIsJoining(true)}
            className="flex-1 py-3 px-4 rounded-xl font-bold border-2 border-b-4 transition-all flex items-center justify-center text-[#1CB0F6] bg-blue-50 border-[#1CB0F6] hover:bg-blue-100"
          >
            <LogIn className="w-5 h-5 mr-2" /> 加入班级
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex-1 py-3 px-4 rounded-xl font-bold border-2 border-b-4 transition-all flex items-center justify-center text-[#CE82FF] bg-purple-50 border-[#CE82FF] hover:bg-purple-100"
          >
            <Plus className="w-5 h-5 mr-2" /> 创建班级
          </button>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 mt-4">
          <h3 className="font-bold text-gray-800 mb-2">
            {isCreating ? '创建新班级' : '加入班级'}
          </h3>
          <input
            type="text"
            placeholder={isCreating ? "输入班级名称 (如: 高一3班)" : "输入6位班级邀请码"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1CB0F6] outline-none font-medium mb-2"
          />
          {error && <div className="text-[#FF4B4B] text-sm font-bold mb-2">{error}</div>}
          <div className="flex gap-2">
            <button 
              onClick={() => { setIsCreating(false); setIsJoining(false); setInputValue(''); setError(''); }}
              className="flex-1 py-2 rounded-lg font-bold bg-gray-200 text-gray-600 hover:bg-gray-300"
            >
              取消
            </button>
            <button 
              onClick={handleAction}
              className="flex-1 py-2 rounded-lg font-bold bg-[#1CB0F6] text-white hover:bg-blue-500"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}