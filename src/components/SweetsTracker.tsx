import { DailyLog, DAY_TYPE_CONFIG } from '@/types/dailyLog';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Cookie, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SweetsTrackerProps {
  log: DailyLog | null;
  weeklyCount: number;
  onToggle: (hadSweets: boolean, afterMeal: boolean) => void;
}

export function SweetsTracker({ log, weeklyCount, onToggle }: SweetsTrackerProps) {
  const dayType = log?.dayType || 'B';
  const config = DAY_TYPE_CONFIG[dayType];
  const hadSweets = log?.hadSweets || false;
  const sweetsAfterMeal = log?.sweetsAfterMeal ?? true;

  const isAllowed = config.sweetsAllowed;
  const weeklyTarget = 4; // 3-4x por semana é ideal

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Cookie className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Doce</h3>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          isAllowed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        )}>
          {isAllowed ? (dayType === 'B' ? 'Opcional (pequeno)' : 'Permitido') : 'Evitar hoje'}
        </span>
      </div>

      {/* Weekly progress */}
      <div className="mb-4 p-3 rounded-lg bg-secondary">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Esta semana</span>
          <span className={cn(
            'text-sm font-medium',
            weeklyCount <= weeklyTarget ? 'text-primary' : 'text-orange-500'
          )}>
            {weeklyCount}/{weeklyTarget}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-2 rounded-full',
                i <= weeklyCount ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Ideal: 3-4x por semana, sempre após refeição
        </p>
      </div>

      {/* Today's toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Comi doce hoje</span>
          </div>
          <Switch
            checked={hadSweets}
            onCheckedChange={(checked) => onToggle(checked, sweetsAfterMeal)}
          />
        </div>

        {hadSweets && (
          <div className="flex items-center justify-between pl-4 border-l-2 border-primary">
            <div className="flex items-center gap-2">
              <span className="text-sm">Após refeição sólida?</span>
            </div>
            <Switch
              checked={sweetsAfterMeal}
              onCheckedChange={(checked) => onToggle(hadSweets, checked)}
            />
          </div>
        )}

        {hadSweets && !sweetsAfterMeal && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 text-orange-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-sm">
              Lembre-se: doce SEMPRE após refeição sólida para evitar picos de insulina
            </p>
          </div>
        )}

        {hadSweets && sweetsAfterMeal && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 text-green-700">
            <Check className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-sm">
              Perfeito! Doce após refeição = ferramenta psicológica e reposição estratégica
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
