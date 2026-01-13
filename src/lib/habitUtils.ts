import { Habit, HabitProgress, Frequency } from '@/types/habit';
import { format, addDays, isAfter, isBefore, parseISO, differenceInDays } from 'date-fns';

export function getFrequencyLabel(frequency: Frequency): string {
  switch (frequency) {
    case 'daily':
      return 'Todos os dias';
    case 'weekdays':
      return 'Dias úteis';
    case 'weekends':
      return 'Fins de semana';
    case 'custom':
      return 'Personalizado';
  }
}

export function getDayName(day: number): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[day];
}

export function shouldCompleteOnDay(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay();
  
  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom':
      return habit.customDays?.includes(dayOfWeek) ?? false;
  }
}

export function getHabitProgress(habit: Habit): HabitProgress {
  const startDate = parseISO(habit.startDate);
  const endDate = addDays(startDate, habit.duration - 1);
  const today = new Date();
  
  let totalDays = 0;
  let currentDate = startDate;
  
  while (!isAfter(currentDate, endDate)) {
    if (shouldCompleteOnDay(habit, currentDate)) {
      totalDays++;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  const completedDays = habit.completedDays.length;
  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  
  // Calculate current streak
  let streak = 0;
  let checkDate = today;
  
  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (isBefore(checkDate, startDate)) break;
    
    if (shouldCompleteOnDay(habit, checkDate)) {
      if (habit.completedDays.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    checkDate = addDays(checkDate, -1);
  }
  
  return { totalDays, completedDays, currentStreak: streak, percentage };
}

export function getDaysRemaining(habit: Habit): number {
  const startDate = parseISO(habit.startDate);
  const endDate = addDays(startDate, habit.duration - 1);
  const today = new Date();
  
  if (isAfter(today, endDate)) return 0;
  return differenceInDays(endDate, today) + 1;
}

export function getHabitDates(habit: Habit): { date: Date; dateStr: string; isToday: boolean; isPast: boolean; shouldComplete: boolean }[] {
  const startDate = parseISO(habit.startDate);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const dates = [];
  for (let i = 0; i < habit.duration; i++) {
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
