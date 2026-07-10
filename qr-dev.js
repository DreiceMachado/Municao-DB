// Mostra no terminal um QR code do endereço local do app (IP da rede), para
// abrir no celular escaneando (mesma rede Wi-Fi). Sem ngrok/HTTPS.
import os from 'node:os'
import qrcode from 'qrcode-terminal'

const PORT = 5173 // porta padrão do Vite (npm run dev)

function ipsLocais() {
  const ifaces = os.networkInterfaces()
  const addrs = []
  for (const nome of Object.keys(ifaces)) {
    for (const i of ifaces[nome] || []) {
      if (i.family === 'IPv4' && !i.internal) addrs.push(i.address)
    }
  }
  return addrs
}

const addrs = ipsLocais()
// Preferência: 192.168.* (Wi-Fi doméstico) → 10.* → primeiro disponível.
const ip =
  addrs.find(a => a.startsWith('192.168.')) ||
  addrs.find(a => a.startsWith('10.')) ||
  addrs[0] || 'localhost'
const url = `http://${ip}:${PORT}/`

// Pequeno atraso para o QR aparecer depois do banner do Vite.
setTimeout(() => {
  console.log('')
  console.log('  ┌───────────────────────────────────────────────┐')
  console.log('  │  Abra o app no CELULAR (mesma rede Wi-Fi):      │')
  console.log('  └───────────────────────────────────────────────┘')
  console.log(`     ${url}`)
  console.log('')
  qrcode.generate(url, { small: true })
  if (addrs.length > 1) {
    console.log('  Se este não abrir, tente outro IP da lista do Vite acima:')
    addrs.forEach(a => { if (a !== ip) console.log(`     http://${a}:${PORT}/`) })
  }
  console.log('')
}, 2000)
