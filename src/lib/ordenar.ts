// Ordena listas de opções em ordem alfabética (pt-BR, ignorando acentos e caixa),
// mantendo opções genéricas (Indeterminado, Outro, Nenhum, Sem…, Não…, N/A) no final.
const _RE_SENTINELA = /^(indetermina|outro|outra|nenhum|sem\b|sem\s|não\b|nao\b|n\/a|a determinar|a definir)/i

function _rotulo(x: unknown): string {
  if (typeof x === "string") return x
  if (x && typeof x === "object" && "l" in x) return String((x as { l: unknown }).l ?? "")
  return String(x ?? "")
}

export function ordenarOpcoes<T>(lista: T[]): T[] {
  return [...lista].sort((a, b) => {
    const ra = _rotulo(a), rb = _rotulo(b)
    const sa = _RE_SENTINELA.test(ra.trim())
    const sb = _RE_SENTINELA.test(rb.trim())
    if (sa !== sb) return sa ? 1 : -1
    return ra.localeCompare(rb, "pt-BR", { sensitivity: "base", numeric: true })
  })
}
