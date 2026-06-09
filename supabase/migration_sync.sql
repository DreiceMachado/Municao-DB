-- ============================================================
--  BalísticaDB — Migração de sync (rode APÓS schema.sql)
-- ============================================================

-- Adaptar laudos para sync local
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS local_id TEXT UNIQUE;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS expert   TEXT;
ALTER TABLE laudos ALTER COLUMN perito_id DROP NOT NULL;

-- Tabela armas — armazena peças como JSON (espelho do IndexedDB)
CREATE TABLE IF NOT EXISTS armas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id       TEXT UNIQUE NOT NULL,
  laudo_local_id TEXT NOT NULL,
  tipo           TEXT,
  dados_json     TEXT,
  criado_em      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE armas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "armas_aberta" ON armas;
CREATE POLICY "armas_aberta" ON armas FOR ALL USING (true);

-- Adaptar fotos para sync
ALTER TABLE fotos ADD COLUMN IF NOT EXISTS local_id       TEXT UNIQUE;
ALTER TABLE fotos ADD COLUMN IF NOT EXISTS laudo_local_id TEXT;
ALTER TABLE fotos ADD COLUMN IF NOT EXISTS arma_local_id  TEXT;
ALTER TABLE fotos ALTER COLUMN slot_label    DROP NOT NULL;
ALTER TABLE fotos ALTER COLUMN storage_path DROP NOT NULL;
ALTER TABLE fotos DROP CONSTRAINT IF EXISTS fotos_vinculo;
