create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  owner text not null check (char_length(owner) between 1 and 80),
  priority text not null default 'Media' check (priority in ('Alta', 'Media', 'Baja')),
  due_date date not null,
  status text not null default 'Pendiente' check (status in ('Pendiente', 'En progreso', 'Completada')),
  created_at timestamptz not null default now()
);

create index if not exists actions_status_due_date_idx on public.actions (status, due_date);

alter table public.actions enable row level security;
drop policy if exists "demo_read_actions" on public.actions;
drop policy if exists "demo_add_actions" on public.actions;
drop policy if exists "demo_update_actions" on public.actions;
drop policy if exists "demo_delete_actions" on public.actions;

create policy "demo_read_actions" on public.actions for select to anon using (true);
create policy "demo_add_actions" on public.actions for insert to anon with check (true);
create policy "demo_update_actions" on public.actions for update to anon using (true) with check (true);
create policy "demo_delete_actions" on public.actions for delete to anon using (true);
