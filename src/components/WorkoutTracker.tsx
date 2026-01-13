import { useState } from 'react';
import { DailyLog, DAY_TYPE_CONFIG } from '@/types/dailyLog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dumbbell, Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutTrackerProps {
  log: DailyLog | null;
  onAddWorkout: (workout: string) => void;
  onRemoveWorkout: (index: number) => void;
}

const WORKOUT_SUGGESTIONS = [
  'Musculação',
  'Corrida',
  'Natação',
  'Caminhada',
  'Bike',
  'HIIT',
  'Alongamento',
  'Yoga',
];

export function WorkoutTracker({ log, onAddWorkout, onRemoveWorkout }: WorkoutTrackerProps) {
  const [newWorkout, setNewWorkout] = useState('');
  const [showInput, setShowInput] = useState(false);

  const workouts = log?.workouts || [];
  const dayType = log?.dayType || 'B';
  const config = DAY_TYPE_CONFIG[dayType];

  const handleAdd = (workout: string) => {
    if (workout.trim()) {
      onAddWorkout(workout.trim());
      setNewWorkout('');
      setShowInput(false);
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Treinos</h3>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            config.bgLight, config.textColor
          )}>
            {config.workouts}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {workouts.length} registrado{workouts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Workout list */}
      {workouts.length > 0 && (
        <div className="space-y-2 mb-4">
          {workouts.map((workout, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium">{workout}</span>
              </div>
              <button
                onClick={() => onRemoveWorkout(index)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add workout */}
      {showInput ? (
        <div className="flex gap-2">
          <Input
            value={newWorkout}
            onChange={(e) => setNewWorkout(e.target.value)}
            placeholder="Ex: Musculação, Corrida..."
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd(newWorkout);
              if (e.key === 'Escape') setShowInput(false);
            }}
          />
          <Button onClick={() => handleAdd(newWorkout)} size="icon">
            <Check className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowInput(false)} variant="ghost" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Quick add buttons */}
          <div className="flex flex-wrap gap-2">
            {WORKOUT_SUGGESTIONS.slice(0, 4).map((workout) => (
              <Button
                key={workout}
                variant="outline"
                size="sm"
                onClick={() => handleAdd(workout)}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                {workout}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => setShowInput(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar outro treino
          </Button>
        </div>
      )}
    </Card>
  );
}
