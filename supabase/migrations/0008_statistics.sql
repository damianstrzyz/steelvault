-- Steelvault Stage 8: statistics functions for the signed-in user.
-- SECURITY INVOKER, so RLS applies and auth.uid() is the caller.

-- Money per platform, category and currency. matched_* only include items that have BOTH a
-- purchase price and a current value, so profit/loss is never inflated by unpriced items.
create function public.my_financial_breakdown()
returns table (
  platform text, category_id uuid, currency public.currency_code,
  item_count bigint, purchase_total numeric, value_total numeric,
  matched_cost numeric, matched_value numeric, unpriced_count bigint
)
language sql stable security invoker set search_path = '' as $$
  select p.platform, p.category_id, uc.currency,
         coalesce(sum(uc.quantity), 0)::bigint,
         coalesce(sum(uc.purchase_price * uc.quantity), 0),
         coalesce(sum(uc.current_value * uc.quantity), 0),
         coalesce(sum(uc.purchase_price * uc.quantity) filter (where uc.purchase_price is not null and uc.current_value is not null), 0),
         coalesce(sum(uc.current_value * uc.quantity) filter (where uc.purchase_price is not null and uc.current_value is not null), 0),
         count(*) filter (where uc.current_value is null)
    from public.user_collection uc
    join public.products p on p.id = uc.product_id
   where uc.user_id = (select auth.uid()) and uc.status = 'owned'
   group by p.platform, p.category_id, uc.currency
$$;

create function public.my_category_completion()
returns table (category_id uuid, category_name text, total_products bigint, owned_products bigint)
language sql stable security invoker set search_path = '' as $$
  select c.id, c.name, count(p.id), count(uc.id)
    from public.categories c
    join public.products p on p.category_id = c.id
    left join public.user_collection uc
      on uc.product_id = p.id and uc.status = 'owned' and uc.user_id = (select auth.uid())
   group by c.id, c.name
$$;

create function public.my_platform_completion()
returns table (platform text, total_products bigint, owned_products bigint)
language sql stable security invoker set search_path = '' as $$
  select p.platform, count(p.id), count(uc.id)
    from public.products p
    left join public.user_collection uc
      on uc.product_id = p.id and uc.status = 'owned' and uc.user_id = (select auth.uid())
   group by p.platform
$$;

revoke all on function public.my_financial_breakdown() from public, anon;
revoke all on function public.my_category_completion() from public, anon;
revoke all on function public.my_platform_completion() from public, anon;
grant execute on function public.my_financial_breakdown() to authenticated;
grant execute on function public.my_category_completion() to authenticated;
grant execute on function public.my_platform_completion() to authenticated;
