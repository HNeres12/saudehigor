import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DailyLog, DayType, DAY_TYPE_CONFIG } from '@/types/dailyLog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function useDailyLog(userId: string | undefined, date: Date = new Date()) {
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const dateStr = format(date, 'yyyy-MM-dd');

  const fetchLog = useCallback(async () => {
    if (!userId) {
      setLog(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', dateStr)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLog({
          id: data.id,
          userId: data.user_id,
          logDate: data.log_date,
          dayType: data.day_type as DayType,
          fastingStart: data.fasting_start,
          fastingEnd: data.fasting_end,
          fastingTargetHours: data.fasting_target_hours,
          fastingCompleted: data.fasting_completed,
          workouts: data.workouts || [],
          hadSweets: data.had_sweets,
          sweetsAfterMeal: data.sweets_after_meal ?? true,
          carbLevel: data.carb_level as 'low' | 'moderate' | 'high',
          proteinHigh: data.protein_high,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } else {
        setLog(null);
      }
    } catch (error: any) {
      console.error('Error fetching daily log:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, dateStr]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const createOrUpdateLog = async (updates: Partial<DailyLog>) => {
    if (!userId) return;

    try {
      if (log) {
        // Update existing
        const { error } = await supabase
          .from('daily_logs')
          .update({
            day_type: updates.dayType ?? log.dayType,
            fasting_start: updates.fastingStart !== undefined ? updates.fastingStart : log.fastingStart,
            fasting_end: updates.fastingEnd !== undefined ? updates.fastingEnd : log.fastingEnd,
            fasting_target_hours: updates.fastingTargetHours ?? log.fastingTargetHours,
            fasting_completed: updates.fastingCompleted ?? log.fastingCompleted,
            workouts: updates.workouts ?? log.workouts,
            had_sweets: updates.hadSweets ?? log.hadSweets,
            sweets_after_meal: updates.sweetsAfterMeal ?? log.sweetsAfterMeal,
            carb_level: updates.carbLevel ?? log.carbLevel,
            protein_high: updates.proteinHigh ?? log.proteinHigh,
            notes: updates.notes !== undefined ? updates.notes : log.notes,
          })
          .eq('id', log.id);

        if (error) throw error;
      } else {
        // Create new
        const dayType = updates.dayType || 'B';
        const config = DAY_TYPE_CONFIG[dayType];
        
        const { error } = await supabase.from('daily_logs').insert({
          user_id: userId,
          log_date: dateStr,
          day_type: dayType,
          fasting_target_hours: config.fastingHours,
          fasting_start: updates.fastingStart || null,
          fasting_end: updates.fastingEnd || null,
          fasting_completed: updates.fastingCompleted || false,
          workouts: updates.workouts || [],
          had_sweets: updates.hadSweets || false,
          sweets_after_meal: updates.sweetsAfterMeal ?? true,
          carb_level: updates.carbLevel || config.carbLevel,
          protein_high: updates.proteinHigh ?? true,
          notes: updates.notes || null,
        });

        if (error) throw error;
      }

      await fetchLog();
    } catch (error: any) {
      console.error('Error updating daily log:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const setDayType = async (dayType: DayType) => {
    const config = DAY_TYPE_CONFIG[dayType];
    await createOrUpdateLog({
      dayType,
      fastingTargetHours: config.fastingHours,
      carbLevel: config.carbLevel,
    });
  };

  const startFasting = async () => {
    await createOrUpdateLog({
      fastingStart: new Date().toISOString(),
      fastingEnd: null,
      fastingCompleted: false,
    });
    toast({ title: 'Jejum iniciado! 🕐' });
  };

  const endFasting = async () => {
    const now = new Date().toISOString();
    await createOrUpdateLog({
      fastingEnd: now,
      fastingCompleted: true,
    });
    toast({ title: 'Jejum finalizado! 🎉' });
  };

  const addWorkout = async (workout: string) => {
    const currentWorkouts = log?.workouts || [];
    await createOrUpdateLog({
      workouts: [...currentWorkouts, workout],
    });
    toast({ title: 'Treino registrado! 💪' });
  };

  const removeWorkout = async (index: number) => {
    const currentWorkouts = log?.workouts || [];
    await createOrUpdateLog({
      workouts: currentWorkouts.filter((_, i) => i !== index),
    });
  };

  const toggleSweets = async (hadSweets: boolean, afterMeal: boolean = true) => {
    await createOrUpdateLog({
      hadSweets,
      sweetsAfterMeal: afterMeal,
    });
  };

  return {
    log,
    loading,
    setDayType,
    startFasting,
    endFasting,
    addWorkout,
    removeWorkout,
    toggleSweets,
    updateLog: createOrUpdateLog,
    refetch: fetchLog,
  };
}
