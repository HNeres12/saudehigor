export type Frequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  name: string;
  duration: 20 | 30;
  frequency: Frequency;
  customDays?: number[]; // 0-6 for Sunday-Saturday
  startDate: string;
  completedDays: string[]; // Array of date strings (YYYY-MM-DD)
  createdAt: string;
}

export interface HabitProgress {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  percentage: number;
}
