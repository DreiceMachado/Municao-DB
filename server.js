import os           from 'os'
import fs           from 'fs'
import path         from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT      = 3000
const DIST      = path.join(__dirname, 'dist')

function getLocalIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address
    }
  }
  return 'localhost'
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

// ── Exibir QR code e iniciar servidor ────────────────────────
const ip  = getLocalIP()
const url = `http://${ip}:${PORT}`

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

spawn('npx', ['serve', '-s', 'dist', '-l', String(PORT)], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
})
