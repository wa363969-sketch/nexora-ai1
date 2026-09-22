import { cn } from '../../lib/utils';

export default function Skeleton({ className, count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('skeleton rounded-lg bg-white/5', className)} />
      ))}
    </>
  );
}
