import fs           from 'fs'
import path         from 'path'
import { fileURLToPath } from 'url'
import { exec, execFile, spawn } from 'child_process'
import { promisify } from 'util'
import express       from 'express'

const execAsync     = promisify(exec)
const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT      = 3001
const AUTOMACAO = path.join(__dirname, 'AutomaçãoREP')
const DADOS     = path.join(AUTOMACAO, 'dados')

// Garante que as pastas existam para não dar erro de "Folder not found"
if (!fs.existsSync(DADOS)) {
  fs.mkdirSync(DADOS, { recursive: true });
}

const app = express()
// Limite alto: o envio de fotos ao GDL manda imagens em base64 no corpo da requisição
app.use(express.json({ limit: '80mb' }))

app.post('/api/rep', async (req, res) => {
  const { numero } = req.body ?? {}
  if (!numero?.trim()) {
    return res.status(400).json({ erro: 'Informe o número da REP' })
  }

  const numeroSeguro = numero.trim().replace(/"/g, '')

  // Importa APENAS esta REP usando o worker persistente: a 1ª busca abre o navegador
  // e faz login (lenta); as próximas reaproveitam a sessão logada (rápidas).
  try {
    const resultado = await enviarComandoWorker(
      { action: 'importar-rep', rep_numero: numeroSeguro },
      300_000,
    )
    if (!resultado || resultado.ok === false) {
      return res.status(500).json({ erro: resultado?.erro || 'Falha na extração do GDL' })
    }
    return res.json(resultado)
  } catch (err) {
    return res.status(500).json({ erro: 'Falha na extração do GDL', detalhe: err.message })
  }
})

// ── Helpers GDL ──────────────────────────────────────────────────────────────

const PYTHON = 'C:\\Users\\dreic\\AppData\\Local\\Programs\\Python\\Python313\\python.exe'

function baseOpts() {
  return {
    cwd:       AUTOMACAO,
    timeout:   300_000,  // 5 min
    maxBuffer: 2 * 1024 * 1024,
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8:       '1',
      ...(process.env.GDL_USUARIO ? { REP_USUARIO: process.env.GDL_USUARIO } : {}),
      ...(process.env.GDL_SENHA   ? { REP_SENHA:   process.env.GDL_SENHA   } : {}),
    },
  }
}

// ── Worker persistente do GDL (navegador logado reaproveitado) ────────────────
// Mantém o gdl_worker.py vivo: a 1ª chamada abre o navegador e faz login (lento);
// as seguintes reutilizam a MESMA sessão (rápido). Usado só pelo /api/rep (import
// de 1 REP). NÃO afeta a importação em lote (que continua usando o main.py).
let _gdlWorker  = null
let _gdlBuf     = ''
let _gdlPending = null          // { resolve, reject, timer } — 1 comando por vez
let _gdlChain   = Promise.resolve()

function _iniciarWorker() {
  const w = spawn(PYTHON, ['-X', 'utf8', 'gdl_worker.py'], {
    cwd: AUTOMACAO,
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8:       '1',
      ...(process.env.GDL_USUARIO ? { REP_USUARIO: process.env.GDL_USUARIO } : {}),
      ...(process.env.GDL_SENHA   ? { REP_SENHA:   process.env.GDL_SENHA   } : {}),
    },
  })
  w.stdout.setEncoding('utf8')
  w.stdout.on('data', chunk => {
    _gdlBuf += chunk
    let idx
    while ((idx = _gdlBuf.indexOf('\n')) >= 0) {
      const linha = _gdlBuf.slice(0, idx).trim()
      _gdlBuf = _gdlBuf.slice(idx + 1)
      if (!linha) continue
      const p = _gdlPending
      _gdlPending = null
      if (p) {
        clearTimeout(p.timer)
        try { p.resolve(JSON.parse(linha)) }
        catch { p.reject(new Error('Resposta inválida do worker: ' + linha.slice(0, 200))) }
      }
    }
  })
  w.stderr.on('data', d => process.stderr.write('[gdl_worker] ' + d))
  w.on('exit', code => {
    console.error(`[gdl_worker] encerrou (code ${code})`)
    if (_gdlPending) { clearTimeout(_gdlPending.timer); _gdlPending.reject(new Error('Worker do GDL encerrou')); _gdlPending = null }
    _gdlWorker = null
    _gdlBuf = ''
  })
  return w
}

// Envia um comando ao worker e resolve com o JSON de resposta. Serializa as chamadas
// (1 navegador → 1 comando por vez).
function enviarComandoWorker(cmd, timeoutMs = 300_000) {
  const executar = () => new Promise((resolve, reject) => {
    if (!_gdlWorker) _gdlWorker = _iniciarWorker()
    const timer = setTimeout(() => {
      _gdlPending = null
      try { _gdlWorker && _gdlWorker.kill() } catch { /* ignora */ }
      reject(new Error('Tempo esgotado aguardando o worker do GDL'))
    }, timeoutMs)
    _gdlPending = { resolve, reject, timer }
    _gdlWorker.stdin.write(JSON.stringify(cmd) + '\n')
  })
  const p = _gdlChain.then(executar, executar)
  _gdlChain = p.catch(() => {})  // um erro não trava a fila
  return p
}

function lerUltimoJson(prefixo) {
  const arquivos = fs.readdirSync(DADOS)
    .filter(f => f.startsWith(prefixo) && f.endsWith('.json'))
    .sort()
    .reverse()
  if (!arquivos.length) return null
  return JSON.parse(fs.readFileSync(path.join(DADOS, arquivos[0]), 'utf8'))
}

// Grava fotos (base64) em uma pasta temporária e devolve o caminho da pasta.
// Cada item: { nome, base64 } — base64 pode vir como data URL ou base64 puro.
// Retorna null se não houver fotos.
function gravarFotosTemp(repNome, fotos) {
  if (!Array.isArray(fotos) || fotos.length === 0) return null
  const carimbo = `${repNome}_${Date.now()}`
  const pasta   = path.join(DADOS, 'upload_fotos', carimbo)
  fs.mkdirSync(pasta, { recursive: true })

  const usados = new Set()
  for (let i = 0; i < fotos.length; i++) {
    const item = fotos[i] ?? {}
    const bruto = String(item.base64 ?? '')
    const dados = bruto.includes(',') ? bruto.slice(bruto.indexOf(',') + 1) : bruto
    if (!dados) continue

    // Nome de arquivo seguro e único (o GDL rejeita nomes repetidos/estranhos)
    let base = String(item.nome ?? `foto_${i + 1}`)
      .replace(/[^\w.\- ]+/g, '_')
      .replace(/\s+/g, '_')
      .slice(0, 80)
    if (!/\.(jpe?g|png|webp|gif)$/i.test(base)) base += '.jpg'
    let nome = base
    let n = 1
    while (usados.has(nome.toLowerCase())) {
      nome = base.replace(/(\.[^.]+)$/, `_${n++}$1`)
    }
    usados.add(nome.toLowerCase())

    fs.writeFileSync(path.join(pasta, nome), Buffer.from(dados, 'base64'))
  }
  return pasta
}

function apagarPastaTemp(pasta) {
  if (!pasta) return
  try { fs.rmSync(pasta, { recursive: true, force: true }) } catch { /* ignora */ }
}

// ── Adicionar peça ao GDL ─────────────────────────────────────────────────────

app.post('/api/gdl/adicionar-peca', async (req, res) => {
  const { rep_numero, peca } = req.body ?? {}
  if (!rep_numero?.trim() || !peca) {
    return res.status(400).json({ ok: false, erro: 'Informe rep_numero e peca' })
  }

  const repSeguro = rep_numero.trim()
  // execFileAsync não passa pelo shell — JSON chega ao Python exatamente como gerado,
  // sem problemas de escaping de \ ou " no cmd.exe
  try {
    await execFileAsync(PYTHON, ['-X', 'utf8', 'main.py', '--adicionar', repSeguro, JSON.stringify(peca)], baseOpts())
  } catch (err) {
    const detalhe = err.stdout || err.stderr || err.message
    return res.status(500).json({ ok: false, erro: 'Falha ao adicionar peça no GDL', detalhe })
  }

  const repNome = rep_numero.trim().replace(/\//g, '-').replace(/\./g, '')
  const resultado = lerUltimoJson(`gdl_add_${repNome}`)
  if (!resultado) return res.status(500).json({ ok: false, erro: 'Resultado não gerado' })
  return res.json(resultado)
})

// ── Editar peça no GDL ────────────────────────────────────────────────────────

app.post('/api/gdl/editar-peca', async (req, res) => {
  const { rep_numero, gdl_parts_id, peca } = req.body ?? {}
  if (!rep_numero?.trim() || !gdl_parts_id?.trim() || !peca) {
    return res.status(400).json({ ok: false, erro: 'Informe rep_numero, gdl_parts_id e peca' })
  }

  const repSeguro = rep_numero.trim()
  const idSeguro  = gdl_parts_id.trim()

  try {
    await execFileAsync(PYTHON, ['-X', 'utf8', 'main.py', '--editar', repSeguro, idSeguro, JSON.stringify(peca)], baseOpts())
  } catch (err) {
    const detalhe = err.stdout || err.stderr || err.message
    return res.status(500).json({ ok: false, erro: 'Falha ao editar peça no GDL', detalhe })
  }

  const repNome = rep_numero.trim().replace(/\//g, '-').replace(/\./g, '')
  const resultado = lerUltimoJson(`gdl_edit_${repNome}`)
  if (!resultado) return res.status(500).json({ ok: false, erro: 'Resultado não gerado' })
  return res.json(resultado)
})

// ── Excluir peça do GDL ──────────────────────────────────────────────────────

app.post('/api/gdl/excluir-peca', async (req, res) => {
  const { rep_numero, gdl_parts_id, peca } = req.body ?? {}
  if (!rep_numero?.trim()) {
    return res.status(400).json({ ok: false, erro: 'Informe rep_numero' })
  }

  const repSeguro = rep_numero.trim()
  const idSeguro  = (gdl_parts_id ?? '').trim()
  const pyArgs    = ['-X', 'utf8', 'main.py', '--excluir', repSeguro, idSeguro]
  if (peca) pyArgs.push(JSON.stringify(peca))

  try {
    await execFileAsync(PYTHON, pyArgs, baseOpts())
  } catch (err) {
    const detalhe = err.stdout || err.stderr || err.message
    return res.status(500).json({ ok: false, erro: 'Falha ao excluir peça no GDL', detalhe })
  }

  const repNome = rep_numero.trim().replace(/\//g, '-').replace(/\./g, '')
  const resultado = lerUltimoJson(`gdl_del_${repNome}`)
  if (!resultado) return res.status(500).json({ ok: false, erro: 'Resultado não gerado' })
  return res.json(resultado)
})

// ── Sincronizar peças do GDL com BalísticaDB (remove extras do GDL) ──────────
app.post('/api/gdl/sincronizar', async (req, res) => {
  const { rep_numero, pecas } = req.body ?? {}
  if (!rep_numero?.trim() || !Array.isArray(pecas)) {
    return res.status(400).json({ ok: false, erro: 'Informe rep_numero e pecas[]' })
  }

  const repSeguro = rep_numero.trim()
  try {
    await execFileAsync(PYTHON, ['-X', 'utf8', 'main.py', '--sincronizar', repSeguro, JSON.stringify(pecas)], baseOpts())
  } catch (err) {
    const detalhe = err.stdout || err.stderr || err.message
    return res.status(500).json({ ok: false, erro: 'Falha ao sincronizar com GDL', detalhe })
  }

  const repNome = rep_numero.trim().replace(/\//g, '-').replace(/\./g, '')
  const resultado = lerUltimoJson(`gdl_sync_${repNome}`)
  if (!resultado) return res.status(500).json({ ok: false, erro: 'Resultado não gerado' })
  return res.json(resultado)
})

// ── Atualizar tudo em uma sessão (adicionar + editar + sincronizar exclusões) ──
app.post('/api/gdl/atualizar', async (req, res) => {
  const { rep_numero, pecas, fotos } = req.body ?? {}
  if (!rep_numero?.trim() || !Array.isArray(pecas)) {
    return res.status(400).json({ ok: false, erro: 'Informe rep_numero e pecas[]' })
  }

  const repSeguro = rep_numero.trim()
  const repNome   = repSeguro.replace(/\//g, '-').replace(/\./g, '')

  // Grava as fotos novas em disco (o Playwright faz upload a partir de arquivos)
  const pastaFotos = gravarFotosTemp(repNome, fotos)
  const payload    = JSON.stringify(pastaFotos ? { pecas, fotosDir: pastaFotos } : { pecas })

  try {
    await execFileAsync(PYTHON, ['-X', 'utf8', 'main.py', '--atualizar', repSeguro, payload], baseOpts())
  } catch (err) {
    const detalhe = err.stdout || err.stderr || err.message
    return res.status(500).json({ ok: false, erro: 'Falha ao atualizar GDL', detalhe })
  } finally {
    apagarPastaTemp(pastaFotos)
  }

  const resultado = lerUltimoJson(`gdl_atualizar_${repNome}`)
  if (!resultado) return res.status(500).json({ ok: false, erro: 'Resultado não gerado' })
  return res.json(resultado)
})

// ── Buscar REPs designadas (B601 + B602) no GDL ──────────────────────────────
app.post('/api/gdl/importar-designadas', async (_req, res) => {
  try {
    await execFileAsync(PYTHON, ['-X', 'utf8', 'main.py', '--buscar-designadas'], {
      ...baseOpts(),
      timeout: 600_000, // 10 min — pode ter muitas páginas
    })
  } catch (err) {
    const detalhe = err.stdout || err.stderr || err.message
    return res.status(500).json({ ok: false, erro: 'Falha ao buscar designadas no GDL', detalhe })
  }

  const resultado = lerUltimoJson('buscar_designadas')
  if (!resultado) return res.status(500).json({ ok: false, erro: 'Resultado não gerado' })
  return res.json(resultado)
})

// ── Pesquisar coleta de padrão (natureza B603) por número do caso no GDL ──────
app.post('/api/gdl/buscar-coleta', async (req, res) => {
  const { caso } = req.body ?? {}
  const casoSeguro = (caso ?? '').toString().trim().replace(/[^0-9]/g, '')
  if (!casoSeguro) {
    return res.status(400).json({ ok: false, erro: 'Informe o número do caso' })
  }
  try {
    await execFileAsync(PYTHON, ['-X', 'utf8', 'main.py', '--buscar-coleta', casoSeguro], {
      ...baseOpts(),
      timeout: 300_000, // 5 min
    })
  } catch (err) {
    const detalhe = err.stdout || err.stderr || err.message
    return res.status(500).json({ ok: false, erro: 'Falha ao pesquisar coleta no GDL', detalhe })
  }

  const resultado = lerUltimoJson('buscar_coleta')
  if (!resultado) return res.status(500).json({ ok: false, erro: 'Resultado não gerado' })
  return res.json(resultado)
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[API] Servidor rodando em http://127.0.0.1:${PORT}`)
})
