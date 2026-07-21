-- Material e acabamento do tambor (cilindro) — específico de REVÓLVER.
-- Rodar no SQL Editor do Supabase ANTES de descomentar `material_tambor`
-- em src/lib/armasMapper.ts (coluna inexistente derruba o upsert da peça).
ALTER TABLE armas_fogo ADD COLUMN IF NOT EXISTS material_tambor TEXT;
