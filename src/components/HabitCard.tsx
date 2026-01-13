import { Habit } from '@/types/habit';
import { getHabitProgress, getDaysRemaining, getFrequencyLabel, getPeriodLabel } from '@/lib/habitUtils';
import { ProgressCircle } from './ProgressCircle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Flame, Calendar, Trash2, Target } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO, addDays, addWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  onToggleDay: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
}

function getMonthlyPeriods(habit: Habit) {
  const startDate = parseISO(habit.startDate);
  const months = Math.ceil(habit.durationDays / 30);
  const periods = [];
  
  for (let i = 0; i < months; i++) {
    const monthDate = addMonths(startDate, i);
    const monthStart = i === 0 ? startDate : startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const completedInMonth = habit.completedDays.filter(dayStr => {
      const day = parseISO(dayStr);
      return isWithinInterval(day, { start: monthStart, end: monthEnd });
    }).length;
    
    periods.push({
      label: format(monthDate, 'MMM', { locale: ptBR }),
      year: format(monthDate, 'yyyy'),
      completed: completedInMonth,
      target: habit.frequency.timesPerPeriod,
      isComplete: completedInMonth >= habit.frequency.timesPerPeriod,
      monthDate,
    });
  }
  
  return periods;
}

function getWeeklyPeriods(habit: Habit) {
  const startDate = parseISO(habit.startDate);
  const weeks = Math.ceil(habit.durationDays / 7);
  const periods = [];
  
  for (let i = 0; i < Math.min(weeks, 12); i++) { // Show max 12 weeks
    const weekDate = addWeeks(startDate, i);
    const weekStart = i === 0 ? startDate : startOfWeek(weekDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(weekDate, { weekStartsOn: 0 });
    
    const completedInWeek = habit.completedDays.filter(dayStr => {
      const day = parseISO(dayStr);
      return isWithinInterval(day, { start: weekStart, end: weekEnd });
    }).length;
    
    periods.push({
      label: `S${i + 1}`,
      completed: completedInWeek,
      target: habit.frequency.timesPerPeriod,
      isComplete: completedInWeek >= habit.frequency.timesPerPeriod,
      weekDate,
    });
  }
  
  return periods;
}

function getDailyDates(habit: Habit) {
  const startDate = parseISO(habit.startDate);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const dates = [];
  const maxDays = Math.min(habit.durationDays, 42); // Show max 6 weeks for daily
  
  for (let i = 0; i < maxDays; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    const shouldComplete = habit.frequency.type === 'custom' 
      ? habit.frequency.customDays?.includes(dayOfWeek) ?? false
      : true;
    
    dates.push({
      date,
      dateStr,
      isToday: dateStr === todayStr,
      isPast: date < today && dateStr !== todayStr,
      shouldComplete,
    });
  }
  
  return dates;
}

export function HabitCard({ habit, onToggleDay, onDelete }: HabitCardProps) {
  const progress = getHabitProgress(habit);
  const daysRemaining = getDaysRemaining(habit);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCompleted = habit.completedDays.includes(todayStr);
  
  const periodLabel = getPeriodLabel(habit.frequency.type);
  const isMonthly = habit.frequency.type === 'monthly';
  const isWeekly = habit.frequency.type === 'weekly';
  const isDaily = habit.frequency.type === 'daily' || habit.frequency.type === 'custom';
  
  const periodComplete = progress.completedThisPeriod >= progress.targetForPeriod;

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
              {habit.durationDays} dias
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span>{getFrequencyLabel(habit.frequency)}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Concluído!'}</span>
          </div>

          {/* Period progress */}
          <div className={cn(
            "flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-sm",
            periodComplete ? "bg-success-light text-success" : "bg-secondary"
          )}>
            <Target className="w-4 h-4" />
            <span>
              {progress.completedThisPeriod}/{progress.targetForPeriod} {periodLabel}
              {periodComplete && " ✓"}
            </span>
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
            {todayCompleted ? 'Registrado hoje!' : 'Registrar hoje'}
          </Button>
        </div>

        {/* Right side - Progress */}
        <div className="flex flex-col items-center gap-2">
          <ProgressCircle percentage={progress.percentage} size="md" />
          <span className="text-xs text-muted-foreground">
            {progress.completedDays}/{progress.totalDays}
          </span>
        </div>
      </div>

      {/* History view - varies by frequency type */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
          Histórico
        </p>
        
        {/* Monthly view - show months */}
        {isMonthly && (
          <div className="flex flex-wrap gap-2">
            {getMonthlyPeriods(habit).map((period, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex flex-col items-center p-2 rounded-lg min-w-[60px] transition-all',
                  period.isComplete ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                )}
              >
                <span className="text-xs font-medium capitalize">{period.label}</span>
                <span className="text-lg font-bold">{period.completed}/{period.target}</span>
                {period.isComplete && <Check className="w-3 h-3 mt-0.5" />}
              </div>
            ))}
          </div>
        )}

        {/* Weekly view - show weeks */}
        {isWeekly && (
          <>
            <div className="flex flex-wrap gap-2">
              {getWeeklyPeriods(habit).map((period, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex flex-col items-center p-2 rounded-lg min-w-[50px] transition-all',
                    period.isComplete ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}
                >
                  <span className="text-xs font-medium">{period.label}</span>
                  <span className="text-sm font-bold">{period.completed}/{period.target}</span>
                </div>
              ))}
            </div>
            {Math.ceil(habit.durationDays / 7) > 12 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{Math.ceil(habit.durationDays / 7) - 12} semanas
              </p>
            )}
          </>
        )}

        {/* Daily/Custom view - show days */}
        {isDaily && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {getDailyDates(habit).map(({ date, dateStr, isToday, isPast, shouldComplete }) => {
                const isCompleted = habit.completedDays.includes(dateStr);
                const isMissed = isPast && shouldComplete && !isCompleted;

                return (
                  <button
                    key={dateStr}
                    onClick={() => onToggleDay(habit.id, dateStr)}
                    disabled={!shouldComplete && habit.frequency.type === 'custom'}
                    title={format(date, 'dd/MM', { locale: ptBR })}
                    className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-all duration-200',
                      !shouldComplete && 'bg-muted/50 text-muted-foreground/30 cursor-not-allowed',
                      shouldComplete && !isCompleted && !isPast && 'bg-secondary text-secondary-foreground hover:bg-primary/20',
                      isCompleted && 'bg-primary text-primary-foreground',
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
            {habit.durationDays > 42 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{habit.durationDays - 42} dias restantes
              </p>
            )}
          </>
        )}
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
