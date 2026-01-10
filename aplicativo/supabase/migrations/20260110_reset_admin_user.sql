-- Borrar el usuario admin si existe para permitir un registro limpio desde cero
-- Advertencia: Esto borrará la cuenta de autenticación.
delete from auth.users where email = 'admin@dontendero.com';

-- Asegurar que el trigger está activo (repetido del anterior por seguridad)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
