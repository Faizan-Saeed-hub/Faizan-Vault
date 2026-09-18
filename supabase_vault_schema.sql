-- =========================================================================
-- FAIZAN VAULT - DEDICATED SUPABASE CLOUD DATABASE SCHEMA
-- =========================================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pwgxrjfibrkfpqnqzsrj/sql
-- =========================================================================

-- 1. Create Vault Items Table (Stores ID cards, photos, documents, and videos)
CREATE TABLE IF NOT EXISTS public.vault_items (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL DEFAULT 'Faizan0687@gmail.com',
    title TEXT NOT NULL,
    category TEXT DEFAULT 'uncategorized',
    date TEXT,
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_favorite BOOLEAN DEFAULT false,
    file_type TEXT,
    file_name TEXT,
    file_size BIGINT DEFAULT 0,
    cloudinary_url TEXT,
    cloudinary_front_url TEXT,
    cloudinary_back_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Vault Sync Registry Table (Stores instant multi-device bundle snapshot)
CREATE TABLE IF NOT EXISTS public.vault_registry (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    title TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'synced',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_registry ENABLE ROW LEVEL SECURITY;

-- 4. Create Idempotent Access Policies for Publishable Key
DROP POLICY IF EXISTS "Allow all access to vault_items" ON public.vault_items;
CREATE POLICY "Allow all access to vault_items" ON public.vault_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to vault_registry" ON public.vault_registry;
CREATE POLICY "Allow all access to vault_registry" ON public.vault_registry FOR ALL USING (true) WITH CHECK (true);
