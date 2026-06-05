import { useState, useEffect, useCallback, useRef } from "react"
import { db, listarLaudos, salvarFoto, removerFoto } from "../lib/db"
import type { Laudo } from "../lib/db"
import type { WeaponEntry, WeaponType, RecordItem } from "../types"

type FormState = {
  examNumber: string
  examYear: string
  caseNumber: string
  unit: string
  expert: string
  date: string
  observacoes: string
}

// Converte um Laudo do banco para o formato RecordItem usado na lista
function laudoToRecordItem(l: Laudo): RecordItem {
  return {
    id: l.localId,
    number: l.examNumber || "Sem número",
    year: l.examYear,
    type: "REVÓLVER",   // será atualizado quando carregar as peças
    model: l.caseNumber || "—",
    updatedAt: l.atualizadoEm,
    unit: l.unit,
    expert: l.expert,
  }
}

export function useLaudoDb() {
  const [laudoLocalId] = useState(() => crypto.randomUUID())
  const [laudos, setLaudos] = useState<RecordItem[]>([])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Carrega a lista de laudos ao montar
  useEffect(() => {
    listarLaudos().then((lista) => setLaudos(lista.map(laudoToRecordItem)))
  }, [])

  // Atualiza a lista após qualquer mudança
  const recarregarLista = useCallback(async () => {
    const lista = await listarLaudos()
    setLaudos(lista.map(laudoToRecordItem))
  }, [])

  // Salva o form (com debounce de 800ms para não bater no banco a cada tecla)
  const salvarForm = useCallback(
    (form: FormState) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        const agora = new Date().toISOString()
        const existente = await db.laudos
          .where("localId")
          .equals(laudoLocalId)
          .first()

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

  // Salva todas as peças do laudo (substitui as anteriores)
  const salvarPecas = useCallback(
    async (pieces: WeaponEntry[]) => {
      await db.armas.where("laudoLocalId").equals(laudoLocalId).delete()
      const agora = new Date().toISOString()
      for (const piece of pieces) {
        await db.armas.add({
          localId: crypto.randomUUID(),
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

  // Salva uma foto no banco (base64 completo)
  const salvarFotoNoBanco = useCallback(
    async (slotKey: string, base64: string) => {
      await salvarFoto(laudoLocalId, undefined, slotKey, base64)
    },
    [laudoLocalId]
  )

  // Remove uma foto do banco
  const removerFotoNoBanco = useCallback(
    async (slotKey: string) => {
      await removerFoto(laudoLocalId, undefined, slotKey)
    },
    [laudoLocalId]
  )

  return {
    laudoLocalId,
    laudos,
    salvarForm,
    salvarPecas,
    salvarFotoNoBanco,
    removerFotoNoBanco,
  }
}
