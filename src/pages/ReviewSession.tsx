import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lesson } from './Lesson';
import { useStore } from '../store/useStore';

export function ReviewSession() {
  const navigate = useNavigate();
  const { buildTodayReviewPlan, getTodayReviewSummary } = useStore();
  const [equationIds, setEquationIds] = useState<string[]>([]);

  useEffect(() => {
    setEquationIds(buildTodayReviewPlan().equationIds);
  }, [buildTodayReviewPlan]);

  if (equationIds.length === 0) {
    const summary = getTodayReviewSummary();
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="text-7xl mb-6">📒</div>
        <h1 className="text-2xl font-bold mb-3">暂无可复习内容</h1>
        <p className="text-gray-500 mb-8">
          先去闯关做题积累记录，再回来复习吧。
          <br />
          今日任务：{summary.doneCount}/{summary.targetCount}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-2xl border-2 border-b-4 border-[#1CB0F6] bg-[#1CB0F6] text-white font-extrabold active:translate-y-1 active:border-b-0"
        >
          去闯关
        </button>
      </div>
    );
  }

  return (
    <Lesson
      mode="review"
      equationIds={equationIds}
      onExit={() => navigate('/review')}
      onComplete={() => navigate('/review')}
    />
  );
}

