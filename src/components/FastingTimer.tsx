import { useState, useEffect } from 'react';
import { DailyLog, DAY_TYPE_CONFIG } from '@/types/dailyLog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer, Play, Square, Clock, RotateCcw, Edit3, Check, X } from 'lucide-react';
import { differenceInSeconds, parseISO, format, set } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FastingTimerProps {
  log: DailyLog | null;
  onStart: () => void;
  onEnd: () => void;
  onReset: () => void;
  onManualEntry: (startTime: string, endTime?: string) => void;
}

export function FastingTimer({ log, onStart, onEnd, onReset, onManualEntry }: FastingTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');
  
  const targetHours = log?.fastingTargetHours || 16;
  const targetSeconds = targetHours * 3600;
  
  const isActive = log?.fastingStart && !log?.fastingEnd;
  const isCompleted = log?.fastingCompleted;
  const hasStarted = !!log?.fastingStart;

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

  // Set default values when opening manual dialog
  useEffect(() => {
    if (isManualDialogOpen) {
      const now = new Date();
      if (log?.fastingStart) {
        setManualStart(format(parseISO(log.fastingStart), 'HH:mm'));
        if (log?.fastingEnd) {
          setManualEnd(format(parseISO(log.fastingEnd), 'HH:mm'));
        } else {
          setManualEnd('');
        }
      } else {
        // Default to now minus target hours for start
        const defaultStart = new Date(now.getTime() - (targetHours * 60 * 60 * 1000));
        setManualStart(format(defaultStart, 'HH:mm'));
        setManualEnd(format(now, 'HH:mm'));
      }
    }
  }, [isManualDialogOpen, log?.fastingStart, log?.fastingEnd, targetHours]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualSave = () => {
    if (!manualStart) return;

    const today = new Date();
    const [startHour, startMin] = manualStart.split(':').map(Number);
    const startDate = set(today, { hours: startHour, minutes: startMin, seconds: 0 });
    
    // If start time is in the future, assume it was yesterday
    let finalStartDate = startDate;
    if (startDate > today) {
      finalStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    }

    let finalEndDate: Date | undefined;
    if (manualEnd) {
      const [endHour, endMin] = manualEnd.split(':').map(Number);
      const endDate = set(today, { hours: endHour, minutes: endMin, seconds: 0 });
      finalEndDate = endDate;
      
      // If end is before start, it's the next day
      if (finalEndDate < finalStartDate) {
        finalEndDate = new Date(finalEndDate.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    onManualEntry(
      finalStartDate.toISOString(),
      finalEndDate?.toISOString()
    );
    setIsManualDialogOpen(false);
  };

  const progress = Math.min((elapsed / targetSeconds) * 100, 100);
  const remainingSeconds = Math.max(targetSeconds - elapsed, 0);
  const metaAlcancada = elapsed >= targetSeconds;

  const dayType = log?.dayType || 'B';
  const config = DAY_TYPE_CONFIG[dayType];

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Jejum</h3>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            config.bgLight, config.textColor
          )}>
            Meta: {config.fastingRange}
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Inserir manualmente">
                <Edit3 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[320px]">
              <DialogHeader>
                <DialogTitle>Inserir horário manualmente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Início do jejum</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={manualStart}
                    onChange={(e) => setManualStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">Fim do jejum (opcional)</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={manualEnd}
                    onChange={(e) => setManualEnd(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio se ainda estiver em jejum
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsManualDialogOpen(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleManualSave}
                    disabled={!manualStart}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {hasStarted && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive" 
              title="Reiniciar"
              onClick={onReset}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
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
