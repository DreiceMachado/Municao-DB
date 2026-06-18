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
app.use(express.json())

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

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[API] Servidor rodando em http://127.0.0.1:${PORT}`)
})
