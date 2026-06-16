import { useState, useEffect, useCallback, useRef } from "react"
import { db, listarLaudos, salvarFoto, removerFoto } from "../lib/db"
import type { Laudo } from "../lib/db"
import type { WeaponEntry, WeaponType, RecordItem } from "../types"
import { generateId } from "../lib/uuid"

type FormState = {
  examNumber: string
  examYear: string
  caseNumber: string
  unit: string
  expert: string
  date: string
  observacoes: string
  solicitante: string
  remetenteCidade: string
  remetenteOrgao: string
  naturezaExame: string
  naturezaOcorrencia: string
  dataEntrada: string
  horaEntrada: string
  enderecoExame: string
  oficio: string
  ipApfd: string
  processo: string
}

function laudoToRecordItem(l: Laudo): RecordItem {
  return {
    id: l.localId,
    number: l.examNumber || "Sem número",
    year: l.examYear,
    type: "REVÓLVER",
    model: l.caseNumber || "—",
    updatedAt: l.atualizadoEm,
    unit: l.unit,
    expert: l.expert,
  }
}

export function useLaudoDb() {
  // ID mutável — gerado ao montar e regerado após cada save
  const [laudoLocalId, setLaudoLocalId] = useState(() => generateId())
  const [laudos, setLaudos] = useState<RecordItem[]>([])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Carrega lista ao montar, removendo rascunhos completamente vazios
  useEffect(() => {
    async function init() {
      const todos = await db.laudos.toArray()
      // Remove rascunhos sem número de exame (nunca foram preenchidos)
      const vazios = todos.filter(
        (l) => l.status === "rascunho" && !l.examNumber?.trim()
      )
      if (vazios.length > 0) {
        await Promise.all(vazios.map((l) => db.laudos.delete(l.id!)))
      }
      const lista = await listarLaudos()
      setLaudos(lista.map(laudoToRecordItem))
    }
    init()
  }, [])

  const recarregarLista = useCallback(async () => {
    const lista = await listarLaudos()
    setLaudos(lista.map(laudoToRecordItem))
  }, [])

  const salvarForm = useCallback(
    (form: FormState) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        const agora = new Date().toISOString()
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
        recarregarLista()
      }, 800)
    },
    [laudoLocalId, recarregarLista]
  )

  const salvarPecas = useCallback(
    async (pieces: WeaponEntry[]) => {
      await db.armas.where("laudoLocalId").equals(laudoLocalId).delete()
      const agora = new Date().toISOString()
      for (const piece of pieces) {
        await db.armas.add({
          localId: generateId(),
          laudoLocalId,
          tipo: piece.type as WeaponType,
          dadosJson: JSON.stringify(piece),
          syncStatus: "pending",
          criadoEm: agora,
        })
      }
    },
    [laudoLocalId]
  )

  const salvarFotoNoBanco = useCallback(
    async (slotKey: string, base64: string) => {
      await salvarFoto(laudoLocalId, undefined, slotKey, base64)
    },
    [laudoLocalId]
  )

  const removerFotoNoBanco = useCallback(
    async (slotKey: string) => {
      await removerFoto(laudoLocalId, undefined, slotKey)
    },
    [laudoLocalId]
  )

  // Salva imediatamente, marca como finalizado e gera novo ID para o próximo exame
  const finalizarLaudo = useCallback(
    async (form: FormState, pieces: WeaponEntry[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      const agora = new Date().toISOString()
      const existente = await db.laudos.where("localId").equals(laudoLocalId).first()
      if (existente) {
        await db.laudos.update(existente.id!, {
          ...form,
          status: "finalizado",
          syncStatus: "pending",
          atualizadoEm: agora,
        })
      } else {
        await db.laudos.add({
          localId: laudoLocalId,
          ...form,
          status: "finalizado",
          syncStatus: "pending",
          criadoEm: agora,
          atualizadoEm: agora,
        })
      }
      await db.armas.where("laudoLocalId").equals(laudoLocalId).delete()
      for (const piece of pieces) {
        await db.armas.add({
          localId: generateId(),
          laudoLocalId,
          tipo: piece.type as WeaponType,
          dadosJson: JSON.stringify(piece),
          syncStatus: "pending",
          criadoEm: agora,
        })
      }
      await recarregarLista()
      // Gera novo ID para o próximo exame
      setLaudoLocalId(generateId())
    },
    [laudoLocalId, recarregarLista]
  )

  return {
    laudoLocalId,
    laudos,
    salvarForm,
    finalizarLaudo,
    salvarPecas,
    salvarFotoNoBanco,
    removerFotoNoBanco,
  }
}
