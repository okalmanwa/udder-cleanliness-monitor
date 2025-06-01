-- Clear tables in correct order (respecting foreign key constraints)
TRUNCATE TABLE public.examinations CASCADE;
TRUNCATE TABLE public.udders CASCADE;
TRUNCATE TABLE public.farms CASCADE;

-- Reset any sequences if they exist
ALTER SEQUENCE IF EXISTS public.farms_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.udders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.examinations_id_seq RESTART WITH 1; 