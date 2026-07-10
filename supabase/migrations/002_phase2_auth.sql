-- Phase 2: phone auth indexes + HR permissions helpers

create index if not exists learner_profiles_auth_user_id_idx
  on public.learner_profiles (auth_user_id)
  where auth_user_id is not null;

create unique index if not exists learner_profiles_phone_unique_idx
  on public.learner_profiles (phone)
  where phone <> '' and auth_user_id is not null;

-- Allow authenticated users to read/update their own profile
drop policy if exists "learners_read_own_profile" on public.learner_profiles;
create policy "learners_read_own_profile"
  on public.learner_profiles for select
  using (auth.uid() = auth_user_id);

drop policy if exists "learners_update_own_profile" on public.learner_profiles;
create policy "learners_update_own_profile"
  on public.learner_profiles for update
  using (auth.uid() = auth_user_id);
