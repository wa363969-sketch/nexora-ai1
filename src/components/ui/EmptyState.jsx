import { cn } from '../../lib/utils';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, action, actionLabel, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400 max-w-sm mb-6">{description}</p>}
      {action && (
        <Button onClick={action}>{actionLabel || 'Get Started'}</Button>
      )}
    </div>
  );
}
