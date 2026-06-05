import { db } from "./db"
import { supabase, supabaseDisponivel } from "./supabase"

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
  // Tenta usar a API do Capacitor Network se disponível
  try {
    const { Network } = await import("@capacitor/network")
    const status = await Network.getStatus()
    return status.connected
  } catch {
    // Fallback para browser: testa navigator.onLine
    return navigator.onLine
  }
}

// ── Sincronização principal ───────────────────────────────────────────────────

export async function sincronizar(): Promise<void> {
  if (!supabaseDisponivel()) return
  if (_status === "syncing") return
  if (!(await temInternet())) { setStatus("offline"); return }

  setStatus("syncing")
  try {
    await sincronizarLaudos()
    await sincronizarArmas()
    await sincronizarFotos()
    setStatus("idle")
  } catch (err) {
    console.error("[sync] erro:", err)
    setStatus("error")
  }
}

async function sincronizarLaudos() {
  const pendentes = await db.laudos.where("syncStatus").equals("pending").toArray()
  for (const laudo of pendentes) {
    const payload = {
      local_id:      laudo.localId,
      exam_number:   laudo.examNumber,
      exam_year:     laudo.examYear,
      unit:          laudo.unit,
      expert:        laudo.expert,
      date:          laudo.date,
      observacoes:   laudo.observacoes,
      status:        laudo.status,
      criado_em:     laudo.criadoEm,
      atualizado_em: laudo.atualizadoEm,
    }
    const { error } = await supabase!.from("laudos").upsert(payload, { onConflict: "local_id" })
    if (!error) {
      await db.laudos.update(laudo.id!, { syncStatus: "synced" })
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
    }
  }
}

async function sincronizarFotos() {
  const pendentes = await db.fotos.where("syncStatus").equals("pending").toArray()
  for (const foto of pendentes) {
    // Converte base64 para Blob para upload no Storage
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

    if (uploadError) continue

    // Registra metadados no banco relacional
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
    // No browser, escuta evento nativo
    window.addEventListener("online", () => sincronizar())
  }
  // Tenta sincronizar ao iniciar
  sincronizar()
}
