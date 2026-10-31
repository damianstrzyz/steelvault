-- Steelvault Stage 5: make sure every existing auth user has a profile row.
-- (New users get one from the on_auth_user_created trigger; this covers accounts created
-- before the trigger existed. user_collection and collection_shares reference profiles.)
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
