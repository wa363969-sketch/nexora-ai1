import { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { 
  HiCalendarDays, 
  HiChevronLeft, 
  HiChevronRight, 
  HiPlus, 
  HiCheckCircle,
  HiClock
} from 'react-icons/hi2';
import { getTasks, getProjects } from '../services/dataService';
import { getPriorityColor } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    loadCalendarData();
  }, []);

  async function loadCalendarData() {
    try {
      const [tList, pList] = await Promise.all([getTasks(), getProjects()]);
      setTasks(tList);
      setProjects(pList);
    } catch (e) {
      toast.error('Failed to load calendar events');
    }
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDayTasks = tasks.filter(t => 
    t.deadline && isSameDay(new Date(t.deadline), selectedDay)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HiCalendarDays className="w-7 h-7 text-violet-400" /> Sprint Calendar
          </h1>
          <p className="text-xs text-gray-400">
            Visualize release milestones and upcoming sprint task cutoffs.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-navy-900 border border-white/10 p-1.5 rounded-xl">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 text-xs sm:text-sm font-bold text-white min-w-[130px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <HiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 bg-navy-900/80 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[11px] font-bold text-gray-400 py-1 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const dayTasks = tasks.filter(t => t.deadline && isSameDay(new Date(t.deadline), day));
              const isSelected = isSameDay(day, selectedDay);
              const inCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[85px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-violet-500 bg-violet-500/10'
                      : inCurrentMonth
                      ? 'border-white/5 bg-navy-950/40 hover:border-white/20'
                      : 'border-transparent bg-navy-950/10 opacity-30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isTodayDate
                        ? 'bg-blue-500 text-white'
                        : isSelected
                        ? 'text-violet-300'
                        : 'text-gray-300'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    )}
                  </div>

                  {/* Task Pills */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map(dt => (
                      <div
                        key={dt.$id}
                        className="truncate text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-medium"
                      >
                        {dt.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-gray-500 font-bold">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Selected Day's Schedule */}
        <div className="lg:col-span-4 bg-navy-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white">
              Schedule for {format(selectedDay, 'EEEE, MMM d')}
            </h3>
            <p className="text-xs text-gray-400">{selectedDayTasks.length} deadlines scheduled</p>
          </div>

          <div className="space-y-3">
            {selectedDayTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                No sprint deadlines scheduled for this date.
              </div>
            ) : (
              selectedDayTasks.map(t => (
                <div
                  key={t.$id}
                  className="p-3.5 rounded-xl bg-navy-950/80 border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400">{t.projectName}</span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">{t.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-white/5">
                    <span>Assignee: {t.assigneeName}</span>
                    <span className="capitalize text-blue-400 font-medium">{t.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
