-- Verification Script for Case Studies and Testimonials Migrations
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- 1. Check if tables exist
SELECT 
  'Tables Check' as check_type,
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('case_studies', 'testimonials')
ORDER BY table_name;

-- 2. Check table columns (case_studies)
SELECT 
  'Case Studies Columns' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'case_studies'
ORDER BY ordinal_position;

-- 3. Check table columns (testimonials)
SELECT 
  'Testimonials Columns' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'testimonials'
ORDER BY ordinal_position;

-- 4. Check RLS is enabled
SELECT 
  'RLS Status' as check_type,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('case_studies', 'testimonials')
ORDER BY tablename;

-- 5. Check RLS policies
SELECT 
  'RLS Policies' as check_type,
  tablename,
  policyname,
  cmd as command,
  roles
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('case_studies', 'testimonials')
ORDER BY tablename, policyname;

-- 6. Test public read access (should work)
SELECT 
  'Public Read Test' as check_type,
  'case_studies' as table_name,
  COUNT(*) as published_count
FROM case_studies
WHERE status = 'published';

SELECT 
  'Public Read Test' as check_type,
  'testimonials' as table_name,
  COUNT(*) as published_count
FROM testimonials
WHERE published = true;

-- 7. Test indexes exist
SELECT 
  'Indexes' as check_type,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('case_studies', 'testimonials')
ORDER BY tablename, indexname;

