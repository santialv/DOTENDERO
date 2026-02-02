-- 1. Ensure columns exist before adding constraints
DO $$ 
BEGIN
    -- For cash_shifts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cash_shifts' AND column_name='user_id') THEN
        ALTER TABLE public.cash_shifts ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    -- For cash_movements
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cash_movements' AND column_name='user_id') THEN
        ALTER TABLE public.cash_movements ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Fix foreign key for profiles join in cash_shifts
ALTER TABLE public.cash_shifts 
DROP CONSTRAINT IF EXISTS cash_shifts_user_id_fkey;

ALTER TABLE public.cash_shifts
ADD CONSTRAINT cash_shifts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- 3. Fix foreign key for profiles join in cash_movements
ALTER TABLE public.cash_movements
DROP CONSTRAINT IF EXISTS cash_movements_user_id_fkey;

ALTER TABLE public.cash_movements
ADD CONSTRAINT cash_movements_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);
