// Abre o app (Vite) via HTTPS com ngrok, para testar no celular (câmera/scanner
// exigem HTTPS). Expõe também o Supabase, na mesma sessão ngrok.
// Rode com:  node --env-file=.env tunel-app.js   (com o `npm run dev` já rodando)
import ngrok from '@ngrok/ngrok'
import qrcode from 'qrcode-terminal'

const SUPABASE_DOMAIN = 'crayon-embark-shakable.ngrok-free.dev'
const SUPABASE_PORT   = 8000
const APP_PORT        = 5173 // porta padrão do Vite (npm run dev)

const token = process.env.NGROK_AUTHTOKEN
if (!token) {
  console.error('\n  ERRO: NGROK_AUTHTOKEN nao encontrado no .env\n')
  process.exit(1)
}

// Supabase — domínio fixo
const supa = await ngrok.forward({ addr: SUPABASE_PORT, authtoken: token, domain: SUPABASE_DOMAIN })
// App (Vite) — domínio aleatório (https válido)
const app  = await ngrok.forward({ addr: APP_PORT, authtoken: token })

console.log('')
console.log('  BalísticaDB - Túneis ngrok ATIVOS')
console.log('  =================================')
console.log('')
console.log(`  >> APP (abra no iPhone):  ${app.url()}`)
console.log(`     Supabase:              ${supa.url()}`)
console.log('')
console.log('  >> Escaneie o QR code abaixo com a câmera do iPhone:')
console.log('')
qrcode.generate(app.url() ?? '', { small: true })
console.log('')
console.log('  >> (Na 1ª vez o ngrok mostra uma tela de aviso → toque em "Visit Site".)')
console.log('  >> Deixe esta janela ABERTA. Ctrl+C para encerrar.')
console.log('')

process.stdin.resume()
