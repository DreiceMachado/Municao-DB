const os      = require('os')
const { execSync, spawn } = require('child_process')

const PORT = 3000

function getLocalIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address
    }
  }
  return 'localhost'
}

const ip  = getLocalIP()
const url = `http://${ip}:${PORT}`

console.clear()
console.log('')
console.log('  BalísticaDB - Sistema Pericial')
console.log('  ================================')
console.log('')
console.log('  Local:  http://localhost:' + PORT)
console.log('  Rede:   ' + url)
console.log('')
console.log('  Escaneie para abrir no celular:')
console.log('')

try {
  execSync(`npx --yes qrcode-terminal "${url}" --small`, { stdio: 'inherit' })
} catch {
  console.log('  (nao foi possivel gerar o QR code)')
}

console.log('')
console.log('  Pressione Ctrl+C para encerrar')
console.log('')

const server = spawn('npx', ['serve', '-s', 'dist', '-l', String(PORT)], {
  stdio: 'inherit',
  shell: true
})

server.on('error', (err) => {
  console.error('Erro ao iniciar servidor:', err.message)
})
