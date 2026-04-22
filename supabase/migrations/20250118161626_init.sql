-- Create Profiles Table
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text check (role in ('host', 'guest'))
);

-- Create Events Table
create table public.events (
  id uuid not null default gen_random_uuid() primary key,
  title text not null,
  event_date date not null,
  max_capacity integer not null,
  host_id uuid not null references auth.users (id) on delete cascade
);

-- Create RSVPs Table
create table public.rsvps (
  id uuid not null default gen_random_uuid() primary key,
  event_id uuid not null references public.events (id) on delete cascade,
  guest_id uuid not null references auth.users (id) on delete cascade,
  status text not null
);