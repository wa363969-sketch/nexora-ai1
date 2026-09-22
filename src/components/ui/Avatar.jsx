import { cn, getInitials } from '../../lib/utils';

export default function Avatar({ src, name, size = 'md', className }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn('rounded-full object-cover border-2 border-white/10', sizes[size], className)}
      />
    );
  }

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold',
      'bg-gradient-to-br from-blue-500 to-violet-500 text-white',
      sizes[size],
      className
    )}>
      {getInitials(name)}
    </div>
  );
}
