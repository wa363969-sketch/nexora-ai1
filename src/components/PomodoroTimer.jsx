import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiClock, 
  HiPlay, 
  HiPause, 
  HiArrowPath, 
  HiChevronDown, 
  HiChevronUp, 
  HiSparkles,
  HiXMark
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function PomodoroTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' (25m) | 'short' (5m) | 'long' (15m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const MODES = {
    work: { label: 'Focus Sprint', duration: 25 * 60, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    short: { label: 'Short Break', duration: 5 * 60, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    long: { label: 'Deep Rest', duration: 15 * 60, color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  };

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === 'work') {
        setSessionsCompleted(prev => prev + 1);
        toast.success('🎯 Focus session complete! Time for a well-deserved break.');
        switchMode('short');
      } else {
        toast('Break finished! Ready to refocus?', { icon: '⚡' });
        switchMode('work');
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  function switchMode(newMode) {
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(false);
  }

  function toggleTimer() {
    setIsRunning(!isRunning);
  }

  function resetTimer() {
    setIsRunning(false);
    setTimeLeft(MODES[mode].duration);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-3 w-80 p-5 rounded-2xl bg-navy-900 border border-white/10 shadow-2xl backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  NEXORA Focus Engine
                </h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-navy-950/70 border border-white/5 text-[11px] font-semibold">
              <button
                onClick={() => switchMode('work')}
                className={`py-1 rounded-lg transition-all ${mode === 'work' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => switchMode('short')}
                className={`py-1 rounded-lg transition-all ${mode === 'short' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Break (5m)
              </button>
              <button
                onClick={() => switchMode('long')}
                className={`py-1 rounded-lg transition-all ${mode === 'long' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Rest (15m)
              </button>
            </div>

            {/* Big Countdown Display */}
            <div className="text-center py-2">
              <div className="text-4xl font-black font-mono tracking-tight text-white">
                {timeFormatted}
              </div>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${MODES[mode].color}`}>
                {MODES[mode].label}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleTimer}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-navy-950'
                    : 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white shadow-blue-500/25'
                }`}
              >
                {isRunning ? (
                  <>
                    <HiPause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <HiPlay className="w-4 h-4" /> Start Focus
                  </>
                )}
              </button>
              <button
                onClick={resetTimer}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
                title="Reset timer"
              >
                <HiArrowPath className="w-4 h-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
              <span>Completed Sprints:</span>
              <span className="font-bold text-white">{sessionsCompleted} sessions</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 rounded-full bg-navy-900/90 border border-white/15 hover:border-blue-500/50 backdrop-blur-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold text-white hover:scale-105 transition-all group"
      >
        <HiClock className={`w-4 h-4 ${isRunning ? 'text-blue-400 animate-spin' : 'text-gray-400 group-hover:text-blue-400'}`} />
        <span className="font-mono">{isRunning ? timeFormatted : 'Focus Timer'}</span>
        {sessionsCompleted > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-[10px] text-white">
            {sessionsCompleted}
          </span>
        )}
      </button>
    </div>
  );
}
