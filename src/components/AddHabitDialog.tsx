import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Sparkles } from 'lucide-react';
import { Frequency, Habit } from '@/types/habit';
import { getDayName } from '@/lib/habitUtils';
import { format } from 'date-fns';

interface AddHabitDialogProps {
  onAddHabit: (habit: Omit<Habit, 'id' | 'completedDays' | 'createdAt'>) => void;
}

export function AddHabitDialog({ onAddHabit }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<20 | 30>(30);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddHabit({
      name: name.trim(),
      duration,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      startDate: format(new Date(), 'yyyy-MM-dd'),
    });

    // Reset form
    setName('');
    setDuration(30);
    setFrequency('daily');
    setCustomDays([1, 2, 3, 4, 5]);
    setOpen(false);
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary shadow-glow hover:shadow-lg transition-all duration-300 text-primary-foreground">
          <Plus className="w-5 h-5 mr-2" />
          Novo Hábito
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Criar Novo Hábito
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Qual hábito você quer desenvolver?
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Meditar, Ler, Exercitar..."
              className="h-12"
              autoFocus
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Por quantos dias?
            </Label>
            <RadioGroup
              value={duration.toString()}
              onValueChange={(v) => setDuration(parseInt(v) as 20 | 30)}
              className="flex gap-3"
            >
              <label
                className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  duration === 20
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="20" className="sr-only" />
                <div className="text-center">
                  <span className="block text-2xl font-bold text-foreground">20</span>
                  <span className="text-sm text-muted-foreground">dias</span>
                </div>
              </label>
              <label
                className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  duration === 30
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="30" className="sr-only" />
                <div className="text-center">
                  <span className="block text-2xl font-bold text-foreground">30</span>
                  <span className="text-sm text-muted-foreground">dias</span>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Com qual frequência?
            </Label>
            <RadioGroup
              value={frequency}
              onValueChange={(v) => setFrequency(v as Frequency)}
              className="grid grid-cols-2 gap-2"
            >
              {[
                { value: 'daily', label: 'Todos os dias' },
                { value: 'weekdays', label: 'Dias úteis' },
                { value: 'weekends', label: 'Fins de semana' },
                { value: 'custom', label: 'Personalizado' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                    frequency === option.value
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={option.value} className="sr-only" />
                  {option.label}
                </label>
              ))}
            </RadioGroup>

            {/* Custom days selector */}
            {frequency === 'custom' && (
              <div className="flex justify-between pt-2">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <label
                    key={day}
                    className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all text-xs font-medium ${
                      customDays.includes(day)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-primary/20'
                    }`}
                  >
                    <Checkbox
                      checked={customDays.includes(day)}
                      onCheckedChange={() => toggleCustomDay(day)}
                      className="sr-only"
                    />
                    {getDayName(day)}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
            disabled={!name.trim() || (frequency === 'custom' && customDays.length === 0)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Começar Jornada
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
