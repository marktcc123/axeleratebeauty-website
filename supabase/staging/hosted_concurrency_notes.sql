-- Hosted two-session notes. This file is documentation, not an automated pass.
-- Single-connection PGlite tests must not be cited as proof of this scenario.

-- Session A
-- begin;
-- select id from public.products where sku = 'STG-CONCURRENT-STOCK';
-- select public.apply_inventory_decrement('<order-a>', '<product-id>', 1);

-- Session B, started before A commits
-- begin;
-- select public.apply_inventory_decrement('<order-b>', '<product-id>', 1);

-- Expected on a hosted database after both commit:
-- one session returns true and writes one movement;
-- the other returns false and writes no movement;
-- available_quantity is 0, never -1.

-- Status after you actually run this on staging: 尚未验证
