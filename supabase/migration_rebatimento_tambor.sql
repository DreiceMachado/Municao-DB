-- Rebatimento do tambor (revólver): lado para o qual o tambor é basculado (Esquerda/Direita).
ALTER TABLE armas_fogo ADD COLUMN IF NOT EXISTS rebatimento_tambor TEXT;
