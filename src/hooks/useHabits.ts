import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Habit, Frequency, FrequencyType } from '@/types/habit';
import { useToast } from '@/hooks/use-toast';

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHabits = useCallback(async () => {
    if (!userId) {
      setHabits([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedHabits: Habit[] = (data || []).map((h) => ({
        id: h.id,
        name: h.name,
        durationDays: h.duration_days,
        frequency: {
          type: h.frequency_type as FrequencyType,
          timesPerPeriod: h.frequency_times_per_period,
          customDays: h.frequency_custom_days || undefined,
        },
        startDate: h.start_date,
        completedDays: (h.completed_days || []).map((d: string) => d),
        createdAt: h.created_at,
      }));

      setHabits(mappedHabits);
    } catch (error: any) {
      console.error('Error fetching habits:', error);
      toast({
        title: 'Erro ao carregar hábitos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'completedDays' | 'createdAt'>) => {
    if (!userId) return;

    try {
      const { error } = await supabase.from('habits').insert({
        user_id: userId,
        name: habit.name,
        duration_days: habit.durationDays,
        frequency_type: habit.frequency.type,
        frequency_times_per_period: habit.frequency.timesPerPeriod,
        frequency_custom_days: habit.frequency.customDays || null,
        start_date: habit.startDate,
        completed_days: [],
      });

      if (error) throw error;

      toast({
        title: 'Hábito criado!',
        description: `"${habit.name}" foi adicionado com sucesso.`,
      });

      fetchHabits();
    } catch (error: any) {
      console.error('Error adding habit:', error);
      toast({
        title: 'Erro ao criar hábito',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleDay = async (habitId: string, date: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDays.includes(date);
    const newCompletedDays = isCompleted
      ? habit.completedDays.filter((d) => d !== date)
      : [...habit.completedDays, date];

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, completedDays: newCompletedDays } : h
      )
    );

    try {
      const { error } = await supabase
        .from('habits')
        .update({ completed_days: newCompletedDays })
        .eq('id', habitId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error toggling day:', error);
      // Revert on error
      fetchHabits();
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteHabit = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    
    // Optimistic update
    setHabits((prev) => prev.filter((h) => h.id !== habitId));

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;

      toast({
        title: 'Hábito excluído',
        description: habit ? `"${habit.name}" foi removido.` : 'Hábito removido.',
      });
    } catch (error: any) {
      console.error('Error deleting habit:', error);
      fetchHabits();
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return { habits, loading, addHabit, toggleDay, deleteHabit, refetch: fetchHabits };
}
