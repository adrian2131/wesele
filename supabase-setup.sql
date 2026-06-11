create table if not exists public.wedding_schedule (
  id text primary key,
  data jsonb not null
);

insert into public.wedding_schedule (id, data)
values (
  'main',
  '{
    "timeline": {
      "sat-ceremony": "14:00",
      "sat-thanks": "15:00",
      "sat-reception": "16:00",
      "sat-first-dance": "17:30",
      "sat-cake": "22:00",
      "sat-midnight": "24:00",
      "sat-end": "04:00",
      "sun-reception": "12:00",
      "sun-end": "17:00"
    },
    "customItems": [],
    "transport": [
      {"name": "Bus", "time": "01:00"},
      {"name": "Bus", "time": "03:00"},
      {"name": "Bus", "time": "04:00"}
    ],
    "updatedAt": null
  }'::jsonb
)
on conflict (id) do nothing;

alter table public.wedding_schedule enable row level security;

create policy "public schedule read"
on public.wedding_schedule for select
to anon, authenticated
using (true);

create policy "authenticated schedule update"
on public.wedding_schedule for update
to authenticated
using (true)
with check (true);
