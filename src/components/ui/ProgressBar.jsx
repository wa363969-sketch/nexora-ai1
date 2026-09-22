import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0, max = 100, size = 'md', showLabel = false, className }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const sizes = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
  
  const getColor = () => {
    if (percentage >= 75) return 'from-green-500 to-emerald-500';
    if (percentage >= 50) return 'from-blue-500 to-cyan-500';
    if (percentage >= 25) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-white/10 rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', getColor())}
        />
      </div>
    </div>
  );
}
