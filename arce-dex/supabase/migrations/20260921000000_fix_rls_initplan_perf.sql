drop policy "own rows only" on public.favorites;
create policy "own rows only" on public.favorites
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "own rows only" on public.teams;
create policy "own rows only" on public.teams
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "own rows only" on public.team_slots;
create policy "own rows only" on public.team_slots
  for all using (
    exists (select 1 from public.teams t where t.id = team_id and t.user_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.teams t where t.id = team_id and t.user_id = (select auth.uid()))
  );

drop policy "own rows only" on public.search_history;
create policy "own rows only" on public.search_history
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "own rows only" on public.settings;
create policy "own rows only" on public.settings
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
