-- Steelvault Stage 6: catalog products the signed-in user does not own yet.
-- security_invoker makes the view run with the caller's permissions, so RLS on
-- user_collection still applies and auth.uid() is the caller.
create view public.my_missing_products with (security_invoker = true) as
select p.id, p.slug, p.name, p.kind, p.edition_name, p.platform, p.region, p.ean, p.product_code,
       p.release_date, p.image_path, p.parent_product_id, p.set_id, p.category_id, p.created_at,
       s.name as set_name, c.name as category_name
  from public.products p
  left join public.sets s on s.id = p.set_id
  left join public.categories c on c.id = p.category_id
 where not exists (
   select 1 from public.user_collection uc
    where uc.product_id = p.id
      and uc.user_id = (select auth.uid())
      and uc.status = 'owned'
 );

revoke all on public.my_missing_products from anon;
grant select on public.my_missing_products to authenticated;
