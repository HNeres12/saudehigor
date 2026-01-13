export type DayType = 'A' | 'B' | 'C';

export interface DailyLog {
  id: string;
  userId: string;
  logDate: string;
  dayType: DayType;
  fastingStart: string | null;
  fastingEnd: string | null;
  fastingTargetHours: number;
  fastingCompleted: boolean;
  workouts: string[];
  hadSweets: boolean;
  sweetsAfterMeal: boolean;
  carbLevel: 'low' | 'moderate' | 'high';
  proteinHigh: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DAY_TYPE_CONFIG = {
  A: {
    label: 'Alta Demanda',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgLight: 'bg-red-50',
    fastingHours: 16,
    fastingRange: '16-18h',
    workouts: '2-3 treinos',
    carbLevel: 'high' as const,
    sweetsAllowed: true,
    description: 'Preservar músculo, manter performance',
    examples: 'Corrida + musculação, natação + musculação',
  },
  B: {
    label: 'Média Demanda',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgLight: 'bg-orange-50',
    fastingHours: 24,
    fastingRange: '24h',
    workouts: '1 treino',
    carbLevel: 'moderate' as const,
    sweetsAllowed: true,
    sweetsNote: 'pequeno, opcional',
    description: 'Leve déficit, boa partição',
    examples: 'Musculação OU corrida',
  },
  C: {
    label: 'Limpeza',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    bgLight: 'bg-green-50',
    fastingHours: 20,
    fastingRange: '20-22h',
    workouts: 'Descanso ativo',
    carbLevel: 'low' as const,
    sweetsAllowed: false,
    description: 'Baixar insulina, drenar retenção',
    examples: 'Caminhada leve, alongamento',
  },
};
