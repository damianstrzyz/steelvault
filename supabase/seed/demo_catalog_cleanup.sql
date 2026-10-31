-- Removes everything created by demo_catalog.sql (including any collection rows
-- that point at the demo products).
delete from public.products   where ean like '2000000%';
delete from public.sets       where slug like 'demo-%';
delete from public.categories where slug like 'demo-%';
