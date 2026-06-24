import Dexie, { type Table } from "dexie"
import { supabase } from "./supabase"

export interface CatalogWeapon {
  id?: number
  tipo: string
  marca: string
  modelo: string
  tipo_descritivo?: string | null
  calibre_nominal?: string | null
  pais_fabricacao?: string | null
  sistema_disparo?: string | null
  sistema_percussao?: string | null
  sistema_mira?: string | null
  raias_qtd?: number | null
  raias_sentido?: string | null
  comprimento_cano_cm?: string | null
  comprimento_total_cm?: string | null
  altura_cm?: string | null
  material_armacao?: string | null
  material_cabo?: string | null
  material_ferrolho?: string | null
  material_cano?: string | null
  cor_padrao?: string | null
  logotipo_fabricante_visivel?: boolean | null
  cabo_anatomico?: boolean | null
  indicador_cartucho_camara?: boolean | null
  retem_carregador_reversivel?: boolean | null
  travas_seguranca?: string[] | null
  carregador_capacidade?: number | null
  carregador_tipo?: string | null
  carregador_marca?: string | null
  observacao_padrao?: string | null
}

class CatalogDatabase extends Dexie {
  catalog!: Table<CatalogWeapon>

  constructor() {
    super("balisticadb_catalog")
    this.version(1).stores({
      catalog: "++id, tipo, marca, modelo, [tipo+marca], [tipo+marca+modelo]",
    })
  }
}

export const catalogDb = new CatalogDatabase()

let populando = false

export async function populateCatalogDb(): Promise<void> {
  if (populando) return
  populando = true

  try {
    const count = await catalogDb.catalog.count()
    if (count > 0) return

    // 1. Carrega bundle local (sem rede, imediato)
    const res = await fetch("/data/weaponCatalog.json")
    if (res.ok) {
      const data: CatalogWeapon[] = await res.json()
      await catalogDb.catalog.bulkAdd(data)
      console.log(`[catalogDb] ${data.length} fichas carregadas do bundle local.`)
      return
    }

    // 2. Fallback: busca do Supabase se o arquivo local falhar
    if (!supabase) return
    let from = 0
    const BATCH = 1000
    let total = 0
    while (true) {
      const { data, error } = await supabase
        .from("weapon_catalog")
        .select("*")
        .range(from, from + BATCH - 1)
      if (error || !data || data.length === 0) break
      await catalogDb.catalog.bulkAdd(data as CatalogWeapon[])
      total += data.length
      from += BATCH
      if (data.length < BATCH) break
    }
    console.log(`[catalogDb] ${total} fichas carregadas do Supabase.`)
  } catch (err) {
    console.error("[catalogDb] Erro ao popular catálogo:", err)
    await catalogDb.catalog.clear()
  } finally {
    populando = false
  }
}
