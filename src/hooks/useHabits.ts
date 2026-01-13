import { useState, useEffect } from 'react';
import { Habit } from '@/types/habit';

const STORAGE_KEY = 'novos-habitos-data';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHabits(JSON.parse(stored));
    }
  }, []);

  const saveHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHabits));
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'completedDays' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      completedDays: [],
      createdAt: new Date().toISOString(),
    };
    saveHabits([...habits, newHabit]);
  };

  const toggleDay = (habitId: string, date: string) => {
    const updated = habits.map((habit) => {
      if (habit.id !== habitId) return habit;
      
      const isCompleted = habit.completedDays.includes(date);
      return {
        ...habit,
        completedDays: isCompleted
          ? habit.completedDays.filter((d) => d !== date)
          : [...habit.completedDays, date],
      };
    });
    saveHabits(updated);
  };

  const deleteHabit = (habitId: string) => {
    saveHabits(habits.filter((h) => h.id !== habitId));
  };

  return { habits, addHabit, toggleDay, deleteHabit };
}
