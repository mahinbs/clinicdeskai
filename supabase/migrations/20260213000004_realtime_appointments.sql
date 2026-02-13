-- Enable Supabase Realtime for the appointments table
-- So Live Queue and other screens can subscribe to postgres_changes

ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
