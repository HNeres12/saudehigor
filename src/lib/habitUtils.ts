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
  
  // For daily, weekly, monthly - all days are potential completion days
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
    // For daily, just check this day
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completedDays.includes(dateStr) ? 1 : 0;
  }
  
  return habit.completedDays.filter(dayStr => {
    const day = parseISO(dayStr);
    return isWithinInterval(day, { start: periodStart, end: periodEnd });
  }).length;
}

export function getHabitProgress(habit: Habit): HabitProgress {
  const startDate = parseISO(habit.startDate);
  const endDate = addDays(startDate, habit.durationDays - 1);
  const today = new Date();
  
  const { type, timesPerPeriod } = habit.frequency;
  
  let totalDays = 0;
  
  if (type === 'daily') {
    // Count all days
    let currentDate = startDate;
    while (!isAfter(currentDate, endDate)) {
      totalDays++;
      currentDate = addDays(currentDate, 1);
    }
  } else if (type === 'weekly') {
    // Calculate weeks and multiply by times per week
    const weeks = Math.ceil(habit.durationDays / 7);
    totalDays = weeks * timesPerPeriod;
  } else if (type === 'monthly') {
    // Calculate months and multiply by times per month
    const months = Math.ceil(habit.durationDays / 30);
    totalDays = months * timesPerPeriod;
  } else if (type === 'custom') {
    // Count specific days
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
  
  // Calculate current streak (simplified - consecutive completions)
  let streak = 0;
  const sortedDays = [...habit.completedDays].sort().reverse();
  
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const prevDate = parseISO(sortedDays[i - 1]);
      const currDate = parseISO(sortedDays[i]);
      const diff = differenceInDays(prevDate, currDate);
      
      if (diff <= 7) { // Allow gaps up to a week for weekly habits
        streak++;
      } else {
        break;
      }
    }
  }
  
  // Get completed this period
  const completedThisPeriod = getCompletedInPeriod(habit, today);
  
  return { 
    totalDays, 
    completedDays, 
    currentStreak: streak, 
    percentage,
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

export function getHabitDates(habit: Habit): { date: Date; dateStr: string; isToday: boolean; isPast: boolean; shouldComplete: boolean }[] {
  const startDate = parseISO(habit.startDate);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const dates = [];
  for (let i = 0; i < habit.durationDays; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    dates.push({
      date,
      dateStr,
      isToday: dateStr === todayStr,
      isPast: isBefore(date, today) && dateStr !== todayStr,
      shouldComplete: shouldCompleteOnDay(habit, date),
    });
  }
  
  return dates;
}

export function getPeriodLabel(type: FrequencyType): string {
  switch (type) {
    case 'daily': return 'hoje';
    case 'weekly': return 'esta semana';
    case 'monthly': return 'este mês';
    case 'custom': return 'hoje';
  }
}
