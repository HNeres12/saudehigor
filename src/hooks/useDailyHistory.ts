import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DailyLog, DayType } from '@/types/dailyLog';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';

export type DateRange = '7d' | '30d' | '3m' | 'all';

export function useDailyHistory(userId: string | undefined, range: DateRange = '7d') {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const getDateRange = useCallback((range: DateRange) => {
    const today = new Date();
    let startDate: Date;

    switch (range) {
      case '7d':
        startDate = subDays(today, 7);
        break;
      case '30d':
        startDate = subDays(today, 30);
        break;
      case '3m':
        startDate = subMonths(today, 3);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Far past date
        break;
      default:
        startDate = subDays(today, 7);
    }

    return {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd'),
    };
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { start, end } = getDateRange(range);

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', start)
        .lte('log_date', end)
        .order('log_date', { ascending: false });

      if (error) throw error;

      const mappedLogs: DailyLog[] = (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        logDate: item.log_date,
        dayType: item.day_type as DayType,
        fastingStart: item.fasting_start,
        fastingEnd: item.fasting_end,
        fastingTargetHours: item.fasting_target_hours,
        fastingCompleted: item.fasting_completed,
        workouts: item.workouts || [],
        hadSweets: item.had_sweets,
        sweetsAfterMeal: item.sweets_after_meal ?? true,
        carbLevel: item.carb_level as 'low' | 'moderate' | 'high',
        proteinHigh: item.protein_high,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setLogs(mappedLogs);
    } catch (error: any) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, range, getDateRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Compute statistics
  const stats = {
    totalDays: logs.length,
    fastingCompleted: logs.filter((l) => l.fastingCompleted).length,
    totalWorkouts: logs.reduce((acc, l) => acc + l.workouts.length, 0),
    sweetsCount: logs.filter((l) => l.hadSweets).length,
    dayTypeCounts: {
      A: logs.filter((l) => l.dayType === 'A').length,
      B: logs.filter((l) => l.dayType === 'B').length,
      C: logs.filter((l) => l.dayType === 'C').length,
    },
    avgFastingHours: logs.length > 0 
      ? logs.reduce((acc, l) => {
          if (l.fastingStart && l.fastingEnd) {
            const start = new Date(l.fastingStart);
            const end = new Date(l.fastingEnd);
            return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          }
          return acc;
        }, 0) / logs.filter((l) => l.fastingStart && l.fastingEnd).length || 0
      : 0,
  };

  return {
    logs,
    loading,
    stats,
    refetch: fetchLogs,
  };
}
