-- 1. Agregar columna 'home_organization_id' a profiles
-- Esta columna recordará SIEMPRE cuál es la verdadera organización del usuario,
-- permitiendo que 'organization_id' cambie temporalmente (Modo Fantasma) sin perder el hogar.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS home_organization_id UUID REFERENCES public.organizations(id);

-- 2. Migrar datos existentes: Para todos los usuarios actuales, su 'home' es su org actual
UPDATE public.profiles 
SET home_organization_id = organization_id 
WHERE home_organization_id IS NULL;

-- 3. Actualizar el Trigger de Nuevos Usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Crear una organización nueva para el usuario
  INSERT INTO public.organizations (name, created_at)
  VALUES ('Tienda de ' || new.email, now())
  RETURNING id INTO new_org_id;

  -- Crear el perfil vinculado a esa org y guardar AMBOS IDs
  INSERT INTO public.profiles (id, organization_id, home_organization_id, role, created_at)
  VALUES (new.id, new_org_id, new_org_id, 'admin', now());

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
