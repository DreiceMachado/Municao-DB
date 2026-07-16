// Garante que a infraestrutura (Docker Desktop + Supabase self-hosted) esteja
// no ar ANTES do app. É idempotente: se já estiver tudo rodando, sai em segundos.
//
// É chamado automaticamente pelo npm (script "predev") antes do `npm run dev`.
// Também pode ser rodado sozinho:  node scripts/bootstrap-infra.js
import { execSync, spawn } from 'node:child_process'

// ── Configuração (ajuste aqui se mudar de máquina/pasta) ─────────────────────
const SUPABASE_DIR   = 'C:\\Users\\dreic\\supabase\\docker'
const DOCKER_DESKTOP = 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe'
const SUPABASE_URL   = 'http://localhost:8000'        // Kong (porta do túnel)
const TIMEOUT_DOCKER_MS = 180_000                     // até 3 min p/ o Docker subir
const TIMEOUT_SUPA_MS   = 120_000                     // até 2 min p/ o Supabase responder

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const log   = (msg) => console.log(`  [infra] ${msg}`)

function dockerDaemonOk() {
  try { execSync('docker info', { stdio: 'ignore' }); return true }
  catch { return false }
}

async function ensureDocker() {
  if (dockerDaemonOk()) { log('Docker já está rodando.'); return }
  log('Docker parado. Abrindo o Docker Desktop...')
  spawn(DOCKER_DESKTOP, { detached: true, stdio: 'ignore' }).unref()
  const inicio = Date.now()
  while (Date.now() - inicio < TIMEOUT_DOCKER_MS) {
    await sleep(3000)
    if (dockerDaemonOk()) { log('Docker pronto.'); return }
    process.stdout.write('  [infra] aguardando o Docker subir...\r')
  }
  throw new Error('Docker Desktop não ficou pronto a tempo. Abra-o manualmente e rode de novo.')
}

function subirSupabase() {
  // `up -d` é idempotente: se os containers já estão de pé (restart: unless-stopped),
  // não faz nada além de confirmar. Pega o .env da própria pasta do Supabase.
  try {
    execSync('docker compose up -d', { cwd: SUPABASE_DIR, stdio: 'inherit' })
  } catch (e) {
    throw new Error('Falha ao subir os containers do Supabase: ' + e.message)
  }
}

async function esperarPorta(url, timeout) {
  const inicio = Date.now()
  while (Date.now() - inicio < timeout) {
    try {
      await fetch(url, { method: 'GET' })
      return true                       // qualquer resposta HTTP = porta viva
    } catch { /* ainda não respondeu, tenta de novo */ }
    await sleep(2000)
  }
  return false
}

async function main() {
  await ensureDocker()
  log('Garantindo os containers do Supabase (docker compose up -d)...')
  subirSupabase()
  log('Aguardando o Supabase responder na porta 8000...')
  const ok = await esperarPorta(SUPABASE_URL, TIMEOUT_SUPA_MS)
  if (!ok) {
    throw new Error(
      'Supabase não respondeu na porta 8000. Veja os logs com:\n' +
      `    cd "${SUPABASE_DIR}" && docker compose logs -f`
    )
  }
  log('Supabase no ar. Iniciando o app + túnel...\n')
}

main().catch((err) => {
  console.error(`\n  [infra] ERRO: ${err.message}\n`)
  process.exit(1)
})
