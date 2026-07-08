-- Migração: adiciona a coluna `lote` (número de lote de fabricação) à tabela estojos.
-- Rode este script no SQL Editor do Supabase UMA VEZ antes de sincronizar estojos
-- com o novo campo "Número de lote". Seguro para rodar mais de uma vez (IF NOT EXISTS).

ALTER TABLE estojos ADD COLUMN IF NOT EXISTS lote TEXT;
