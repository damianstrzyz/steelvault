# Importing the catalog

The catalog starts empty. Products, sets and categories are maintained by you (the
service role), not by app users.

1. Run `supabase/migrations/0004_catalog_import.sql` in the SQL editor.
2. Fill `supabase/import/products_template.csv` (one row per edition or variant).
   - `platform` must be one of: PS5, PS4, PS3, Xbox Series X|S, Xbox One, Switch, PC, Other.
   - `region` must be one of: EU, US, JP, UK, PL, AU, Other.
   - `kind`: game, steelbook, game_with_steelbook or other.
   - `ean`: 8 to 14 digits, unique across the catalog. `product_code`: CUSA, PPSA, etc.
   - Variants: put the base game's EAN in `parent_ean`.
   - Leave the `slug` column out of the CSV; it is generated.
3. Table Editor > `catalog_import` > Import data from CSV.
4. SQL editor: `select * from public.run_catalog_import();`
5. Images: upload to the public `product-images` bucket, then put the object path
   (for example `ps5/ashfall-knights.webp`) in `image_path` before step 3, or update
   `products.image_path` afterwards.

Re-importing the same rows updates them rather than creating duplicates. Slugs are
ASCII only: characters outside a-z and 0-9 become hyphens.
