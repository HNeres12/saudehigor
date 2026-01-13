import { Leaf, Sparkles } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Leaf className="w-12 h-12 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">
        Nenhum hábito ainda
      </h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Comece sua jornada de transformação criando seu primeiro hábito. 
        Pequenas ações diárias levam a grandes mudanças!
      </p>
      <div className="flex items-center gap-2 text-sm text-primary font-medium">
        <Sparkles className="w-4 h-4" />
        Clique em "Novo Hábito" para começar
      </div>
    </div>
  );
}
