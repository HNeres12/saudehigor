import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { EmptyState } from '@/components/EmptyState';
import { Leaf, TrendingUp } from 'lucide-react';
import { getHabitProgress } from '@/lib/habitUtils';

const Index = () => {
  const { habits, addHabit, toggleDay, deleteHabit } = useHabits();

  // Calculate overall stats
  const totalCompleted = habits.reduce((acc, habit) => {
    const progress = getHabitProgress(habit);
    return acc + progress.completedDays;
  }, 0);

  const totalStreak = habits.reduce((acc, habit) => {
    const progress = getHabitProgress(habit);
    return Math.max(acc, progress.currentStreak);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Novos Hábitos</h1>
                <p className="text-xs text-muted-foreground">Transforme sua vida, um dia de cada vez</p>
              </div>
            </div>
            <AddHabitDialog onAddHabit={addHabit} />
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-6">
        {/* Stats bar */}
        {habits.length > 0 && (
          <div className="flex gap-4 mb-6 animate-fade-in">
            <div className="flex-1 p-4 rounded-2xl bg-card shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalCompleted}</p>
                  <p className="text-xs text-muted-foreground">Dias completados</p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-card shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalStreak}</p>
                  <p className="text-xs text-muted-foreground">Maior sequência</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Habits list or empty state */}
        {habits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {habits.map((habit, index) => (
              <div key={habit.id} style={{ animationDelay: `${index * 100}ms` }}>
                <HabitCard
                  habit={habit}
                  onToggleDay={toggleDay}
                  onDelete={deleteHabit}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>Construa hábitos melhores, viva uma vida melhor ✨</p>
      </footer>
    </div>
  );
};

export default Index;
