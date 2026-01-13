import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressCircle({ percentage, size = 'md', className }: ProgressCircleProps) {
  const sizes = {
    sm: { width: 48, strokeWidth: 4 },
    md: { width: 80, strokeWidth: 6 },
    lg: { width: 120, strokeWidth: 8 },
  };
  
  const { width, strokeWidth } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={width} height={width} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(165 65% 50%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          'font-bold text-foreground',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-lg',
          size === 'lg' && 'text-2xl'
        )}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
