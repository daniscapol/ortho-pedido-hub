BEGIN;
-- Ensure view runs with invoker's privileges to satisfy linter
ALTER VIEW public.matrizes SET (security_invoker = on);
COMMIT;