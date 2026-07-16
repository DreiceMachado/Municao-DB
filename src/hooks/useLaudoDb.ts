import { useState, useEffect, useCallback, useRef } from "react"
import { db, listarLaudos, salvarFoto, removerFoto, atualizarRepStatus } from "../lib/db"
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
  // Documentos vinculados (IP/APFD, Processo, BO, REP) em JSON — precisa estar aqui
  // senão o campo era descartado no nível de tipo ao salvar/finalizar o laudo.
  documentos: string
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
    repStatus: l.repStatus,
    naturezaExame: l.naturezaExame,
  }
}

const LS_LAUDO_ATUAL = "laudoLocalIdAtual"

export function useLaudoDb() {
  // ID do exame em edição. Restaurado do localStorage para RETOMAR o exame após
  // recarregar a página (senão um id novo era gerado a cada montagem e o exame
  // em andamento "sumia"). Novo id só quando não há nada salvo.
  const [laudoLocalId, setLaudoLocalId] = useState(() => {
    if (typeof localStorage !== "undefined") {
      const salvo = localStorage.getItem(LS_LAUDO_ATUAL)
      if (salvo) return salvo
    }
    return generateId()
  })

  // Mantém o id em edição no localStorage para sobreviver ao recarregar.
  useEffect(() => {
    if (typeof localStorage !== "undefined" && laudoLocalId) {
      localStorage.setItem(LS_LAUDO_ATUAL, laudoLocalId)
    }
  }, [laudoLocalId])
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
            ...(existente.repStatus === "importada" ? { repStatus: "editando" } : {}),
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
      // Reaproveita o localId (e criadoEm) das peças já existentes por posição, para
      // NÃO gerar um id novo a cada save — senão o Supabase acumula linhas `pecas`
      // órfãs (o upsert usa local_id como chave) e as peças "se soltam".
      const existentes = await db.armas.where("laudoLocalId").equals(laudoLocalId).sortBy("id")
      const agora = new Date().toISOString()
      await db.armas.where("laudoLocalId").equals(laudoLocalId).delete()
      for (let i = 0; i < pieces.length; i++) {
        const anterior = existentes[i]
        await db.armas.add({
          localId: anterior?.localId ?? generateId(),
          laudoLocalId,
          tipo: pieces[i].type as WeaponType,
          dadosJson: JSON.stringify(pieces[i]),
          syncStatus: "pending",
          criadoEm: anterior?.criadoEm ?? agora,
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
      // Reaproveita localId/criadoEm das peças por posição (ver salvarPecas).
      const existentesFin = await db.armas.where("laudoLocalId").equals(laudoLocalId).sortBy("id")
      await db.armas.where("laudoLocalId").equals(laudoLocalId).delete()
      for (let i = 0; i < pieces.length; i++) {
        const anterior = existentesFin[i]
        await db.armas.add({
          localId: anterior?.localId ?? generateId(),
          laudoLocalId,
          tipo: pieces[i].type as WeaponType,
          dadosJson: JSON.stringify(pieces[i]),
          syncStatus: "pending",
          criadoEm: anterior?.criadoEm ?? agora,
        })
      }
      await recarregarLista()
      // Gera novo ID para o próximo exame
      setLaudoLocalId(generateId())
    },
    [laudoLocalId, recarregarLista]
  )

  const descartarRascunho = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    await db.transaction("rw", db.laudos, db.armas, db.fotos, async () => {
      const existente = await db.laudos.where("localId").equals(laudoLocalId).first()
      if (existente?.id != null) {
        await db.armas.where("laudoLocalId").equals(laudoLocalId).delete()
        await db.fotos.where("laudoLocalId").equals(laudoLocalId).delete()
        await db.laudos.delete(existente.id)
      }
    })
    setLaudoLocalId(generateId())
    await recarregarLista()
  }, [laudoLocalId, recarregarLista])

  return {
    laudoLocalId,
    setLaudoLocalId,
    laudos,
    salvarForm,
    finalizarLaudo,
    salvarPecas,
    salvarFotoNoBanco,
    removerFotoNoBanco,
    recarregarLista,
    atualizarRepStatus,
    descartarRascunho,
  }
}
