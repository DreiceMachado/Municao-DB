-- ============================================================
--  BalísticaDB — Migração de sync (rode APÓS schema.sql)
-- ============================================================

-- Adaptar laudos para sync local
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS local_id TEXT UNIQUE;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS expert   TEXT;
ALTER TABLE laudos ALTER COLUMN perito_id DROP NOT NULL;

-- Campos GDL ausentes em laudos
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS solicitante          TEXT;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS remetente_cidade     TEXT;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS remetente_orgao      TEXT;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS natureza_exame       TEXT;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS natureza_ocorrencia  TEXT;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS data_entrada         TEXT;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS hora_entrada         TEXT;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS endereco_exame       TEXT;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS oficio               TEXT;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS ip_apfd              TEXT;
ALTER TABLE laudos ADD COLUMN IF NOT EXISTS processo             TEXT;

-- Campos GDL ausentes em pecas
ALTER TABLE pecas ADD COLUMN IF NOT EXISTS id_peca              TEXT;
ALTER TABLE pecas ADD COLUMN IF NOT EXISTS identificacao        TEXT;
ALTER TABLE pecas ADD COLUMN IF NOT EXISTS quantidade           TEXT;
ALTER TABLE pecas ADD COLUMN IF NOT EXISTS lacre_entrada_peca   TEXT;
ALTER TABLE pecas ADD COLUMN IF NOT EXISTS lacre_saida_peca     TEXT;
ALTER TABLE pecas ADD COLUMN IF NOT EXISTS data_entrada_peca    TEXT;
ALTER TABLE pecas ADD COLUMN IF NOT EXISTS data_liberacao_peca  TEXT;
ALTER TABLE pecas ADD COLUMN IF NOT EXISTS observacao_peca      TEXT;

-- Corrigir CHECK de serial_estado para os valores que o app usa
ALTER TABLE armas_fogo DROP CONSTRAINT IF EXISTS armas_fogo_serial_estado_check;
ALTER TABLE armas_fogo ADD CONSTRAINT armas_fogo_serial_estado_check
  CHECK (serial_estado IN ('LEGÍVEL', 'PARCIAL', 'SUPRIMIDO', 'NÃO APARENTE'));

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

-- Corrigir RLS da tabela armas: restringir a usuários autenticados
DROP POLICY IF EXISTS "armas_aberta" ON armas;
DROP POLICY IF EXISTS "armas_autenticados" ON armas;
CREATE POLICY "armas_autenticados" ON armas
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Adaptar fotos para sync
ALTER TABLE fotos ADD COLUMN IF NOT EXISTS local_id       TEXT UNIQUE;
ALTER TABLE fotos ADD COLUMN IF NOT EXISTS laudo_local_id TEXT;
ALTER TABLE fotos ADD COLUMN IF NOT EXISTS arma_local_id  TEXT;
ALTER TABLE fotos ALTER COLUMN slot_label   DROP NOT NULL;
ALTER TABLE fotos ALTER COLUMN storage_path DROP NOT NULL;
ALTER TABLE fotos DROP CONSTRAINT IF EXISTS fotos_vinculo;

-- Corrigir política de laudos sem perito_id (sync sem login vinculado)
DROP POLICY IF EXISTS "perito_proprios_laudos" ON laudos;
CREATE POLICY "perito_proprios_laudos" ON laudos
  FOR ALL USING (
    perito_id = auth.uid()
    OR (perito_id IS NULL AND auth.uid() IS NOT NULL)
  );
