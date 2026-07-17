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

// O plano free do ngrok aceita UM túnel por domínio. Se sobrou outra janela
// aberta (WEB.bat, npm run web, npm run dev → tunel.js), o forward abaixo falha
// e o processo morria em silêncio no meio da saída colorida do concurrently —
// sem link, sem QR code, e sem pista do motivo. Explica o que houve.
let listener
try {
  listener = await ngrok.forward({
    addr:      PORT,
    authtoken: token,
    domain:    DOMAIN,
  })
} catch (erro) {
  const msg = String(erro?.message ?? erro)
  console.error('')
  if (/already online|already bound|ERR_NGROK_(334|108)/i.test(msg)) {
    console.error('  ERRO: o domínio do ngrok já está em uso por OUTRA janela.')
    console.error('')
    console.error(`     ${DOMAIN}`)
    console.error('')
    console.error('  O plano free permite só um túnel por domínio. Feche a outra janela')
    console.error('  (Ctrl+C) e rode de novo. Para matar qualquer sobra, no PowerShell:')
    console.error('')
    console.error('     Get-CimInstance Win32_Process -Filter "Name=\'node.exe\'" |')
    console.error('       Where-Object { $_.CommandLine -like "*tunel*" } |')
    console.error('       ForEach-Object { Stop-Process -Id $_.ProcessId -Force }')
  } else {
    console.error('  ERRO ao abrir o túnel ngrok:')
    console.error('')
    console.error(`     ${msg}`)
  }
  console.error('')
  process.exit(1)
}

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
