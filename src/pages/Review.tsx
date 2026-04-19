import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Flame, Target, TrendingDown } from 'lucide-react';

export function Review() {
  const navigate = useNavigate();
  const { getTodayReviewSummary } = useStore();
  const summary = getTodayReviewSummary();

  const weakList = Object.entries(summary.weakCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)
    .slice(0, 3);

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200 mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">今日任务</div>
              <div className="text-2xl font-extrabold text-gray-800 mt-1">
                {summary.doneCount}/{summary.targetCount}
              </div>
              <div className="text-sm font-bold text-gray-500 mt-1">
                到期 {summary.dueCount} · 正确 {summary.correctCount}
              </div>
            </div>
            <button
              onClick={() => navigate('/review/session')}
              className="px-5 py-3 rounded-2xl border-2 border-b-4 border-[#1CB0F6] bg-[#1CB0F6] text-white font-extrabold active:translate-y-1 active:border-b-0"
            >
              开始复习
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border-2 border-b-4 border-gray-200 flex flex-col items-center">
            <Target className="w-10 h-10 text-[#1CB0F6] mb-2" />
            <div className="text-xl font-bold text-gray-800">{summary.dueCount}</div>
            <div className="text-sm font-bold text-gray-400 uppercase">今日到期</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border-2 border-b-4 border-gray-200 flex flex-col items-center">
            <Flame className="w-10 h-10 text-[#FF4B4B] fill-current mb-2" />
            <div className="text-xl font-bold text-gray-800">{summary.targetCount - summary.doneCount}</div>
            <div className="text-sm font-bold text-gray-400 uppercase">剩余题数</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-6 h-6 text-gray-500" />
            <h2 className="text-xl font-extrabold text-gray-800">弱点</h2>
          </div>

          {weakList.length === 0 ? (
            <div className="text-sm font-bold text-gray-400">暂无弱点数据，先做几题再来查看。</div>
          ) : (
            <div className="space-y-3">
              {weakList.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-600">
                    {k === 'condition_missing'
                      ? '缺少条件'
                      : k === 'condition_wrong'
                        ? '条件错误'
                        : k === 'symbol_missing_or_wrong'
                          ? '符号（↑↓）'
                          : k === 'balance_wrong'
                            ? '配平'
                            : '生成物'}
                  </div>
                  <div className="text-sm font-extrabold text-gray-800">{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

