-- Create users table (public profile data)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create memes table
create table if not exists public.memes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title varchar(200) not null,
  description text,
  image_url text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  views integer default 0,
  is_published boolean default true
);

-- Create likes table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  meme_id uuid not null references public.memes(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, meme_id)
);

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  meme_id uuid not null references public.memes(id) on delete cascade,
  text text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.memes enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- Users table policies (public read, own profile edit)
create policy "Users can view any profile" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);
create policy "Users can delete own profile" on public.users for delete using (auth.uid() = id);

-- Memes table policies (public read, owner can edit/delete)
create policy "Anyone can view published memes" on public.memes for select using (is_published = true);
create policy "Owner can view own unpublished memes" on public.memes for select using (auth.uid() = user_id);
create policy "Owner can insert memes" on public.memes for insert with check (auth.uid() = user_id);
create policy "Owner can update own memes" on public.memes for update using (auth.uid() = user_id);
create policy "Owner can delete own memes" on public.memes for delete using (auth.uid() = user_id);

-- Likes table policies
create policy "Anyone can view likes" on public.likes for select using (true);
create policy "Users can like memes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike memes" on public.likes for delete using (auth.uid() = user_id);

-- Comments table policies
create policy "Anyone can view comments" on public.comments for select using (true);
create policy "Users can insert comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Comment author can update" on public.comments for update using (auth.uid() = user_id);
create policy "Comment author can delete" on public.comments for delete using (auth.uid() = user_id);

-- Create indexes for performance
create index if not exists idx_memes_user_id on public.memes(user_id);
create index if not exists idx_memes_created_at on public.memes(created_at desc);
create index if not exists idx_likes_meme_id on public.likes(meme_id);
create index if not exists idx_likes_user_id on public.likes(user_id);
create index if not exists idx_comments_meme_id on public.comments(meme_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
