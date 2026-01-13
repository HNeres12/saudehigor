import { Habit, HabitProgress, Frequency, FrequencyType } from '@/types/habit';
import { format, addDays, isAfter, isBefore, parseISO, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function getFrequencyLabel(frequency: Frequency): string {
  const { type, timesPerPeriod } = frequency;
  
  switch (type) {
    case 'daily':
      return 'Todos os dias';
    case 'weekly':
      return timesPerPeriod === 1 
        ? '1 vez por semana' 
        : `${timesPerPeriod} vezes por semana`;
    case 'monthly':
      return timesPerPeriod === 1 
        ? '1 vez por mês' 
        : `${timesPerPeriod} vezes por mês`;
    case 'custom':
      return 'Dias específicos';
  }
}

export function getDayName(day: number): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[day];
}

export function shouldCompleteOnDay(habit: Habit, date: Date): boolean {
  const { type, customDays } = habit.frequency;
  const dayOfWeek = date.getDay();
  
  if (type === 'custom') {
    return customDays?.includes(dayOfWeek) ?? false;
  }
  
  return true;
}

export function getCompletedInPeriod(habit: Habit, date: Date): number {
  const { type } = habit.frequency;
  
  let periodStart: Date;
  let periodEnd: Date;
  
  if (type === 'weekly') {
    periodStart = startOfWeek(date, { weekStartsOn: 0 });
    periodEnd = endOfWeek(date, { weekStartsOn: 0 });
  } else if (type === 'monthly') {
    periodStart = startOfMonth(date);
    periodEnd = endOfMonth(date);
  } else {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completedDays.includes(dateStr) ? 1 : 0;
  }
  
  return habit.completedDays.filter(dayStr => {
    const day = parseISO(dayStr);
    return isWithinInterval(day, { start: periodStart, end: periodEnd });
  }).length;
}

export function getHabitProgress(habit: Habit): HabitProgress {
  const { type, timesPerPeriod } = habit.frequency;
  const today = new Date();
  
  let totalDays = 0;
  
  if (type === 'daily') {
    totalDays = habit.durationDays;
  } else if (type === 'weekly') {
    const weeks = Math.ceil(habit.durationDays / 7);
    totalDays = weeks * timesPerPeriod;
  } else if (type === 'monthly') {
    const months = Math.ceil(habit.durationDays / 30);
    totalDays = months * timesPerPeriod;
  } else if (type === 'custom') {
    const startDate = parseISO(habit.startDate);
    const endDate = addDays(startDate, habit.durationDays - 1);
    let currentDate = startDate;
    while (!isAfter(currentDate, endDate)) {
      if (shouldCompleteOnDay(habit, currentDate)) {
        totalDays++;
      }
      currentDate = addDays(currentDate, 1);
    }
  }
  
  const completedDays = habit.completedDays.length;
  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  
  // Calculate streak
  let streak = habit.completedDays.length;
  
  // Get completed this period
  const completedThisPeriod = getCompletedInPeriod(habit, today);
  
  return { 
    totalDays, 
    completedDays, 
    currentStreak: streak, 
    percentage: Math.min(percentage, 100),
    targetForPeriod: type === 'daily' ? 1 : timesPerPeriod,
    completedThisPeriod
  };
}

export function getDaysRemaining(habit: Habit): number {
  const startDate = parseISO(habit.startDate);
  const endDate = addDays(startDate, habit.durationDays - 1);
  const today = new Date();
  
  if (isAfter(today, endDate)) return 0;
  return differenceInDays(endDate, today) + 1;
}

export function getPeriodLabel(type: FrequencyType): string {
  switch (type) {
    case 'daily': return 'hoje';
    case 'weekly': return 'esta semana';
    case 'monthly': return 'este mês';
    case 'custom': return 'hoje';
  }
}
