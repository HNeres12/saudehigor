import { useState, useEffect } from 'react';
import { DailyLog, DAY_TYPE_CONFIG } from '@/types/dailyLog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Square, Clock } from 'lucide-react';
import { differenceInSeconds, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface FastingTimerProps {
  log: DailyLog | null;
  onStart: () => void;
  onEnd: () => void;
}

export function FastingTimer({ log, onStart, onEnd }: FastingTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const targetHours = log?.fastingTargetHours || 16;
  const targetSeconds = targetHours * 3600;
  
  const isActive = log?.fastingStart && !log?.fastingEnd;
  const isCompleted = log?.fastingCompleted;

  useEffect(() => {
    if (!log?.fastingStart) {
      setElapsed(0);
      return;
    }

    const startTime = parseISO(log.fastingStart);
    const endTime = log.fastingEnd ? parseISO(log.fastingEnd) : new Date();
    
    const calculateElapsed = () => {
      const now = log.fastingEnd ? parseISO(log.fastingEnd) : new Date();
      return differenceInSeconds(now, startTime);
    };

    setElapsed(calculateElapsed());

    if (!log.fastingEnd) {
      const interval = setInterval(() => {
        setElapsed(calculateElapsed());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [log?.fastingStart, log?.fastingEnd]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((elapsed / targetSeconds) * 100, 100);
  const remainingSeconds = Math.max(targetSeconds - elapsed, 0);
  const metaAlcancada = elapsed >= targetSeconds;

  const dayType = log?.dayType || 'B';
  const config = DAY_TYPE_CONFIG[dayType];

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Jejum</h3>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          config.bgLight, config.textColor
        )}>
          Meta: {config.fastingRange}
        </span>
      </div>

      {/* Timer display */}
      <div className="text-center py-6">
        <div className={cn(
          'text-5xl font-bold font-mono mb-2',
          isActive && !metaAlcancada && 'text-orange-500',
          metaAlcancada && 'text-primary',
          !isActive && !isCompleted && 'text-muted-foreground'
        )}>
          {formatTime(elapsed)}
        </div>
        
        {isActive && !metaAlcancada && (
          <p className="text-sm text-muted-foreground">
            Faltam {formatTime(remainingSeconds)} para a meta
          </p>
        )}
        {metaAlcancada && isActive && (
          <p className="text-sm text-primary font-medium">
            🎯 Meta alcançada! Pode encerrar quando quiser
          </p>
        )}
        {isCompleted && (
          <p className="text-sm text-primary font-medium">
            ✅ Jejum concluído!
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className={cn(
            'h-full transition-all duration-500 rounded-full',
            metaAlcancada ? 'gradient-primary' : 'bg-orange-400'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isActive && !isCompleted && (
          <Button onClick={onStart} className="flex-1 gradient-primary text-primary-foreground">
            <Play className="w-4 h-4 mr-2" />
            Iniciar Jejum
          </Button>
        )}
        {isActive && (
          <Button onClick={onEnd} variant="outline" className="flex-1">
            <Square className="w-4 h-4 mr-2" />
            Encerrar Jejum
          </Button>
        )}
        {isCompleted && (
          <div className="flex-1 text-center py-2 text-primary font-medium">
            <Clock className="w-4 h-4 inline mr-2" />
            {formatTime(elapsed)} de jejum hoje
          </div>
        )}
      </div>
    </Card>
  );
}
