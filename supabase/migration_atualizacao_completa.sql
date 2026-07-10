-- ══════════════════════════════════════════════════════════════════════════════
-- ATUALIZAÇÃO COMPLETA DO BANCO (Supabase)
-- Consolida todas as colunas novas criadas nesta sessão.
-- Rode UMA VEZ no SQL Editor do Supabase. Seguro para repetir (IF NOT EXISTS).
-- ══════════════════════════════════════════════════════════════════════════════

-- 1) ESTOJOS — número de lote de fabricação
ALTER TABLE estojos        ADD COLUMN IF NOT EXISTS lote TEXT;

-- 2) CARTUCHOS — tipo construtivo do projétil + número de lote de fabricação
ALTER TABLE cartuchos      ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE cartuchos      ADD COLUMN IF NOT EXISTS lote TEXT;

-- 3) LAUDOS — documentos vinculados (IP/APFD, Processo, BO, REP em JSON)
ALTER TABLE laudos         ADD COLUMN IF NOT EXISTS documentos TEXT;

-- 4) ARMAS DE PRESSÃO — número de série (como as demais armas)
ALTER TABLE armas_pressao  ADD COLUMN IF NOT EXISTS numero_serie  TEXT;
ALTER TABLE armas_pressao  ADD COLUMN IF NOT EXISTS serial_estado TEXT;
ALTER TABLE armas_pressao  ADD COLUMN IF NOT EXISTS tipo_producao TEXT;

-- 5) ARMAS DE FOGO — rebatimento do tambor (revólver: Esquerda/Direita)
ALTER TABLE armas_fogo     ADD COLUMN IF NOT EXISTS rebatimento_tambor TEXT;

-- 5b) VÍNCULO INSTITUCIONAL — nº de inscrição da arma + instituição
--     (armas de fogo, pressão e antecarga)
ALTER TABLE armas_fogo      ADD COLUMN IF NOT EXISTS institucional            BOOLEAN;
ALTER TABLE armas_fogo      ADD COLUMN IF NOT EXISTS inscricao_institucional  TEXT;
ALTER TABLE armas_fogo      ADD COLUMN IF NOT EXISTS instituicao              TEXT;
ALTER TABLE armas_pressao   ADD COLUMN IF NOT EXISTS institucional            BOOLEAN;
ALTER TABLE armas_pressao   ADD COLUMN IF NOT EXISTS inscricao_institucional  TEXT;
ALTER TABLE armas_pressao   ADD COLUMN IF NOT EXISTS instituicao              TEXT;
ALTER TABLE armas_antecarga ADD COLUMN IF NOT EXISTS institucional            BOOLEAN;
ALTER TABLE armas_antecarga ADD COLUMN IF NOT EXISTS inscricao_institucional  TEXT;
ALTER TABLE armas_antecarga ADD COLUMN IF NOT EXISTS instituicao              TEXT;

-- 5c) Nº DE SÉRIE SUPRIMIDO — resultado da revelação + anotação
--     (armas de fogo, pressão e antecarga)
ALTER TABLE armas_fogo      ADD COLUMN IF NOT EXISTS serial_tentativa_revelacao BOOLEAN;
ALTER TABLE armas_fogo      ADD COLUMN IF NOT EXISTS serial_revelacao    TEXT;
ALTER TABLE armas_fogo      ADD COLUMN IF NOT EXISTS serial_revelado_obs TEXT;
ALTER TABLE armas_pressao   ADD COLUMN IF NOT EXISTS serial_tentativa_revelacao BOOLEAN;
ALTER TABLE armas_pressao   ADD COLUMN IF NOT EXISTS serial_revelacao    TEXT;
ALTER TABLE armas_pressao   ADD COLUMN IF NOT EXISTS serial_revelado_obs TEXT;
ALTER TABLE armas_antecarga ADD COLUMN IF NOT EXISTS serial_tentativa_revelacao BOOLEAN;
ALTER TABLE armas_antecarga ADD COLUMN IF NOT EXISTS serial_revelacao    TEXT;
ALTER TABLE armas_antecarga ADD COLUMN IF NOT EXISTS serial_revelado_obs TEXT;

-- 6) ACESSÓRIOS — mira/carregador por acessório (várias miras/carregadores por peça)
ALTER TABLE acessorios     ADD COLUMN IF NOT EXISTS tipo_mira       TEXT[];
ALTER TABLE acessorios     ADD COLUMN IF NOT EXISTS tipo_carregador TEXT[];
ALTER TABLE acessorios     ADD COLUMN IF NOT EXISTS capacidade      TEXT;
