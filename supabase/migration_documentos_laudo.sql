-- Migração: adiciona a coluna `documentos` (lista de IP/APFD, Processo, BO, REP em JSON)
-- à tabela laudos. Rode no SQL Editor do Supabase UMA VEZ. Seguro para repetir.

ALTER TABLE laudos ADD COLUMN IF NOT EXISTS documentos TEXT;
