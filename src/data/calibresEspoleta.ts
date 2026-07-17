// Calibres de espoleta ANULAR (rimfire). Todo o resto de fogo circunscrito
// (intrínseco) é CENTRAL (centerfire) — a lista de rimfire é curta e fechada,
// a de centerfire seria infinita.
//
// A espoleta é propriedade do CALIBRE, não do modelo: .380 ACP é centerfire em
// qualquer arma do mundo. Por isso a derivação é confiável.
//
// Chaves normalizadas por normCalibre() (ver src/lib/eixos.ts): minúsculas, sem
// o trecho após "(", vírgula→ponto, sem espaços, sem "+p".
export const CALIBRES_RIMFIRE: ReadonlySet<string> = new Set([
  ".22lr",
  ".22short",
  ".22curto",
  ".22long",
  ".22extralong",
  ".22cb",
  ".22bb",
  ".22wmr",
  ".22magnum",
  ".22win.mag",
  ".17hmr",
  ".17hm2",
  ".17mach2",
  ".41rimfire",
  ".41short",
  "5mmremingtonmagnum",
])

// Calibres que não identificam munição (texto de catálogo, não calibre).
export const CALIBRES_INDETERMINADOS: ReadonlySet<string> = new Set([
  "",
  "diversos",
  "variados",
  "indeterminado",
])
