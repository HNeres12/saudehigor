import { useAuth } from '@/hooks/useAuth';
import { useDailyLog } from '@/hooks/useDailyLog';
import { DayTypeSelector } from '@/components/DayTypeSelector';
import { FastingTimer } from '@/components/FastingTimer';
import { WorkoutTracker } from '@/components/WorkoutTracker';
import { SweetsTracker } from '@/components/SweetsTracker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek } from 'date-fns';

export function DailyTracker() {
  const { user } = useAuth();
  const [weeklySweets, setWeeklySweets] = useState(0);
  const today = new Date();
  
  const {
    log,
    loading,
    setDayType,
    startFasting,
    endFasting,
    resetFasting,
    setManualFasting,
    addWorkout,
    removeWorkout,
    toggleSweets,
  } = useDailyLog(user?.id, today);

  // Fetch weekly sweets count
  useEffect(() => {
    if (!user?.id) return;

    const fetchWeeklySweets = async () => {
      const weekStart = format(startOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('daily_logs')
        .select('had_sweets')
        .eq('user_id', user.id)
        .gte('log_date', weekStart)
        .lte('log_date', weekEnd)
        .eq('had_sweets', true);

      if (!error && data) {
        setWeeklySweets(data.length);
      }
    };

    fetchWeeklySweets();
  }, [user?.id, log?.hadSweets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Date header */}
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium capitalize">
          {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </span>
      </div>

      {/* Day type selector */}
      <DayTypeSelector
        selected={log?.dayType || 'B'}
        onSelect={setDayType}
      />

      {/* Fasting timer */}
      <FastingTimer
        log={log}
        onStart={startFasting}
        onEnd={endFasting}
        onReset={resetFasting}
        onManualEntry={setManualFasting}
      />

      {/* Workout tracker */}
      <WorkoutTracker
        log={log}
        onAddWorkout={addWorkout}
        onRemoveWorkout={removeWorkout}
      />

      {/* Sweets tracker */}
      <SweetsTracker
        log={log}
        weeklyCount={weeklySweets}
        onToggle={toggleSweets}
      />
    </div>
  );
}
