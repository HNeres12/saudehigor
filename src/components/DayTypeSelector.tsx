import { DayType, DAY_TYPE_CONFIG } from '@/types/dailyLog';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Flame, Zap, Leaf } from 'lucide-react';

interface DayTypeSelectorProps {
  selected: DayType;
  onSelect: (type: DayType) => void;
}

const icons = {
  A: Flame,
  B: Zap,
  C: Leaf,
};

export function DayTypeSelector({ selected, onSelect }: DayTypeSelectorProps) {
  return (
    <Card className="p-4 shadow-card">
      <h3 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
        Tipo de Dia
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(DAY_TYPE_CONFIG) as DayType[]).map((type) => {
          const config = DAY_TYPE_CONFIG[type];
          const Icon = icons[type];
          const isSelected = selected === type;

          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={cn(
                'p-3 rounded-xl border-2 transition-all text-center',
                isSelected
                  ? `border-current ${config.textColor} ${config.bgLight}`
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center',
                config.color
              )}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className={cn(
                'font-bold text-sm',
                isSelected ? config.textColor : 'text-foreground'
              )}>
                Dia {type}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {config.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Day info */}
      <div className={cn(
        'mt-4 p-3 rounded-lg',
        DAY_TYPE_CONFIG[selected].bgLight
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            DAY_TYPE_CONFIG[selected].color
          )}>
            {(() => {
              const Icon = icons[selected];
              return <Icon className="w-4 h-4 text-white" />;
            })()}
          </div>
          <div className="text-sm">
            <p className={cn('font-semibold', DAY_TYPE_CONFIG[selected].textColor)}>
              {DAY_TYPE_CONFIG[selected].description}
            </p>
            <p className="text-muted-foreground mt-1">
              <strong>Jejum:</strong> {DAY_TYPE_CONFIG[selected].fastingRange} • 
              <strong> Treino:</strong> {DAY_TYPE_CONFIG[selected].workouts}
            </p>
            <p className="text-muted-foreground">
              <strong>Exemplo:</strong> {DAY_TYPE_CONFIG[selected].examples}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
