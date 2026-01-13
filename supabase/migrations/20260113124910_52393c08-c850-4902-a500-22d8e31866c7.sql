-- Create daily_logs table for fasting and workout tracking
CREATE TABLE public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Day type: A (alta demanda), B (média), C (limpeza)
  day_type TEXT NOT NULL DEFAULT 'B' CHECK (day_type IN ('A', 'B', 'C')),
  
  -- Fasting
  fasting_start TIMESTAMP WITH TIME ZONE,
  fasting_end TIMESTAMP WITH TIME ZONE,
  fasting_target_hours INTEGER NOT NULL DEFAULT 16,
  fasting_completed BOOLEAN NOT NULL DEFAULT false,
  
  -- Workouts (array of workout descriptions)
  workouts TEXT[] NOT NULL DEFAULT '{}',
  
  -- Nutrition
  had_sweets BOOLEAN NOT NULL DEFAULT false,
  sweets_after_meal BOOLEAN DEFAULT true,
  carb_level TEXT DEFAULT 'moderate' CHECK (carb_level IN ('low', 'moderate', 'high')),
  protein_high BOOLEAN NOT NULL DEFAULT true,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- One log per user per day
  UNIQUE(user_id, log_date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own logs" 
ON public.daily_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs" 
ON public.daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs" 
ON public.daily_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs" 
ON public.daily_logs FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_daily_logs_updated_at
BEFORE UPDATE ON public.daily_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();