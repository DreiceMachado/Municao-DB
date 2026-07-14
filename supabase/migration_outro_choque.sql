-- ─────────────────────────────────────────────────────────────
--  Migração: tipo OUTRO + tabelas de detalhe (outros, armas_choque)
--  Rode no SQL Editor do Supabase. Idempotente (IF NOT EXISTS / IF EXISTS).
-- ─────────────────────────────────────────────────────────────

-- 1) Permite o novo tipo de peça OUTRO na tabela `pecas`
ALTER TABLE pecas DROP CONSTRAINT IF EXISTS pecas_tipo_check;
ALTER TABLE pecas ADD CONSTRAINT pecas_tipo_check CHECK (tipo IN (
  'REVÓLVER', 'PISTOLA', 'PISTOLETE', 'GARRUCHA',
  'ESPINGARDA', 'CARABINA', 'FUZIL',
  'METRALHADORA', 'SUBMETRALHADORA', 'ARMA DE CHOQUE',
  'PROJÉTIL', 'ESTOJO', 'CARTUCHO',
  'FACA',
  'ARMA DE PRESSÃO', 'ARMA DE ANTECARGA',
  'PÓLVORA', 'ESPOLETA', 'CARREGADOR',
  'OUTRO'
));

-- 2) Tabela de detalhe do tipo OUTRO (parâmetros do GDL "OUTROS")
--    (identificação, quantidade, lacres e observação ficam na tabela base `pecas`)
CREATE TABLE IF NOT EXISTS outros (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id           UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,
  medida            TEXT,
  quant_descricao   TEXT,
  examinado_in_loco BOOLEAN,
  codigo_vestigio   TEXT,
  resultado_psa     TEXT
);

-- 3) Tabela de detalhe da ARMA DE CHOQUE
--    (antes a arma de choque não tinha detalhe; agora guarda marca/modelo/sistema/etc.)
CREATE TABLE IF NOT EXISTS armas_choque (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id             UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,

  marca               TEXT,
  modelo              TEXT,
  numero_serie        TEXT,
  serial_estado       TEXT CHECK (serial_estado IN (
                        'LEGÍVEL', 'PARCIAL', 'SUPRIMIDO', 'NÃO APARENTE'
                      )),
  tipo_producao       TEXT CHECK (tipo_producao IN ('INDUSTRIAL', 'ARTESANAL')),
  sistema_acionamento TEXT,
  pais_fabricacao     TEXT,

  -- Mecanismo / exame
  gatilho_funcional   BOOLEAN,
  seguranca           BOOLEAN,
  apto_disparo        BOOLEAN,
  teste_percussao     BOOLEAN,

  -- Estado de conservação
  danos_estruturais   BOOLEAN,
  danos_obs           TEXT,
  pecas_faltantes     BOOLEAN,
  pecas_obs           TEXT
);
