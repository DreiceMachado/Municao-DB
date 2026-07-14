import { db } from "./db"
import { supabase, supabaseAtivo } from "./supabase"
import {
  TABELA_POR_TIPO, pecaPayload, detalhePayload,
  coletaPayload, acessoriosPayload, sobressalentesPayload, lacresDaPeca,
} from "./armasMapper"
import type { WeaponEntry } from "../types"

// ── Estado público do sync ────────────────────────────────────────────────────

type SyncStatus = "idle" | "syncing" | "error" | "offline"

let _status: SyncStatus = "idle"
let _listeners: ((s: SyncStatus) => void)[] = []

export function getSyncStatus() { return _status }

export function onSyncStatusChange(fn: (s: SyncStatus) => void) {
  _listeners.push(fn)
  return () => { _listeners = _listeners.filter((l) => l !== fn) }
}

function setStatus(s: SyncStatus) {
  _status = s
  _listeners.forEach((l) => l(s))
}

// ── Verificar conectividade ───────────────────────────────────────────────────

async function temInternet(): Promise<boolean> {
  try {
    const { Network } = await import("@capacitor/network")
    const status = await Network.getStatus()
    return status.connected
  } catch {
    return navigator.onLine
  }
}

// ── Garante que o perito existe na tabela peritos ─────────────────────────────

async function garantirPerito(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from("peritos").select("id").eq("id", user.id).single()
  if (!data) {
    const nome = (user.user_metadata?.nome as string) || user.email || "Perito"
    await supabase.from("peritos").insert({ id: user.id, nome })
  }
  return user.id
}

// ── Sincronização principal ───────────────────────────────────────────────────

export async function sincronizar(): Promise<void> {
  if (!supabaseAtivo) return
  if (_status === "syncing") return
  if (!(await temInternet())) { setStatus("offline"); return }

  setStatus("syncing")
  try {
    const peritoId = await garantirPerito()
    await sincronizarLaudos(peritoId)
    await sincronizarArmas()
    await sincronizarFotos()
    setStatus("idle")
  } catch (err) {
    console.error("[sync] erro:", err)
    setStatus("error")
  }
}

async function sincronizarLaudos(peritoId: string | null) {
  const pendentes = await db.laudos.where("syncStatus").equals("pending").toArray()
  for (const laudo of pendentes) {
    // Não sincroniza a REP FONTE preservada (importada/editando): ela é só uma
    // cópia local para o usuário não reimportar. O que vai para a nuvem é o
    // rascunho de trabalho (sem repStatus) e o laudo finalizado (sincronizada/no_gdl).
    // Evita gravar 2 laudos por REP no Supabase.
    if (laudo.repStatus === "importada" || laudo.repStatus === "editando") continue
    const payload: Record<string, unknown> = {
      local_id:            laudo.localId,
      numero_exame:        laudo.examNumber,
      ano_exame:           laudo.examYear,
      numero_bo:           laudo.caseNumber ?? null,
      unidade:             laudo.unit,
      expert:              laudo.expert,
      data_pericia:        laudo.date || null,
      observacoes:         laudo.observacoes,
      status:              laudo.status,
      criado_em:           laudo.criadoEm,
      atualizado_em:       laudo.atualizadoEm,
      solicitante:         laudo.solicitante ?? null,
      remetente_cidade:    laudo.remetenteCidade ?? null,
      remetente_orgao:     laudo.remetenteOrgao ?? null,
      natureza_exame:      laudo.naturezaExame ?? null,
      natureza_ocorrencia: laudo.naturezaOcorrencia ?? null,
      data_entrada:        laudo.dataEntrada ?? null,
      hora_entrada:        laudo.horaEntrada ?? null,
      endereco_exame:      laudo.enderecoExame ?? null,
      oficio:              laudo.oficio ?? null,
      ip_apfd:             laudo.ipApfd ?? null,
      processo:            laudo.processo ?? null,
      documentos:          laudo.documentos ?? null,
    }
    if (peritoId) payload.perito_id = peritoId

    const { error } = await supabase!.from("laudos").upsert(payload, { onConflict: "local_id" })
    if (!error) {
      await db.laudos.update(laudo.id!, { syncStatus: "synced" })
    } else {
      console.error("[sync] laudo:", error.message)
    }
  }
}

// Grava cada item no SCHEMA NORMALIZADO: pecas + tabela de detalhe do tipo.
// Liga por IDs do servidor (laudo_id, peca_id) para satisfazer as RLS policies.
async function sincronizarArmas() {
  const pendentes = await db.armas.where("syncStatus").equals("pending").toArray()

  // ordem estável por laudo (usada em pecas.ordem)
  const ordemPorLaudo: Record<string, number> = {}
  // laudos cujos lacres já foram limpos nesta execução (evita duplicar em re-sync)
  const lacresLimpos = new Set<string>()

  for (const arma of pendentes) {
    let dados: WeaponEntry
    try {
      dados = JSON.parse(arma.dadosJson) as WeaponEntry
    } catch {
      console.error("[sync] arma dados_json inválido:", arma.localId)
      continue
    }

    // 1. id do laudo no servidor (já sincronizado antes)
    const { data: laudoRow, error: lErr } = await supabase!
      .from("laudos").select("id").eq("local_id", arma.laudoLocalId).single()
    if (lErr || !laudoRow) {
      console.error("[sync] laudo não encontrado p/ arma:", lErr?.message)
      continue
    }

    // 2. upsert da peça (retorna o id do servidor)
    const ordem = (ordemPorLaudo[arma.laudoLocalId] ?? 0)
    ordemPorLaudo[arma.laudoLocalId] = ordem + 1
    const { data: pecaRow, error: pErr } = await supabase!
      .from("pecas")
      .upsert(pecaPayload(arma.localId, laudoRow.id, ordem, dados), { onConflict: "local_id" })
      .select("id").single()
    if (pErr || !pecaRow) {
      console.error("[sync] peca:", pErr?.message)
      continue
    }

    // 3. upsert do detalhe (uma linha por tipo, chave = peca_id)
    const tabela = TABELA_POR_TIPO[arma.tipo]
    if (tabela === "armas_fogo") {
      // arma de fogo: precisamos do id gerado p/ gravar os filhos
      // (coleta de padrão, acessórios, sobressalentes)
      const { data: detRow, error: dErr } = await supabase!
        .from(tabela)
        .upsert(detalhePayload(tabela, pecaRow.id, dados), { onConflict: "peca_id" })
        .select("id").single()
      if (dErr || !detRow) {
        console.error("[sync] detalhe armas_fogo:", dErr?.message)
        continue
      }
      await sincronizarFilhosDaArma(detRow.id, dados)
    } else if (tabela) {
      const { error: dErr } = await supabase!
        .from(tabela)
        .upsert(detalhePayload(tabela, pecaRow.id, dados), { onConflict: "peca_id" })
      if (dErr) {
        console.error(`[sync] detalhe ${tabela}:`, dErr.message)
        continue
      }
    }

    // 4. lacres do laudo (entrada/saída) — vale para qualquer tipo de peça
    await sincronizarLacres(laudoRow.id, arma.laudoLocalId, dados, lacresLimpos)

    await db.armas.update(arma.id!, { syncStatus: "synced" })
  }
}

// Grava os filhos de uma arma de fogo: coleta de padrão, acessórios e sobressalentes.
// Idempotente: como essas tabelas não têm chave natural p/ upsert, apaga os filhos
// atuais desta arma e regrava a partir do estado local (evita duplicar em re-sync).
async function sincronizarFilhosDaArma(armaId: string, dados: WeaponEntry) {
  // Coleta de padrão
  await supabase!.from("coleta_padrao").delete().eq("arma_id", armaId)
  const coleta = coletaPayload(armaId, dados)
  if (coleta) {
    const { error } = await supabase!.from("coleta_padrao").insert(coleta)
    if (error) console.error("[sync] coleta_padrao:", error.message)
  }

  // Acessórios
  await supabase!.from("acessorios").delete().eq("arma_id", armaId)
  const acessorios = acessoriosPayload(armaId, dados)
  if (acessorios.length) {
    const { error } = await supabase!.from("acessorios").insert(acessorios)
    if (error) console.error("[sync] acessorios:", error.message)
  }

  // Sobressalentes (tambor / cano)
  await supabase!.from("sobressalentes").delete().eq("arma_id", armaId)
  const sobressalentes = sobressalentesPayload(armaId, dados)
  if (sobressalentes.length) {
    const { error } = await supabase!.from("sobressalentes").insert(sobressalentes)
    if (error) console.error("[sync] sobressalentes:", error.message)
  }
}

// Grava os lacres de entrada/saída de uma peça na tabela `lacres` (nível do laudo).
// Limpa os lacres do laudo apenas uma vez por execução, antes de regravar, para
// não duplicar. Assume que todas as peças do laudo são sincronizadas na mesma leva
// (é o que salvarLaudo faz — remarca todas como pending a cada gravação).
async function sincronizarLacres(
  laudoId: string,
  laudoLocalId: string,
  dados: WeaponEntry,
  laudosLimpos: Set<string>,
) {
  if (!laudosLimpos.has(laudoLocalId)) {
    await supabase!.from("lacres").delete().eq("laudo_id", laudoId)
    laudosLimpos.add(laudoLocalId)
  }
  const rows = lacresDaPeca(laudoId, dados)
  if (rows.length) {
    const { error } = await supabase!.from("lacres").insert(rows)
    if (error) console.error("[sync] lacres:", error.message)
  }
}

async function sincronizarFotos() {
  const pendentes = await db.fotos.where("syncStatus").equals("pending").toArray()
  for (const foto of pendentes) {
    const base64Data = foto.imagemBase64.split(",")[1]
    const byteChars = atob(base64Data)
    const byteArr = new Uint8Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) {
      byteArr[i] = byteChars.charCodeAt(i)
    }
    const blob = new Blob([byteArr], { type: foto.mimeType })

    const storagePath = `fotos/${foto.laudoLocalId}/${foto.localId}.jpg`
    const { error: uploadError } = await supabase!.storage
      .from("pericias")
      .upload(storagePath, blob, { upsert: true })

    if (uploadError) {
      console.error("[sync] foto upload:", uploadError.message)
      continue
    }

    // IDs do servidor (necessários para as RLS policies de fotos)
    const { data: laudoRow } = await supabase!
      .from("laudos").select("id").eq("local_id", foto.laudoLocalId).single()
    let pecaId: string | null = null
    if (foto.armaLocalId) {
      const { data: pecaRow } = await supabase!
        .from("pecas").select("id").eq("local_id", foto.armaLocalId).single()
      pecaId = pecaRow?.id ?? null
    }

    const payload = {
      local_id:       foto.localId,
      laudo_id:       laudoRow?.id ?? null,
      peca_id:        pecaId,
      laudo_local_id: foto.laudoLocalId,
      arma_local_id:  foto.armaLocalId ?? null,
      slot_label:     foto.slotLabel,
      storage_path:   storagePath,
      criado_em:      foto.criadoEm,
    }
    const { error } = await supabase!.from("fotos").upsert(payload, { onConflict: "local_id" })
    if (!error) {
      await db.fotos.update(foto.id!, { syncStatus: "synced" })
    } else {
      console.error("[sync] foto meta:", error.message)
    }
  }
}

// ── Monitor de rede ───────────────────────────────────────────────────────────

export async function iniciarMonitorDeRede() {
  try {
    const { Network } = await import("@capacitor/network")
    await Network.addListener("networkStatusChange", (status) => {
      if (status.connected) sincronizar()
    })
  } catch {
    window.addEventListener("online", () => sincronizar())
  }
  sincronizar()
}
