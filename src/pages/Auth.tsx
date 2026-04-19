import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const loginAction = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await api.login(username);
        loginAction(user);
      } else {
        if (!displayName) throw new Error('请输入展示昵称');
        const user = await api.signup(username, displayName);
        loginAction(user);
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border-2 border-b-4 border-gray-200 p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#58CC02] rounded-2xl flex items-center justify-center text-3xl">
            🧪
          </div>
        </div>
        
        <h1 className="text-2xl font-extrabold text-center text-gray-800 mb-8">
          {isLogin ? '欢迎回到 ChemMemo' : '加入 ChemMemo'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">账号 (学号/手机号)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1CB0F6] outline-none font-medium"
              placeholder="输入你的登录账号"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">展示昵称 (真实姓名)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1CB0F6] outline-none font-medium"
                placeholder="老师和同学将看到这个名字"
              />
            </div>
          )}

          {error && <div className="text-[#FF4B4B] text-sm font-bold text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl font-bold text-lg border-b-4 transition-all flex items-center justify-center bg-[#58CC02] border-[#46A302] text-white hover:bg-[#46a302] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#1CB0F6] font-bold text-sm hover:underline"
          >
            {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
