-- ============================================================
--  BalísticaDB — Schema Completo
--  Execute no Supabase SQL Editor (Settings → SQL Editor)
--  Ordem: referências primeiro, depois tabelas dependentes
-- ============================================================


-- ────────────────────────────────────────────────────────────
--  EXTENSÕES
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ────────────────────────────────────────────────────────────
--  TABELAS DE REFERÊNCIA
-- ────────────────────────────────────────────────────────────

CREATE TABLE calibres (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome  TEXT UNIQUE NOT NULL,          -- ex: ".38 SPL", "9mm", ".40 S&W"
  descricao TEXT
);

CREATE TABLE fabricantes (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome  TEXT UNIQUE NOT NULL,
  pais  TEXT,
  tipo  TEXT CHECK (tipo IN ('ARMA', 'MUNICAO', 'AMBOS'))
);


-- ────────────────────────────────────────────────────────────
--  PERITOS  (extensão do auth.users do Supabase)
-- ────────────────────────────────────────────────────────────

CREATE TABLE peritos (
  id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  matricula   TEXT,
  cargo       TEXT,
  unidade     TEXT,
  criado_em   TIMESTAMPTZ DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
--  LAUDOS  (relatório / exame pericial)
-- ────────────────────────────────────────────────────────────

CREATE TABLE laudos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perito_id     UUID NOT NULL REFERENCES peritos (id),
  numero_exame  TEXT,
  ano_exame     TEXT,
  numero_bo     TEXT,
  tipo_exame    TEXT CHECK (tipo_exame IN ('EFICIÊNCIA', 'CONSTATAÇÃO')),
  unidade       TEXT,
  data_pericia  DATE,
  observacoes   TEXT,
  status        TEXT NOT NULL DEFAULT 'rascunho'
                  CHECK (status IN ('rascunho', 'finalizado')),
  criado_em     TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
--  LACRES  (entrada e saída)
-- ────────────────────────────────────────────────────────────

CREATE TABLE lacres (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laudo_id  UUID NOT NULL REFERENCES laudos (id) ON DELETE CASCADE,
  numero    TEXT NOT NULL,
  tipo      TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
  criado_em TIMESTAMPTZ DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
--  PECAS  (tabela base — discriminada pelo campo `tipo`)
-- ────────────────────────────────────────────────────────────

CREATE TABLE pecas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laudo_id    UUID NOT NULL REFERENCES laudos (id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN (
                'REVÓLVER', 'PISTOLA', 'ESPINGARDA', 'CARABINA',
                'FUZIL', 'METRALHADORA',
                'PROJÉTIL', 'ESTOJO', 'CARTUCHO',
                'FACA',
                'ARMA DE PRESSÃO', 'ARMA DE ANTECARGA',
                'PÓLVORA', 'ESPOLETA', 'CARREGADOR'
              )),
  destinacao  TEXT CHECK (destinacao IN ('LIBERADO', 'CONSUMIDO')),
  ordem       INTEGER NOT NULL DEFAULT 0,
  criado_em   TIMESTAMPTZ DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
--  ARMAS DE FOGO  (REVÓLVER | PISTOLA | ESPINGARDA | CARABINA | FUZIL | METRALHADORA)
-- ────────────────────────────────────────────────────────────

CREATE TABLE armas_fogo (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id             UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,
  calibre_id          UUID REFERENCES calibres (id),
  fabricante_id       UUID REFERENCES fabricantes (id),

  -- Identificação
  marca               TEXT,
  modelo              TEXT,
  numero_serie        TEXT,
  pais_fabricacao     TEXT,
  serial_estado       TEXT CHECK (serial_estado IN (
                        'PRESERVADO', 'RASPADO', 'ADULTERADO', 'ILEGÍVEL', 'SEM NUMERAÇÃO'
                      )),
  tipo_producao       TEXT CHECK (tipo_producao IN ('INDUSTRIAL', 'ARTESANAL')),

  -- Características físicas
  material            TEXT,
  acabamento          TEXT,
  comp_cano           TEXT,
  comp_total          TEXT,
  num_camaras         TEXT,
  num_canos           TEXT,
  cap_carregador      TEXT,
  tipo_raiamento      TEXT,
  material_quadro     TEXT,
  material_coronha    TEXT,
  sistema_acionamento TEXT,
  tipo_mira           TEXT[],
  tipo_carregador     TEXT[],

  -- Mecanismo — comum
  acao_simples        BOOLEAN,
  acao_dupla          BOOLEAN,
  tambor_gira         BOOLEAN,
  indexacao_correta   BOOLEAN,
  cao_funcional       BOOLEAN,
  gatilho_funcional   BOOLEAN,
  seguranca           BOOLEAN,

  -- Mecanismo — CARABINA
  sistema_repeticao   BOOLEAN,

  -- Mecanismo — PISTOLA
  carregador_presente BOOLEAN,
  carregador_funcional BOOLEAN,
  ferrolho_funcional  BOOLEAN,
  percussor_funcional BOOLEAN,
  extrator_funcional  BOOLEAN,
  ejator_funcional    BOOLEAN,
  retencao_ferrolho   BOOLEAN,
  alimentacao_funcional BOOLEAN,

  -- Mecanismo — FUZIL / METRALHADORA
  modo_fogo           TEXT,
  seletor_disparo     BOOLEAN,
  modo_semi_auto      BOOLEAN,
  modo_auto_funcional BOOLEAN,
  culatel_funcional   BOOLEAN,

  -- Estado de conservação
  ferrugem            BOOLEAN,
  ferrugem_obs        TEXT,
  desgaste            BOOLEAN,
  desgaste_obs        TEXT,
  desgaste_mecanico   BOOLEAN,
  desgaste_mec_obs    TEXT,
  danos_estruturais   BOOLEAN,
  danos_obs           TEXT,
  danos_aparentes     BOOLEAN,
  danos_ap_obs        TEXT,
  pecas_faltantes     BOOLEAN,
  pecas_obs           TEXT,

  -- Exame de disparo
  apto_disparo        BOOLEAN,
  func_municao_real   BOOLEAN,
  teste_percussao     BOOLEAN,
  marcacao_percussor  BOOLEAN,
  tipo_municao_disp   TEXT,
  qtd_municao_disp    TEXT,
  extracao_funcional  BOOLEAN,
  ejacao_funcional    BOOLEAN,
  ciclagem_funcional  BOOLEAN,

  -- Origem da munição
  origem_municao      TEXT
);


-- Acessórios de arma de fogo
CREATE TABLE acessorios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arma_id     UUID NOT NULL REFERENCES armas_fogo (id) ON DELETE CASCADE,
  tipo        TEXT,                    -- Mira, Carregador, Coldre, Bipé…
  material    TEXT,
  descricao   TEXT,
  lacre_entrada TEXT,
  lacre_saida   TEXT,
  origem      TEXT
);

-- Peças/canos sobressalentes
CREATE TABLE sobressalentes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arma_id     UUID NOT NULL REFERENCES armas_fogo (id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('TAMBOR', 'CANO')),
  quantidade  TEXT,
  comp        TEXT,
  material    TEXT,
  acabamento  TEXT
);

-- Coleta de padrão (tiro padrão)
CREATE TABLE coleta_padrao (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arma_id         UUID NOT NULL REFERENCES armas_fogo (id) ON DELETE CASCADE,
  numero_rep      TEXT,
  ano_rep         TEXT,
  tipo_municao    TEXT,
  qtd_projeteis   TEXT,
  qtd_estojos     TEXT,
  tipo_projetil   TEXT,
  mat_projetil    TEXT,
  tipo_estojo     TEXT,
  mat_estojo      TEXT,
  lacre_saida     TEXT
);


-- ────────────────────────────────────────────────────────────
--  PROJÉTEIS
-- ────────────────────────────────────────────────────────────

CREATE TABLE projeteis (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id             UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,
  calibre_id          UUID REFERENCES calibres (id),

  formato             TEXT,
  material            TEXT,
  diametro            TEXT,
  diametro_min        TEXT,
  massa               TEXT,
  altura              TEXT,
  num_estrias         TEXT,
  sent_estrias        TEXT,
  inscricao_fab       TEXT,
  quantidade          TEXT,

  deformacao_presente BOOLEAN,
  deformacoes_acid    TEXT,
  fragmentado         BOOLEAN,
  oxidacao            BOOLEAN,

  estado              TEXT,
  origem              TEXT,
  origem_ref          TEXT,
  regiao_coleta       TEXT
);


-- ────────────────────────────────────────────────────────────
--  ESTOJOS
-- ────────────────────────────────────────────────────────────

CREATE TABLE estojos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id             UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,
  calibre_id          UUID REFERENCES calibres (id),

  marca               TEXT,
  inscricao_fab       TEXT,
  quantidade          TEXT,

  marcacao_extrator   BOOLEAN,
  marcacao_ejator     BOOLEAN,
  marcacao_camara     BOOLEAN,
  estrias_presentes   BOOLEAN,
  oxidacao            BOOLEAN,

  estado              TEXT
);


-- ────────────────────────────────────────────────────────────
--  CARTUCHOS
-- ────────────────────────────────────────────────────────────

CREATE TABLE cartuchos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id     UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,
  calibre_id  UUID REFERENCES calibres (id),

  marca       TEXT,
  quantidade  TEXT,
  completo    BOOLEAN,
  amassado    BOOLEAN,
  estado      TEXT
);


-- ────────────────────────────────────────────────────────────
--  FACAS
-- ────────────────────────────────────────────────────────────

CREATE TABLE facas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id          UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,

  marca            TEXT,
  tipo_lamina      TEXT,
  comp_lamina      TEXT,
  tipo_gume        TEXT,

  gume_funcional   BOOLEAN,
  apta_uso         BOOLEAN,
  lamina_integra   BOOLEAN,
  cabo_danificado  BOOLEAN,
  manchas          BOOLEAN,
  manchas_obs      TEXT,
  institucional    BOOLEAN
);


-- ────────────────────────────────────────────────────────────
--  ARMAS DE PRESSÃO
-- ────────────────────────────────────────────────────────────

CREATE TABLE armas_pressao (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id             UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,
  calibre_id          UUID REFERENCES calibres (id),

  marca               TEXT,
  modelo              TEXT,
  sistema_acionamento TEXT,
  comp_cano           TEXT,
  estado_conservacao  TEXT,
  adaptada_arma_fogo  BOOLEAN
);


-- ────────────────────────────────────────────────────────────
--  ARMAS DE ANTECARGA
-- ────────────────────────────────────────────────────────────

CREATE TABLE armas_antecarga (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id             UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,
  calibre_id          UUID REFERENCES calibres (id),

  marca               TEXT,
  modelo              TEXT,
  comp_cano           TEXT,
  sistema_acionamento TEXT,
  estado_conservacao  TEXT
);


-- ────────────────────────────────────────────────────────────
--  PÓLVORAS
-- ────────────────────────────────────────────────────────────

CREATE TABLE polvoras (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id     UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,

  tipo        TEXT,
  cor         TEXT,
  marca       TEXT,
  quantidade  TEXT
);


-- ────────────────────────────────────────────────────────────
--  ESPOLETAS
-- ────────────────────────────────────────────────────────────

CREATE TABLE espoletas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id     UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,

  tipo        TEXT,
  marca       TEXT,
  quantidade  TEXT
);


-- ────────────────────────────────────────────────────────────
--  CARREGADORES  (apreendidos isoladamente)
-- ────────────────────────────────────────────────────────────

CREATE TABLE carregadores (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id            UUID UNIQUE NOT NULL REFERENCES pecas (id) ON DELETE CASCADE,
  calibre_id         UUID REFERENCES calibres (id),

  marca              TEXT,
  tipo               TEXT,
  material           TEXT,
  capacidade         TEXT,
  estado_conservacao TEXT
);


-- ────────────────────────────────────────────────────────────
--  FOTOS  (vinculadas a laudo, peça ou material)
-- ────────────────────────────────────────────────────────────

CREATE TABLE fotos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laudo_id     UUID REFERENCES laudos (id) ON DELETE CASCADE,
  peca_id      UUID REFERENCES pecas   (id) ON DELETE CASCADE,
  slot_label   TEXT NOT NULL,          -- "Frente", "Numeração de série"…
  storage_path TEXT NOT NULL,          -- caminho no Supabase Storage
  mime_type    TEXT NOT NULL DEFAULT 'image/jpeg',
  criado_em    TIMESTAMPTZ DEFAULT now(),

  -- pelo menos um vínculo obrigatório
  CONSTRAINT fotos_vinculo CHECK (laudo_id IS NOT NULL OR peca_id IS NOT NULL)
);


-- ────────────────────────────────────────────────────────────
--  ÍNDICES  (performance nas consultas mais comuns)
-- ────────────────────────────────────────────────────────────

CREATE INDEX idx_laudos_perito    ON laudos  (perito_id);
CREATE INDEX idx_laudos_status    ON laudos  (status);
CREATE INDEX idx_pecas_laudo      ON pecas   (laudo_id);
CREATE INDEX idx_pecas_tipo       ON pecas   (tipo);
CREATE INDEX idx_fotos_laudo      ON fotos   (laudo_id);
CREATE INDEX idx_fotos_peca       ON fotos   (peca_id);
CREATE INDEX idx_lacres_laudo     ON lacres  (laudo_id);
CREATE INDEX idx_coleta_arma      ON coleta_padrao (arma_id);
CREATE INDEX idx_acessorios_arma  ON acessorios    (arma_id);


-- ────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY  (cada perito acessa só os próprios dados)
-- ────────────────────────────────────────────────────────────

ALTER TABLE peritos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE laudos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pecas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lacres   ENABLE ROW LEVEL SECURITY;

-- Perito lê e edita só o próprio perfil
CREATE POLICY "perito_proprio_perfil" ON peritos
  FOR ALL USING (id = auth.uid());

-- Perito acessa só seus laudos
CREATE POLICY "perito_proprios_laudos" ON laudos
  FOR ALL USING (perito_id = auth.uid());

-- Peças — acesso via laudo do perito
CREATE POLICY "perito_proprias_pecas" ON pecas
  FOR ALL USING (
    laudo_id IN (SELECT id FROM laudos WHERE perito_id = auth.uid())
  );

-- Fotos — acesso via laudo ou peça do perito
CREATE POLICY "perito_proprias_fotos" ON fotos
  FOR ALL USING (
    laudo_id IN (SELECT id FROM laudos WHERE perito_id = auth.uid())
    OR
    peca_id  IN (
      SELECT p.id FROM pecas p
      JOIN laudos l ON l.id = p.laudo_id
      WHERE l.perito_id = auth.uid()
    )
  );

-- Lacres — acesso via laudo do perito
CREATE POLICY "perito_proprios_lacres" ON lacres
  FOR ALL USING (
    laudo_id IN (SELECT id FROM laudos WHERE perito_id = auth.uid())
  );

-- Tabelas de referência são públicas para leitura
ALTER TABLE calibres    ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabricantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calibres_leitura_publica"    ON calibres    FOR SELECT USING (true);
CREATE POLICY "fabricantes_leitura_publica" ON fabricantes FOR SELECT USING (true);


-- ────────────────────────────────────────────────────────────
--  TRIGGER  — atualiza `atualizado_em` automaticamente
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_laudos_atualizado_em
  BEFORE UPDATE ON laudos
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();


-- ────────────────────────────────────────────────────────────
--  TRIGGER — cria registro em peritos ao fazer signUp
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION criar_perito_apos_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.peritos (id, nome, matricula)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Perito'),
    COALESCE(NEW.raw_user_meta_data->>'matricula', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_criar_perito
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION criar_perito_apos_signup();


-- ────────────────────────────────────────────────────────────
--  DADOS INICIAIS — calibres e fabricantes
-- ────────────────────────────────────────────────────────────

INSERT INTO calibres (nome, descricao) VALUES
  ('.22 LR',    'Long Rifle — munição rimfire de baixo calibre'),
  ('.25 ACP',   '6,35mm — pistolas compactas'),
  ('.32 ACP',   '7,65mm — pistolas compactas'),
  ('.38 SPL',   'Special — revólveres policiais'),
  ('.357 Mag',  'Magnum — revólveres de alto desempenho'),
  ('.380 ACP',  '9mm Curto — pistolas compactas'),
  ('9mm Para',  'Parabellum / Luger — padrão OTAN'),
  ('.40 S&W',   'Smith & Wesson — uso policial'),
  ('.44 Mag',   'Magnum — revólveres pesados'),
  ('.45 ACP',   'Automatic Colt Pistol — pistolas'),
  ('5.56mm',   'NATO — fuzis de assalto'),
  ('7.62x39',  'Soviético — AK-47 e derivados'),
  ('7.62x51',  'NATO — fuzis de precisão'),
  ('12 gauge',  'Calibre 12 — espingardas'),
  ('16 gauge',  'Calibre 16 — espingardas'),
  ('20 gauge',  'Calibre 20 — espingardas'),
  ('.50 BMG',   'Browning Machine Gun — metralhadoras pesadas');

INSERT INTO fabricantes (nome, pais, tipo) VALUES
  ('Taurus',           'Brasil',        'ARMA'),
  ('CBC / Magtech',    'Brasil',        'AMBOS'),
  ('Imbel',            'Brasil',        'ARMA'),
  ('Rossi',            'Brasil',        'ARMA'),
  ('Glock',            'Áustria',       'ARMA'),
  ('Beretta',          'Itália',        'AMBOS'),
  ('Smith & Wesson',   'EUA',           'AMBOS'),
  ('Colt',             'EUA',           'ARMA'),
  ('Remington',        'EUA',           'AMBOS'),
  ('Winchester',       'EUA',           'AMBOS'),
  ('Federal',          'EUA',           'MUNICAO'),
  ('Sig Sauer',        'Suíça/EUA',     'ARMA'),
  ('Heckler & Koch',   'Alemanha',      'ARMA'),
  ('Fábrica de Itajubá','Brasil',       'ARMA'),
  ('Companhia Brasileira de Cartuchos', 'Brasil', 'MUNICAO');
