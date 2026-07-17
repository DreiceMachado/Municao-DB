-- Migração: classificação técnica da arma de fogo nos 6 eixos ortogonais
-- (diagrama de arma de fogo). Cada eixo é uma propriedade que TODA arma tem
-- simultaneamente — não substituem `sistema_acionamento` nem o tipo da peça,
-- convivem com eles.
--
-- Rode este script no SQL Editor do Supabase UMA VEZ antes de sincronizar armas
-- com os campos novos. Seguro para rodar mais de uma vez (IF NOT EXISTS).
--
-- Preenchidos automaticamente por derivarEixos() (src/lib/eixos.ts) a partir do
-- catálogo; o perito pode sobrescrever. Vocabulário completo naquele arquivo.
--
-- Sem CHECK constraint de propósito: o vocabulário ainda tem lacunas conhecidas
-- (percussor fixo de ferrolho aberto, alimentação por cinta) e travar a lista
-- agora obrigaria drop+recreate a cada valor novo — ver migration_outro_choque.sql
-- para o custo disso. TEXT livre é o padrão dos demais campos de classificação.

ALTER TABLE armas_fogo ADD COLUMN IF NOT EXISTS alma_cano TEXT;              -- eixo 1: Lisa | Raiada | Híbrida/Combinada
ALTER TABLE armas_fogo ADD COLUMN IF NOT EXISTS sistema_carregamento TEXT;   -- eixo 2: Antecarga | Retrocarga
ALTER TABLE armas_fogo ADD COLUMN IF NOT EXISTS sistema_funcionamento TEXT;  -- eixo 3: Tiro unitário | Repetição manual | Semi-automática | Automática
ALTER TABLE armas_fogo ADD COLUMN IF NOT EXISTS percussao_localizacao TEXT;  -- eixo 5a: Intrínseca | Extrínseca
ALTER TABLE armas_fogo ADD COLUMN IF NOT EXISTS percussao_tipo_espoleta TEXT;-- eixo 5a: Central (centerfire) | Anular/radial (rimfire)
ALTER TABLE armas_fogo ADD COLUMN IF NOT EXISTS percussao_transmissao TEXT;  -- eixo 5b: Direta | Indireta
ALTER TABLE armas_fogo ADD COLUMN IF NOT EXISTS percussao_mecanismo TEXT;    -- eixo 5c: Cão | Percussor lançado
ALTER TABLE armas_fogo ADD COLUMN IF NOT EXISTS alimentacao_tipo TEXT;       -- eixo 6: Depósito fixo | Carregador removível
