import fs           from 'fs'
import path         from 'path'
import { fileURLToPath } from 'url'
import { exec }     from 'child_process'
import { promisify } from 'util'
import express       from 'express'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT      = 3001
const AUTOMACAO = path.join(__dirname, 'AutomaçãoREP')
const DADOS     = path.join(AUTOMACAO, 'dados')

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
    timeout:   180_000,
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      REP_USUARIO:      process.env.GDL_USUARIO ?? '',
      REP_SENHA:        process.env.GDL_SENHA   ?? '',
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8:       '1',
    },
  }

  const PYTHON = 'C:\\Users\\dreic\\AppData\\Local\\Programs\\Python\\Python313\\python.exe'
  try {
    await execAsync(`"${PYTHON}" -X utf8 main.py "${numeroSeguro}"`, opts)
  } catch (err) {
    const detalhe = err.stderr || err.stdout || err.message
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

app.listen(PORT, () => {
  console.log(`[API] http://localhost:${PORT}`)
})
