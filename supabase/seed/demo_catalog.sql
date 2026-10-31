-- Steelvault DEMO catalog: 12 fictional entries for testing the app.
-- Requires migration 0004. Every EAN starts with 2000000 (a reserved internal-use
-- range, never assigned to real products), and every name/set/category starts with "Demo".
-- Remove it all later with demo_catalog_cleanup.sql.

insert into public.catalog_import
  (name, kind, edition_name, platform, region, ean, product_code, release_date, description, image_path, category_name, set_name, set_year, parent_ean)
values
  ('Demo Ashfall Knights', 'steelbook', null, 'PS5', 'EU', '2000000000015', 'DEMO-001', '2025-03-14', 'Demo entry for testing. Safe to delete.', null, 'Demo Action RPG', 'Demo Ashfall Saga', 2025, null),
  ('Demo Ashfall Knights', 'steelbook', 'Collector Variant', 'PS5', 'US', '2000000000022', 'DEMO-002', '2025-03-14', 'Demo entry for testing. Safe to delete.', null, 'Demo Action RPG', 'Demo Ashfall Saga', 2025, '2000000000015'),
  ('Demo Hollow Orbit', 'steelbook', null, 'PS5', 'EU', '2000000000039', 'DEMO-003', '2025-06-20', 'Demo entry for testing. Safe to delete.', null, 'Demo Sci-Fi', 'Demo Orbit Series', 2025, null),
  ('Demo Neon Tidepool', 'game_with_steelbook', 'Collector''s Edition', 'PS5', 'EU', '2000000000046', 'DEMO-004', '2026-02-06', 'Demo entry for testing. Safe to delete.', null, 'Demo Sci-Fi', 'Demo Orbit Series', 2026, null),
  ('Demo Neon Tidepool', 'game_with_steelbook', 'Japan Exclusive', 'PS5', 'JP', '2000000000053', 'DEMO-005', '2026-02-06', 'Demo entry for testing. Safe to delete.', null, 'Demo Sci-Fi', 'Demo Orbit Series', 2026, '2000000000046'),
  ('Demo Gravemoss', 'steelbook', null, 'PS4', 'EU', '2000000000060', 'DEMO-006', '2023-10-27', 'Demo entry for testing. Safe to delete.', null, 'Demo Horror', 'Demo Gravemoss Trilogy', 2023, null),
  ('Demo Saint of Rust', 'steelbook', null, 'PS5', 'US', '2000000000077', 'DEMO-007', '2024-05-10', 'Demo entry for testing. Safe to delete.', null, 'Demo Action RPG', 'Demo Ashfall Saga', 2024, null),
  ('Demo Glasswing Run', 'steelbook', null, 'Switch', 'EU', '2000000000084', 'DEMO-008', '2024-09-13', 'Demo entry for testing. Safe to delete.', null, 'Demo Platformer', 'Demo Glasswing', 2024, null),
  ('Demo Longitude Zero', 'steelbook', null, 'Xbox Series X|S', 'EU', '2000000000091', 'DEMO-009', '2025-11-07', 'Demo entry for testing. Safe to delete.', null, 'Demo Racing', 'Demo Longitude', 2025, null),
  ('Demo Longitude Zero', 'steelbook', 'US Retailer Exclusive', 'Xbox Series X|S', 'US', '2000000000107', 'DEMO-010', '2025-11-07', 'Demo entry for testing. Safe to delete.', null, 'Demo Racing', 'Demo Longitude', 2025, '2000000000091'),
  ('Demo Paper Cathedral', 'game_with_steelbook', 'Limited Edition', 'PS5', 'EU', '2000000000114', 'DEMO-011', '2026-04-24', 'Demo entry for testing. Safe to delete.', null, 'Demo Platformer', 'Demo Glasswing', 2026, null),
  ('Demo Cinder Express', 'steelbook', null, 'PS4', 'US', '2000000000121', 'DEMO-012', '2022-08-19', 'Demo entry for testing. Safe to delete.', null, 'Demo Racing', 'Demo Longitude', 2022, null);

select * from public.run_catalog_import();
