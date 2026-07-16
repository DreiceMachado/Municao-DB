// Abre o túnel ngrok no domínio FIXO, apontando para o app inteiro (vite preview,
// porta 5173). Um link só que abre o BalísticaDB de qualquer lugar (internet):
//   - o app (interface)
//   - /api  → automação do GDL (api.js:3001)   [inalterado]
//   - /db   → banco Supabase (Kong:8000)        [repassado pelo vite preview]
//
// Rode pelo `npm run web` (que builda + sobe api.js + vite preview + este túnel).
import os      from 'node:os'
import ngrok   from '@ngrok/ngrok'
import qrcode  from 'qrcode-terminal'

const DOMAIN = 'crayon-embark-shakable.ngrok-free.dev'
const PORT   = 5173   // vite preview (app + /api + /db)

// IP da rede local (mesma Wi-Fi) — funciona pra celular e desktop sem passar
// pelo ngrok (mais rápido e sem a tela de aviso). Prioriza 192.168.* → 10.*,
// ignorando as faixas de VPN/Docker (172.16–31.x.x).
function ipLocal() {
  const candidatos = []
  for (const nome of Object.keys(os.networkInterfaces())) {
    for (const i of os.networkInterfaces()[nome] || []) {
      if (i.family !== 'IPv4' || i.internal) continue
      const [a, b] = i.address.split('.').map(Number)
      if (a === 172 && b >= 16 && b <= 31) continue
      candidatos.push(i.address)
    }
  }
  return (
    candidatos.find(ip => ip.startsWith('192.168.')) ||
    candidatos.find(ip => ip.startsWith('10.'))      ||
    candidatos[0]                                    ||
    'localhost'
  )
}

const token = process.env.NGROK_AUTHTOKEN
if (!token) {
  console.error('\n  ERRO: NGROK_AUTHTOKEN nao encontrado no .env\n')
  process.exit(1)
}

const listener = await ngrok.forward({
  addr:      PORT,
  authtoken: token,
  domain:    DOMAIN,
})

const url      = listener.url() ?? `https://${DOMAIN}`
const urlLocal = `http://${ipLocal()}:${PORT}/`

console.log('')
console.log('  BalísticaDB - Acesso ao sistema')
console.log('  ===============================')
console.log('')
console.log('  >> MESMA REDE Wi-Fi (celular e desktop) — mais rápido, sem aviso:')
console.log(`     ${urlLocal}`)
console.log('     (obs.: por http, a CÂMERA/scanner do celular não funciona neste link)')
console.log('')
console.log('  >> DE FORA (internet / 4G) — e p/ usar a CÂMERA no celular:')
console.log(`     ${url}`)
console.log('')
console.log('  >> Escaneie o QR code abaixo com a câmera do celular:')
console.log('')
qrcode.generate(url, { small: true })
console.log('')
console.log('  >> (Na 1ª vez, em cada aparelho, o ngrok mostra um aviso → toque em "Visit Site".)')
console.log('  >> Deixe esta janela ABERTA. Ctrl+C para encerrar.')
console.log('')

process.stdin.resume()
