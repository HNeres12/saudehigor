import { useHabits } from '@/hooks/useHabits';
import { useAuth } from '@/hooks/useAuth';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { EmptyState } from '@/components/EmptyState';
import { AuthPage } from '@/components/AuthPage';
import { DailyTracker } from '@/components/DailyTracker';
import { HistoryTracker } from '@/components/HistoryTracker';
import { Leaf, TrendingUp, LogOut, Loader2, Calendar, ListChecks, Heart, History } from 'lucide-react';
import { getHabitProgress } from '@/lib/habitUtils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { habits, loading: habitsLoading, addHabit, toggleDay, deleteHabit } = useHabits(user?.id);
  const [activeTab, setActiveTab] = useState('today');

  // Show auth page if not logged in
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

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
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Eu estou saudável</h1>
                <p className="text-xs text-muted-foreground">Cuide da sua saúde, um hábito de cada vez</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === 'habits' && <AddHabitDialog onAddHabit={addHabit} />}
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                title="Sair"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Hoje
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              Hábitos
            </TabsTrigger>
          </TabsList>

          {/* Today's tracker */}
          <TabsContent value="today" className="mt-0">
            <DailyTracker />
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="mt-0">
            <HistoryTracker />
          </TabsContent>

          {/* Habits list */}
          <TabsContent value="habits" className="mt-0">
            {habitsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
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
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>Construa hábitos melhores, viva uma vida melhor ✨</p>
      </footer>
    </div>
  );
};

export default Index;
