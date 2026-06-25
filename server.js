import os           from 'os'
import fs           from 'fs'
import path         from 'path'
import { fileURLToPath } from 'url'
import { execSync, exec, execFile } from 'child_process'
import { promisify }  from 'util'
import express        from 'express'

const execAsync     = promisify(exec)
const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT      = 3000
const DIST      = path.join(__dirname, 'dist')
const AUTOMACAO = path.join(__dirname, 'AutomaçãoREP')
const DADOS     = path.join(AUTOMACAO, 'dados')

function getLocalIP() {
  const nets = os.networkInterfaces()
  const candidates = []
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family !== 'IPv4' || net.internal) continue
      const [a, b] = net.address.split('.').map(Number)
      // Exclui faixa de VPN e Docker (172.16–31.x.x)
      if (a === 172 && b >= 16 && b <= 31) continue
      candidates.push(net.address)
    }
  }
  return (
    candidates.find(ip => ip.startsWith('192.168.')) ||
    candidates.find(ip => ip.startsWith('10.'))      ||
    candidates[0]                                    ||
    'localhost'
  )
}

// ── Build automático se dist não existir ─────────────────────
if (!fs.existsSync(DIST)) {
  console.clear()
  console.log('')
  console.log('  Compilando o projeto pela primeira vez...')
  console.log('  (pode demorar alguns minutos)')
  console.log('')
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname })
    console.log('')
    console.log('  OK - Projeto compilado!')
  } catch {
    console.log('\n  ERRO: Falha na compilacao.')
    console.log('  Execute "npm install" primeiro.\n')
    process.exit(1)
  }
}

// ── Servidor Express ──────────────────────────────────────────
const app = express()
app.use(express.json())
app.use(express.static(DIST))

// ── API: extrai REP do GDL ────────────────────────────────────
app.post('/api/rep', async (req, res) => {
  const { numero } = req.body ?? {}
  if (!numero?.trim()) {
    return res.status(400).json({ erro: 'Informe o número da REP' })
  }

  const PYTHON_WIN = 'C:\\Users\\dreic\\AppData\\Local\\Programs\\Python\\Python313\\python.exe'
  const opts = {
    cwd: AUTOMACAO, timeout: 180_000, maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      REP_USUARIO:      process.env.GDL_USUARIO ?? '',
      REP_SENHA:        process.env.GDL_SENHA   ?? '',
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8:       '1',
    },
  }
  let erroFinal = ''
  for (const cmd of [PYTHON_WIN, 'py', 'python', 'python3']) {
    try {
      await execAsync(`"${cmd}" -X utf8 main.py "${numero.trim().replace(/"/g, '')}"`, opts)
      erroFinal = ''; break
    } catch (err) {
      erroFinal = err.stderr || err.stdout || err.message
    }
  }
  if (erroFinal) {
    return res.status(500).json({ erro: 'Falha na extração do GDL', detalhe: erroFinal })
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

const PYTHON_WIN = 'C:\\Users\\dreic\\AppData\\Local\\Programs\\Python\\Python313\\python.exe'

function baseOpts() {
  return {
    cwd:       AUTOMACAO,
    timeout:   600_000,
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8:       '1',
    },
  }
}

function lerUltimoJson(prefixo) {
  try {
    const arquivos = fs.readdirSync(DADOS)
      .filter(f => f.startsWith(prefixo) && f.endsWith('.json'))
      .sort()
      .reverse()
    if (!arquivos.length) return null
    return JSON.parse(fs.readFileSync(path.join(DADOS, arquivos[0]), 'utf8'))
  } catch { return null }
}

// ── Buscar REPs designadas (B601 + B602) no GDL ──────────────────────────────
app.post('/api/gdl/importar-designadas', async (_req, res) => {
  try {
    await execFileAsync(PYTHON_WIN, ['-X', 'utf8', 'main.py', '--buscar-designadas'], baseOpts())
  } catch (err) {
    const detalhe = err.stdout || err.stderr || err.message
    return res.status(500).json({ ok: false, erro: 'Falha ao buscar designadas no GDL', detalhe })
  }

  const resultado = lerUltimoJson('buscar_designadas')
  if (!resultado) return res.status(500).json({ ok: false, erro: 'Resultado não gerado' })
  return res.json(resultado)
})

// SPA fallback — Express 5 substituiu '*' por regex
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'))
})

// ── Iniciar ───────────────────────────────────────────────────
const ip  = getLocalIP()
const url = `http://${ip}:${PORT}`

app.listen(PORT, () => {
  console.clear()
  console.log('')
  console.log('  BalísticaDB - Sistema Pericial')
  console.log('  ================================')
  console.log('')
  console.log(`  Local:  http://localhost:${PORT}`)
  console.log(`  Rede:   ${url}`)
  console.log('')
  console.log('  Escaneie para abrir no celular:')
  console.log('')

  try {
    execSync(`npx --yes qrcode-terminal "${url}" --small`, { stdio: 'inherit' })
  } catch {
    console.log(`  ${url}`)
  }

  console.log('')
  console.log('  Ctrl+C para encerrar')
  console.log('')
})
