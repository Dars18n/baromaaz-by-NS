-- New "Shop by Category" photos (Nov 2026). Run once in Supabase → SQL Editor. Safe to re-run.
update public.categories
   set image_url = '/images/categories/' || slug || '-category-2.webp'
 where slug in ('tops', 'kurtis', 'corsets', 'dresses', 'festive');
