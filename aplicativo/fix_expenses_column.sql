DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'category') THEN
        ALTER TABLE public.expenses ADD COLUMN category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('provider', 'utility', 'salary', 'personal', 'other'));
    END IF;
END $$;
