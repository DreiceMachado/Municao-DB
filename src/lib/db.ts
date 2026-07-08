import Dexie, { type Table } from "dexie"
import type { WeaponType, WeaponEntry, ExamForm, RepStatus } from "../types"
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
  // Capa do Laudo (GDL)
  solicitante?: string
  remetenteCidade?: string
  remetenteOrgao?: string
  naturezaExame?: string
  naturezaOcorrencia?: string
  dataEntrada?: string
  horaEntrada?: string
  enderecoExame?: string
  oficio?: string
  ipApfd?: string
  processo?: string
  documentos?: string                    // JSON: {tipo, numero, ano}[]
  // controle
  status: "rascunho" | "finalizado"
  syncStatus: "pending" | "synced"
  repStatus?: RepStatus
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
  gdlEnviada?: boolean                   // true = já foi anexada ao GDL (não reenviar)
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
    this.version(2).stores({
      laudos: "++id, localId, syncStatus, status, repStatus, criadoEm",
      armas:  "++id, localId, laudoLocalId, syncStatus",
      fotos:  "++id, localId, laudoLocalId, armaLocalId, syncStatus",
    })
    this.version(3).stores({
      laudos: "++id, localId, examNumber, syncStatus, status, repStatus, criadoEm",
      armas:  "++id, localId, laudoLocalId, syncStatus",
      fotos:  "++id, localId, laudoLocalId, armaLocalId, syncStatus",
    })
    this.version(4).stores({
      laudos: "++id, localId, examNumber, syncStatus, status, repStatus, criadoEm",
      armas:  "++id, localId, laudoLocalId, syncStatus",
      fotos:  "++id, localId, laudoLocalId, armaLocalId, syncStatus, gdlEnviada",
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

/** Lista as fotos de um laudo que ainda NÃO foram enviadas ao GDL */
export async function fotosPendentesGdl(laudoLocalId: string): Promise<FotoLocal[]> {
  const todas = await db.fotos.where("laudoLocalId").equals(laudoLocalId).toArray()
  return todas.filter((f) => !f.gdlEnviada)
}

/** Marca um conjunto de fotos (por localId) como já enviadas ao GDL */
export async function marcarFotosEnviadasGdl(localIds: string[]): Promise<void> {
  if (localIds.length === 0) return
  await db.transaction("rw", db.fotos, async () => {
    for (const localId of localIds) {
      const foto = await db.fotos.where("localId").equals(localId).first()
      if (foto?.id != null) await db.fotos.update(foto.id, { gdlEnviada: true })
    }
  })
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

/** Cria (ou reusa) um rascunho de trabalho a partir de uma REP importada.
 *  A REP importada permanece intacta — o usuário não precisa reimportar.
 *  Retorna o localId do rascunho (ou null se a REP não for encontrada). */
export async function obterOuCriarRascunhoDeRep(repLocalId: string): Promise<string | null> {
  const rep = await db.laudos.where("localId").equals(repLocalId).first()
  if (!rep) return null

  // Reusa rascunho já existente desta REP (mesmo número/ano, sem repStatus)
  const existente = await db.laudos
    .filter((l) => l.examNumber === rep.examNumber && l.examYear === rep.examYear && !l.repStatus)
    .first()
  if (existente) return existente.localId

  // Cria um novo rascunho copiando os dados da REP importada
  const agora = new Date().toISOString()
  const draftLocalId = generateId()

  await db.transaction("rw", db.laudos, db.armas, db.fotos, async () => {
    await db.laudos.add({
      localId:            draftLocalId,
      examNumber:         rep.examNumber,
      examYear:           rep.examYear,
      caseNumber:         rep.caseNumber,
      unit:               rep.unit,
      expert:             rep.expert,
      date:               rep.date,
      observacoes:        rep.observacoes,
      solicitante:        rep.solicitante,
      remetenteCidade:    rep.remetenteCidade,
      remetenteOrgao:     rep.remetenteOrgao,
      naturezaExame:      rep.naturezaExame,
      naturezaOcorrencia: rep.naturezaOcorrencia,
      dataEntrada:        rep.dataEntrada,
      horaEntrada:        rep.horaEntrada,
      enderecoExame:      rep.enderecoExame,
      oficio:             rep.oficio,
      ipApfd:             rep.ipApfd,
      processo:           rep.processo,
      documentos:         rep.documentos,
      status:             "rascunho",
      syncStatus:         "pending",
      criadoEm:           agora,
      atualizadoEm:       agora,
    })

    const armas = await db.armas.where("laudoLocalId").equals(repLocalId).toArray()
    for (const a of armas) {
      await db.armas.add({
        localId:      generateId(),
        laudoLocalId: draftLocalId,
        tipo:         a.tipo,
        dadosJson:    a.dadosJson,
        syncStatus:   "pending",
        criadoEm:     agora,
      })
    }

    const fotos = await db.fotos.where("laudoLocalId").equals(repLocalId).toArray()
    for (const f of fotos) {
      await db.fotos.add({
        localId:      generateId(),
        laudoLocalId: draftLocalId,
        armaLocalId:  f.armaLocalId,
        slotLabel:    f.slotLabel,
        imagemBase64: f.imagemBase64,
        mimeType:     f.mimeType,
        syncStatus:   "pending",
        gdlEnviada:   f.gdlEnviada,
        criadoEm:     agora,
      })
    }
  })

  return draftLocalId
}

/** Lista todos os laudos ordenados do mais recente */
export async function listarLaudos() {
  return db.laudos.orderBy("criadoEm").reverse().toArray()
}

/** Conta quantos laudos ainda não foram sincronizados */
export async function contarPendentes() {
  return db.laudos.where("syncStatus").equals("pending").count()
}

/** Atualiza o estágio de pipeline da REP */
export async function atualizarRepStatus(localId: string, repStatus: RepStatus): Promise<void> {
  const laudo = await db.laudos.where("localId").equals(localId).first()
  if (laudo?.id != null) {
    await db.laudos.update(laudo.id, { repStatus, atualizadoEm: new Date().toISOString() })
  }
}

/** Remove todas as REPs do banco local do app */
export async function limparRepsLocais(): Promise<number> {
  const count = await db.laudos.count()
  await db.transaction("rw", db.laudos, db.armas, db.fotos, async () => {
    await db.fotos.clear()
    await db.armas.clear()
    await db.laudos.clear()
  })
  return count
}
