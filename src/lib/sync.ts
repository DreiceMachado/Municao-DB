import { db } from "./db"
import { supabase, supabaseAtivo } from "./supabase"

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
    const payload: Record<string, unknown> = {
      local_id:      laudo.localId,
      numero_exame:  laudo.examNumber,
      ano_exame:     laudo.examYear,
      unidade:       laudo.unit,
      expert:        laudo.expert,
      data_pericia:  laudo.date || null,
      observacoes:   laudo.observacoes,
      status:        laudo.status,
      criado_em:     laudo.criadoEm,
      atualizado_em: laudo.atualizadoEm,
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

async function sincronizarArmas() {
  const pendentes = await db.armas.where("syncStatus").equals("pending").toArray()
  for (const arma of pendentes) {
    const payload = {
      local_id:       arma.localId,
      laudo_local_id: arma.laudoLocalId,
      tipo:           arma.tipo,
      dados_json:     arma.dadosJson,
      criado_em:      arma.criadoEm,
    }
    const { error } = await supabase!.from("armas").upsert(payload, { onConflict: "local_id" })
    if (!error) {
      await db.armas.update(arma.id!, { syncStatus: "synced" })
    } else {
      console.error("[sync] arma:", error.message)
    }
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

    const payload = {
      local_id:       foto.localId,
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
