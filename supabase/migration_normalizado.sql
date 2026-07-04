-- ============================================================================
--  Migração: app passa a gravar no SCHEMA NORMALIZADO
--  (pecas + tabelas de detalhe), abandonando a tabela `armas` (dados_json).
--
--  Seguro re-rodar (tudo IF NOT EXISTS / CREATE OR REPLACE).
--  Execute no SQL Editor do Supabase (self-hosted).
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
--  1. PECAS — chaves locais (offline-first) + campos que o app preenche
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE pecas
  ADD COLUMN IF NOT EXISTS local_id           TEXT,
  ADD COLUMN IF NOT EXISTS identificacao      TEXT,
  ADD COLUMN IF NOT EXISTS quantidade         TEXT,
  ADD COLUMN IF NOT EXISTS lacre_entrada_peca TEXT,
  ADD COLUMN IF NOT EXISTS lacre_saida_peca   TEXT;

-- local_id único (necessário para o upsert onConflict do app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pecas_local_id_key'
  ) THEN
    ALTER TABLE pecas ADD CONSTRAINT pecas_local_id_key UNIQUE (local_id);
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────────────────
--  2. TABELAS DE DETALHE — calibre em texto (o app coleta texto livre)
--     (peca_id já é UNIQUE em todas; é a chave do upsert onConflict)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE armas_fogo      ADD COLUMN IF NOT EXISTS calibre_nome TEXT;
ALTER TABLE projeteis       ADD COLUMN IF NOT EXISTS calibre_nome TEXT;
ALTER TABLE estojos         ADD COLUMN IF NOT EXISTS calibre_nome TEXT;
ALTER TABLE cartuchos       ADD COLUMN IF NOT EXISTS calibre_nome TEXT;
ALTER TABLE armas_pressao   ADD COLUMN IF NOT EXISTS calibre_nome TEXT;
ALTER TABLE armas_antecarga ADD COLUMN IF NOT EXISTS calibre_nome TEXT;
ALTER TABLE carregadores    ADD COLUMN IF NOT EXISTS calibre_nome TEXT;


-- ────────────────────────────────────────────────────────────────────────────
--  3. RLS — libera as tabelas de detalhe para o perito dono do laudo
--     (hoje estão com RLS ON e 0 policies => tudo bloqueado)
--     Acesso: peça -> laudo -> perito == auth.uid()
-- ────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  t   TEXT;
  tabs TEXT[] := ARRAY[
    'armas_fogo','projeteis','estojos','cartuchos','armas_pressao',
    'armas_antecarga','carregadores','facas','polvoras','espoletas'
  ];
BEGIN
  FOREACH t IN ARRAY tabs LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_via_peca', t);
    EXECUTE format($f$
      CREATE POLICY %I ON %I
        FOR ALL
        USING (
          peca_id IN (
            SELECT p.id FROM pecas p
            JOIN laudos l ON l.id = p.laudo_id
            WHERE l.perito_id = auth.uid()
               OR (l.perito_id IS NULL AND auth.uid() IS NOT NULL)
          )
        )
        WITH CHECK (
          peca_id IN (
            SELECT p.id FROM pecas p
            JOIN laudos l ON l.id = p.laudo_id
            WHERE l.perito_id = auth.uid()
               OR (l.perito_id IS NULL AND auth.uid() IS NOT NULL)
          )
        )
    $f$, t || '_via_peca', t);
  END LOOP;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
--  4. CHECK desatualizado: serial_estado usa os valores do app (e do schema.sql)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE armas_fogo DROP CONSTRAINT IF EXISTS armas_fogo_serial_estado_check;
ALTER TABLE armas_fogo ADD CONSTRAINT armas_fogo_serial_estado_check
  CHECK (serial_estado IS NULL OR serial_estado IN
         ('LEGÍVEL', 'PARCIAL', 'SUPRIMIDO', 'NÃO APARENTE'));


-- Ajusta a policy de PECAS para cobrir tambem laudos sem perito (mesma regra dos laudos)
DROP POLICY IF EXISTS "perito_proprias_pecas" ON pecas;
CREATE POLICY "perito_proprias_pecas" ON pecas
  FOR ALL
  USING (
    laudo_id IN (
      SELECT id FROM laudos
      WHERE perito_id = auth.uid()
         OR (perito_id IS NULL AND auth.uid() IS NOT NULL)
    )
  )
  WITH CHECK (
    laudo_id IN (
      SELECT id FROM laudos
      WHERE perito_id = auth.uid()
         OR (perito_id IS NULL AND auth.uid() IS NOT NULL)
    )
  );
