import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export default function Card({ children, className, hover = false, glass = false, onClick, ...props }) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { y: -2, scale: 1.01 },
    transition: { type: 'spring', stiffness: 300 },
  } : {};

  return (
    <Component
      className={cn(
        'rounded-xl border',
        glass 
          ? 'bg-white/5 backdrop-blur-xl border-white/10'
          : 'bg-navy-800 border-white/10',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
}
