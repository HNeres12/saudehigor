import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDailyHistory, DateRange } from '@/hooks/useDailyHistory';
import { DAY_TYPE_CONFIG } from '@/types/dailyLog';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Loader2, 
  Calendar, 
  Flame, 
  Dumbbell, 
  Cookie, 
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '3m', label: '3 meses' },
  { value: 'all', label: 'Tudo' },
];

export function HistoryTracker() {
  const { user } = useAuth();
  const [range, setRange] = useState<DateRange>('7d');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const { logs, loading, stats } = useDailyHistory(user?.id, range);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const formatFastingDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = differenceInHours(endDate, startDate);
    const minutes = differenceInMinutes(endDate, startDate) % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Range Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {RANGE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={range === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRange(option.value)}
            className="shrink-0"
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Jejuns Completos</span>
            </div>
            <div className="text-2xl font-bold">{stats.fastingCompleted}</div>
            <div className="text-xs text-muted-foreground">
              de {stats.totalDays} dias
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Total Treinos</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
            <div className="text-xs text-muted-foreground">
              {stats.totalDays > 0 
                ? `${(stats.totalWorkouts / stats.totalDays).toFixed(1)}/dia`
                : '0/dia'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Cookie className="w-4 h-4 text-pink-500" />
              <span className="text-xs text-muted-foreground">Doces</span>
            </div>
            <div className="text-2xl font-bold">{stats.sweetsCount}</div>
            <div className="text-xs text-muted-foreground">
              dias com doce
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Média Jejum</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.avgFastingHours > 0 ? `${stats.avgFastingHours.toFixed(1)}h` : '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              por dia
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Type Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Distribuição de Dias
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex gap-2">
            {(['A', 'B', 'C'] as const).map((type) => {
              const config = DAY_TYPE_CONFIG[type];
              const count = stats.dayTypeCounts[type];
              const percentage = stats.totalDays > 0 
                ? Math.round((count / stats.totalDays) * 100) 
                : 0;
              
              return (
                <div 
                  key={type}
                  className={cn(
                    "flex-1 rounded-lg p-3 text-center",
                    config.bgLight
                  )}
                >
                  <div className={cn("text-lg font-bold", config.textColor)}>
                    {count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Dia {type} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Logs List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Histórico Diário
        </h3>
        
        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum registro encontrado neste período.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const config = DAY_TYPE_CONFIG[log.dayType];
              const isExpanded = expandedLog === log.id;
              const fastingDuration = formatFastingDuration(log.fastingStart, log.fastingEnd);

              return (
                <Card 
                  key={log.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  <CardContent className="p-3">
                    {/* Main row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary"
                          className={cn(config.color, "text-white")}
                        >
                          {log.dayType}
                        </Badge>
                        <div>
                          <div className="font-medium capitalize">
                            {format(new Date(log.logDate + 'T12:00:00'), "EEE, d MMM", { locale: ptBR })}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {log.fastingCompleted && (
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500" />
                                {fastingDuration}
                              </span>
                            )}
                            {log.workouts.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Dumbbell className="w-3 h-3 text-blue-500" />
                                {log.workouts.length}
                              </span>
                            )}
                            {log.hadSweets && (
                              <span className="flex items-center gap-1">
                                <Cookie className="w-3 h-3 text-pink-500" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo do Dia</span>
                          <span className={cn("font-medium", config.textColor)}>
                            {config.label}
                          </span>
                        </div>
                        
                        {log.fastingStart && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Jejum Iniciado</span>
                            <span>
                              {format(new Date(log.fastingStart), "HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                        
                        {log.fastingEnd && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Jejum Finalizado</span>
                            <span>
                              {format(new Date(log.fastingEnd), "HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        )}

                        {fastingDuration && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duração Total</span>
                            <span className="font-medium text-orange-600">{fastingDuration}</span>
                          </div>
                        )}
                        
                        {log.workouts.length > 0 && (
                          <div className="flex justify-between items-start">
                            <span className="text-muted-foreground">Treinos</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {log.workouts.map((w, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {w}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Doce</span>
                          <span>
                            {log.hadSweets 
                              ? log.sweetsAfterMeal 
                                ? 'Sim, após refeição' 
                                : 'Sim'
                              : 'Não'}
                          </span>
                        </div>

                        {log.notes && (
                          <div className="pt-2 border-t">
                            <span className="text-muted-foreground">Notas:</span>
                            <p className="mt-1">{log.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
