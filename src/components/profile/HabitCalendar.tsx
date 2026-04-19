import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  startOfWeek, 
  endOfWeek
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function HabitCalendar() {
  const { dailyReviews } = useStore();
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // Calendar grid includes leading/trailing days from other months to fill the weeks
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Helpers to fetch intensity based on doneCount
  const getIntensityColor = (doneCount: number) => {
    if (doneCount === 0) return 'bg-gray-100';
    if (doneCount <= 5) return 'bg-[#a3e635] text-white'; // light green
    if (doneCount <= 15) return 'bg-[#58CC02] text-white'; // duolingo green
    return 'bg-[#46a302] text-white'; // dark green
  };

  const getBorderColor = (doneCount: number, currentDay: boolean) => {
    if (currentDay) return 'border-2 border-gray-800';
    if (doneCount === 0) return 'border-2 border-b-4 border-gray-200';
    return 'border-2 border-b-4 border-transparent';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-b-4 border-gray-200 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-extrabold text-gray-800 flex items-center">
          <span className="text-2xl mr-2">📅</span> 学习日历
        </h2>
        <span className="text-gray-500 font-bold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: zhCN })}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400">
        <div>一</div>
        <div>二</div>
        <div>三</div>
        <div>四</div>
        <div>五</div>
        <div>六</div>
        <div>日</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dailyReview = dailyReviews[dateStr];
          const doneCount = dailyReview?.doneCount || 0;
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={idx}
              className={`
                aspect-square rounded-xl flex items-center justify-center font-bold text-sm
                transition-transform hover:scale-105 cursor-default relative group
                ${getIntensityColor(doneCount)}
                ${getBorderColor(doneCount, isCurrentDay)}
                ${!isCurrentMonth ? 'opacity-30' : ''}
              `}
            >
              {format(day, 'd')}
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {doneCount > 0 ? `复习了 ${doneCount} 题` : '未复习'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-end mt-4 text-xs font-bold text-gray-400 items-center gap-2">
        <span>少</span>
        <div className="w-4 h-4 rounded-sm bg-gray-100 border border-gray-200"></div>
        <div className="w-4 h-4 rounded-sm bg-[#a3e635]"></div>
        <div className="w-4 h-4 rounded-sm bg-[#58CC02]"></div>
        <div className="w-4 h-4 rounded-sm bg-[#46a302]"></div>
        <span>多</span>
      </div>
    </div>
  );
}
