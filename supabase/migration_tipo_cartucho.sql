-- Migração: adiciona a coluna `tipo` (tipo construtivo do projétil) à tabela cartuchos.
-- Rode este script no SQL Editor do Supabase UMA VEZ antes de sincronizar cartuchos
-- com o novo campo "Tipo" (seletor). Seguro para rodar mais de uma vez (IF NOT EXISTS).

ALTER TABLE cartuchos ADD COLUMN IF NOT EXISTS tipo TEXT;
