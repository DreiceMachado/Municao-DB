-- Migração: arma de pressão passou a ter Número de série (como as demais armas).
-- Adiciona numero_serie, serial_estado e tipo_producao à tabela armas_pressao.
-- Rode no SQL Editor do Supabase UMA VEZ. Seguro para repetir.

ALTER TABLE armas_pressao ADD COLUMN IF NOT EXISTS numero_serie  TEXT;
ALTER TABLE armas_pressao ADD COLUMN IF NOT EXISTS serial_estado TEXT;
ALTER TABLE armas_pressao ADD COLUMN IF NOT EXISTS tipo_producao TEXT;
