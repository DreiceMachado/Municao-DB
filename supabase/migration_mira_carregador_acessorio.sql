-- Mira/carregador por acessório: cada acessório (Mira ou Carregador) tem sua
-- própria configuração, permitindo várias miras e vários carregadores por peça.
ALTER TABLE acessorios ADD COLUMN IF NOT EXISTS tipo_mira       TEXT[];
ALTER TABLE acessorios ADD COLUMN IF NOT EXISTS tipo_carregador TEXT[];
ALTER TABLE acessorios ADD COLUMN IF NOT EXISTS capacidade      TEXT;
