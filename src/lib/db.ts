import Dexie, { type Table } from "dexie"
import type { WeaponType, WeaponEntry, ExamForm } from "../types"
import { generateId } from "./uuid"

// ── Laudo (perícia completa) ──────────────────────────────────────────────────

export interface Laudo {
  id?: number
  localId: string                        // UUID gerado no dispositivo
  // dados do formulário
  examNumber: string
  examYear: string
  caseNumber?: string
  unit: string
  expert: string
  date: string
  observacoes: string
  // controle
  status: "rascunho" | "finalizado"
  syncStatus: "pending" | "synced"
  criadoEm: string
  atualizadoEm: string
}

// ── Arma / Item periciado (vinculado ao Laudo) ────────────────────────────────

export interface ArmaLocal {
  id?: number
  localId: string                        // UUID do item
  laudoLocalId: string                   // FK → Laudo.localId
  tipo: WeaponType
  dadosJson: string                      // JSON.stringify(WeaponEntry completo)
  syncStatus: "pending" | "synced"
  criadoEm: string
}

// ── Foto (vinculada ao Laudo e opcionalmente à Arma) ─────────────────────────

export interface FotoLocal {
  id?: number
  localId: string
  laudoLocalId: string                   // FK → Laudo.localId
  armaLocalId?: string                   // FK → ArmaLocal.localId (opcional)
  slotLabel: string                      // ex: "Frente", "Numeração de série"
  imagemBase64: string                   // foto completa em base64
  mimeType: string                       // "image/jpeg"
  syncStatus: "pending" | "synced"
  criadoEm: string
}

// ── Banco ─────────────────────────────────────────────────────────────────────

class MunicaoDatabase extends Dexie {
  laudos!: Table<Laudo>
  armas!: Table<ArmaLocal>
  fotos!: Table<FotoLocal>

  constructor() {
    super("municaodb")
    this.version(1).stores({
      laudos: "++id, localId, syncStatus, status, criadoEm",
      armas:  "++id, localId, laudoLocalId, syncStatus",
      fotos:  "++id, localId, laudoLocalId, armaLocalId, syncStatus",
    })
  }
}

export const db = new MunicaoDatabase()

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Converte File para string base64 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Salva laudo + armas de uma vez (operação atômica) */
export async function salvarLaudo(
  laudoLocalId: string,
  form: ExamForm,
  armas: { localId: string; tipo: WeaponType; dados: WeaponEntry }[]
): Promise<void> {
  const agora = new Date().toISOString()

  await db.transaction("rw", db.laudos, db.armas, async () => {
    // Upsert do laudo
    const existente = await db.laudos.where("localId").equals(laudoLocalId).first()
    if (existente) {
      await db.laudos.update(existente.id!, {
        ...form,
        syncStatus: "pending",
        atualizadoEm: agora,
      })
    } else {
      await db.laudos.add({
        localId: laudoLocalId,
        ...form,
        status: "rascunho",
        syncStatus: "pending",
        criadoEm: agora,
        atualizadoEm: agora,
      })
    }

    // Remove armas antigas e reinsere
    await db.armas.where("laudoLocalId").equals(laudoLocalId).delete()
    for (const arma of armas) {
      await db.armas.add({
        localId: arma.localId,
        laudoLocalId,
        tipo: arma.tipo,
        dadosJson: JSON.stringify(arma.dados),
        syncStatus: "pending",
        criadoEm: agora,
      })
    }
  })
}

/** Salva ou substitui uma foto de um slot específico */
export async function salvarFoto(
  laudoLocalId: string,
  armaLocalId: string | undefined,
  slotLabel: string,
  imagemBase64: string,
  mimeType = "image/jpeg"
): Promise<void> {
  // Remove foto anterior do mesmo slot (se houver)
  const query = db.fotos.where("laudoLocalId").equals(laudoLocalId)
  const existentes = await query.toArray()
  const anterior = existentes.find(
    (f) => f.slotLabel === slotLabel && f.armaLocalId === armaLocalId
  )
  if (anterior) await db.fotos.delete(anterior.id!)

  await db.fotos.add({
    localId: generateId(),
    laudoLocalId,
    armaLocalId,
    slotLabel,
    imagemBase64,
    mimeType,
    syncStatus: "pending",
    criadoEm: new Date().toISOString(),
  })
}

/** Remove uma foto de um slot */
export async function removerFoto(
  laudoLocalId: string,
  armaLocalId: string | undefined,
  slotLabel: string
): Promise<void> {
  const todas = await db.fotos.where("laudoLocalId").equals(laudoLocalId).toArray()
  const alvo = todas.find(
    (f) => f.slotLabel === slotLabel && f.armaLocalId === armaLocalId
  )
  if (alvo) await db.fotos.delete(alvo.id!)
}

/** Busca laudo completo com armas e fotos */
export async function buscarLaudoCompleto(laudoLocalId: string) {
  const [laudo, armas, fotos] = await Promise.all([
    db.laudos.where("localId").equals(laudoLocalId).first(),
    db.armas.where("laudoLocalId").equals(laudoLocalId).toArray(),
    db.fotos.where("laudoLocalId").equals(laudoLocalId).toArray(),
  ])

  if (!laudo) return null

  return {
    laudo,
    armas: armas.map((a) => ({
      ...a,
      dados: JSON.parse(a.dadosJson) as WeaponEntry,
      fotos: fotos.filter((f) => f.armaLocalId === a.localId),
    })),
    fotosDoLaudo: fotos.filter((f) => !f.armaLocalId),
  }
}

/** Lista todos os laudos ordenados do mais recente */
export async function listarLaudos() {
  return db.laudos.orderBy("criadoEm").reverse().toArray()
}

/** Conta quantos laudos ainda não foram sincronizados */
export async function contarPendentes() {
  return db.laudos.where("syncStatus").equals("pending").count()
}
