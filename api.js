import fs           from 'fs'
import path         from 'path'
import { fileURLToPath } from 'url'
import { exec, execFile } from 'child_process'
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
  const opts = {
    cwd:       AUTOMACAO,
    timeout:   300_000,  // 5 min — extração pode demorar
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8:       '1',
      // Só sobrescreve se explicitamente configurado; senão o load_dotenv() do Python usa o .env
      ...(process.env.GDL_USUARIO ? { REP_USUARIO: process.env.GDL_USUARIO } : {}),
      ...(process.env.GDL_SENHA   ? { REP_SENHA:   process.env.GDL_SENHA   } : {}),
    },
  }

  try {
    await execAsync(`"${PYTHON}" -X utf8 main.py "${numeroSeguro}"`, opts)
  } catch (err) {
    // stdout tem os prints do Python; stderr tem o EPIPE do driver Playwright (ruído)
    const detalhe = err.stdout || err.stderr || err.message
    return res.status(500).json({ erro: 'Falha na extração do GDL', detalhe })
  }

  const nomeBase = numero.trim().replace(/\//g, '-').replace(/\./g, '')
  let arquivos = []
  try {
    arquivos = fs.readdirSync(DADOS)
      .filter(f => f.startsWith(`rep_${nomeBase}_`) && f.endsWith('.json'))
      .sort()
      .reverse()
  } catch {
    return res.status(500).json({ erro: 'Pasta de dados não encontrada' })
  }

  if (!arquivos.length) {
    return res.status(404).json({ erro: 'Dados da REP não foram gerados' })
  }

  const conteudo = JSON.parse(fs.readFileSync(path.join(DADOS, arquivos[0]), 'utf8'))
  return res.json(conteudo)
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

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[API] Servidor rodando em http://127.0.0.1:${PORT}`)
})
