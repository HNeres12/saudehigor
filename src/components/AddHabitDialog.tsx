import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Sparkles, Calendar, Repeat } from 'lucide-react';
import { FrequencyType, Habit } from '@/types/habit';
import { getDayName } from '@/lib/habitUtils';
import { format } from 'date-fns';

interface AddHabitDialogProps {
  onAddHabit: (habit: Omit<Habit, 'id' | 'completedDays' | 'createdAt'>) => void;
}

const DURATION_PRESETS = [
  { value: 7, label: '1 semana' },
  { value: 21, label: '21 dias' },
  { value: 30, label: '1 mês' },
  { value: 90, label: '3 meses' },
  { value: 365, label: '1 ano' },
];

export function AddHabitDialog({ onAddHabit }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [customDuration, setCustomDuration] = useState('');
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [timesPerPeriod, setTimesPerPeriod] = useState(1);
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalDuration = useCustomDuration && customDuration 
      ? parseInt(customDuration) 
      : durationDays;

    if (!finalDuration || finalDuration < 1) return;

    onAddHabit({
      name: name.trim(),
      durationDays: finalDuration,
      frequency: {
        type: frequencyType,
        timesPerPeriod: frequencyType === 'daily' ? 1 : timesPerPeriod,
        customDays: frequencyType === 'custom' ? customDays : undefined,
      },
      startDate: format(new Date(), 'yyyy-MM-dd'),
    });

    // Reset form
    setName('');
    setDurationDays(30);
    setCustomDuration('');
    setUseCustomDuration(false);
    setFrequencyType('daily');
    setTimesPerPeriod(1);
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
              placeholder="Ex: Visitar meus pais, Meditar, Ler..."
              className="h-12"
              autoFocus
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Por quanto tempo?
            </Label>
            
            {/* Preset options */}
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setDurationDays(preset.value);
                    setUseCustomDuration(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    !useCustomDuration && durationDays === preset.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-primary/20'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom duration */}
            <div className="flex items-center gap-3">
              <label
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  useCustomDuration
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary/20'
                }`}
              >
                <Checkbox
                  checked={useCustomDuration}
                  onCheckedChange={(checked) => setUseCustomDuration(!!checked)}
                  className="sr-only"
                />
                Outro:
              </label>
              <Input
                type="number"
                min="1"
                value={customDuration}
                onChange={(e) => {
                  setCustomDuration(e.target.value);
                  setUseCustomDuration(true);
                }}
                placeholder="Ex: 60"
                className="w-24 h-10"
              />
              <span className="text-sm text-muted-foreground">dias</span>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Repeat className="w-4 h-4 text-primary" />
              Com qual frequência?
            </Label>
            
            <RadioGroup
              value={frequencyType}
              onValueChange={(v) => {
                setFrequencyType(v as FrequencyType);
                if (v === 'daily') setTimesPerPeriod(1);
              }}
              className="grid grid-cols-2 gap-2"
            >
              {[
                { value: 'daily', label: 'Todos os dias' },
                { value: 'weekly', label: 'Por semana' },
                { value: 'monthly', label: 'Por mês' },
                { value: 'custom', label: 'Dias específicos' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                    frequencyType === option.value
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={option.value} className="sr-only" />
                  {option.label}
                </label>
              ))}
            </RadioGroup>

            {/* Times per period selector */}
            {(frequencyType === 'weekly' || frequencyType === 'monthly') && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <Input
                  type="number"
                  min="1"
                  max={frequencyType === 'weekly' ? 7 : 31}
                  value={timesPerPeriod}
                  onChange={(e) => setTimesPerPeriod(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-10 text-center"
                />
                <span className="text-sm text-foreground">
                  {timesPerPeriod === 1 ? 'vez' : 'vezes'} por {frequencyType === 'weekly' ? 'semana' : 'mês'}
                </span>
              </div>
            )}

            {/* Custom days selector */}
            {frequencyType === 'custom' && (
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
            disabled={!name.trim() || (frequencyType === 'custom' && customDays.length === 0)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Começar Jornada
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
