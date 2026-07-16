-- ============================================================================
--  Migração: cobertura da importação do GDL (trabalho de 2026-07-15)
--
--  Garante que TODAS as colunas que o app passou a gravar na importação do GDL
--  existam no banco: origem no estojo, descrição/id/datas da peça, acabamento,
--  apto para disparo, rebatimento do tambor, institucional, país, calibre,
--  resultado PSA, código do vestígio e status do nº de série (com PARCIAL).
--
--  Seguro re-rodar (tudo IF NOT EXISTS / DROP+ADD de constraint).
--  Execute no SQL Editor do Supabase.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
--  1. ESTOJOS — origem de coleta (NOVO: GDL "ORIGEM/COLETA" p/ estojo)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE estojos
  ADD COLUMN IF NOT EXISTS origem        TEXT,
  ADD COLUMN IF NOT EXISTS origem_ref    TEXT,
  ADD COLUMN IF NOT EXISTS regiao_coleta TEXT;


-- ────────────────────────────────────────────────────────────────────────────
--  2. PECAS — descrição, id do GDL e datas da guia (pecaPayload passou a gravar)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE pecas
  ADD COLUMN IF NOT EXISTS id_peca             TEXT,
  ADD COLUMN IF NOT EXISTS data_entrada_peca   TEXT,
  ADD COLUMN IF NOT EXISTS data_liberacao_peca TEXT,
  ADD COLUMN IF NOT EXISTS observacao_peca     TEXT,
  ADD COLUMN IF NOT EXISTS codigo_vestigio     TEXT;   -- nível de peça, todos os tipos


-- ────────────────────────────────────────────────────────────────────────────
--  3. ARMAS_FOGO — campos preenchidos pela importação do GDL
--     (acabamento→material_quadro, funcionamento→apto_disparo, tambor,
--      institucional, país, calibre, status do nº de série, tipo de produção)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE armas_fogo
  ADD COLUMN IF NOT EXISTS material_quadro    TEXT,
  ADD COLUMN IF NOT EXISTS apto_disparo       BOOLEAN,
  ADD COLUMN IF NOT EXISTS rebatimento_tambor TEXT,
  ADD COLUMN IF NOT EXISTS institucional      BOOLEAN,
  ADD COLUMN IF NOT EXISTS pais_fabricacao    TEXT,
  ADD COLUMN IF NOT EXISTS calibre_nome       TEXT,
  ADD COLUMN IF NOT EXISTS serial_estado      TEXT,
  ADD COLUMN IF NOT EXISTS tipo_producao      TEXT,
  ADD COLUMN IF NOT EXISTS estado_geral       TEXT;   -- GDL "Estado Geral da Arma": Bom/Regular/Ruim

-- serial_estado agora aceita PARCIAL (número de série com "?" → leitura parcial)
ALTER TABLE armas_fogo DROP CONSTRAINT IF EXISTS armas_fogo_serial_estado_check;
ALTER TABLE armas_fogo ADD CONSTRAINT armas_fogo_serial_estado_check
  CHECK (serial_estado IS NULL OR serial_estado IN
         ('LEGÍVEL', 'PARCIAL', 'SUPRIMIDO', 'NÃO APARENTE'));


-- ────────────────────────────────────────────────────────────────────────────
--  4. OUTROS — resultado PSA e código do vestígio
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE outros
  ADD COLUMN IF NOT EXISTS resultado_psa   TEXT,
  ADD COLUMN IF NOT EXISTS codigo_vestigio TEXT;


-- ────────────────────────────────────────────────────────────────────────────
--  5. PROJETEIS — origem de coleta (garantia; já usada hoje na importação)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE projeteis
  ADD COLUMN IF NOT EXISTS origem        TEXT,
  ADD COLUMN IF NOT EXISTS origem_ref    TEXT,
  ADD COLUMN IF NOT EXISTS regiao_coleta TEXT;


-- ────────────────────────────────────────────────────────────────────────────
--  6. CARTUCHOS — marca (dropdown "Marca de Cartucho") e calibre nominal
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE cartuchos
  ADD COLUMN IF NOT EXISTS marca        TEXT,
  ADD COLUMN IF NOT EXISTS calibre_nome TEXT;


-- ============================================================================
--  Fim. Nenhum dado é apagado; só adiciona colunas/ajusta o CHECK.
-- ============================================================================
