export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Frequency {
  type: FrequencyType;
  timesPerPeriod: number; // Ex: 3 vezes por semana, 1 vez por mês
  customDays?: number[]; // 0-6 for Sunday-Saturday (only for custom)
}

export interface Habit {
  id: string;
  name: string;
  durationDays: number; // Número flexível de dias
  frequency: Frequency;
  startDate: string;
  completedDays: string[]; // Array of date strings (YYYY-MM-DD)
  createdAt: string;
}

export interface HabitProgress {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  percentage: number;
  targetForPeriod: number;
  completedThisPeriod: number;
}
