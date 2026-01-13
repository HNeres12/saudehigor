import { Habit } from '@/types/habit';
import { getHabitProgress, getDaysRemaining, getFrequencyLabel, getHabitDates } from '@/lib/habitUtils';
import { ProgressCircle } from './ProgressCircle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Flame, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  onToggleDay: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onToggleDay, onDelete }: HabitCardProps) {
  const progress = getHabitProgress(habit);
  const daysRemaining = getDaysRemaining(habit);
  const habitDates = getHabitDates(habit);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCompleted = habit.completedDays.includes(todayStr);

  return (
    <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300 gradient-card border-0 animate-slide-up">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-xl text-foreground truncate">{habit.name}</h3>
            {progress.currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-streak">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{progress.currentStreak}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {habit.duration} dias
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span>{getFrequencyLabel(habit.frequency)}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Concluído!'}</span>
          </div>

          {/* Today's check button */}
          <Button
            onClick={() => onToggleDay(habit.id, todayStr)}
            variant={todayCompleted ? 'default' : 'outline'}
            className={cn(
              'transition-all duration-300',
              todayCompleted && 'gradient-primary shadow-glow'
            )}
          >
            <Check className={cn('w-4 h-4 mr-2', todayCompleted && 'animate-check')} />
            {todayCompleted ? 'Concluído hoje!' : 'Marcar hoje'}
          </Button>
        </div>

        {/* Right side - Progress */}
        <div className="flex flex-col items-center gap-2">
          <ProgressCircle percentage={progress.percentage} size="md" />
          <span className="text-xs text-muted-foreground">
            {progress.completedDays}/{progress.totalDays} dias
          </span>
        </div>
      </div>

      {/* Calendar view */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
          Histórico
        </p>
        <div className="flex flex-wrap gap-1.5">
          {habitDates.slice(0, 30).map(({ date, dateStr, isToday, isPast, shouldComplete }) => {
            const isCompleted = habit.completedDays.includes(dateStr);
            const isMissed = isPast && shouldComplete && !isCompleted;

            return (
              <button
                key={dateStr}
                onClick={() => onToggleDay(habit.id, dateStr)}
                disabled={!shouldComplete}
                title={format(date, 'dd/MM', { locale: ptBR })}
                className={cn(
                  'w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-all duration-200',
                  !shouldComplete && 'bg-muted/50 text-muted-foreground/30 cursor-not-allowed',
                  shouldComplete && !isCompleted && !isPast && 'bg-secondary text-secondary-foreground hover:bg-primary/20',
                  shouldComplete && isCompleted && 'bg-primary text-primary-foreground',
                  isMissed && 'bg-destructive/10 text-destructive',
                  isToday && !isCompleted && 'ring-2 ring-primary ring-offset-1'
                )}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  format(date, 'd')
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Delete button */}
      <div className="mt-4 pt-4 border-t border-border flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(habit.id)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Excluir
        </Button>
      </div>
    </Card>
  );
}
