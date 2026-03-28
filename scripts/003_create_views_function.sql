-- Create function to increment meme views
CREATE OR REPLACE FUNCTION public.increment_views(meme_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE memes SET views = views + 1 WHERE id = meme_id;
END;
$$;
