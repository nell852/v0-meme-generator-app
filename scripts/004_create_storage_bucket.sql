-- Create the memes storage bucket
insert into storage.buckets (id, name, public)
values ('memes', 'memes', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to the memes bucket
create policy "Authenticated users can upload memes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'memes');

-- Allow public read access to all memes
create policy "Public read access for memes"
  on storage.objects for select
  to public
  using (bucket_id = 'memes');

-- Allow users to delete their own memes
create policy "Users can delete own memes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'memes' and (storage.foldername(name))[1] = auth.uid()::text);
