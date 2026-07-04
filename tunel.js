// Abre o túnel ngrok no domínio fixo, expondo o Supabase (Kong, porta 8000)
// para a internet. Rode com:  node --env-file=.env tunel.js   (ou TUNEL.bat)
import ngrok from '@ngrok/ngrok'

const DOMAIN = 'crayon-embark-shakable.ngrok-free.dev'
const PORT   = 8000

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

console.clear()
console.log('')
console.log('  BalísticaDB - Túnel ngrok ATIVO')
console.log('  ================================')
console.log('')
console.log(`  Endereço público:  ${listener.url()}`)
console.log(`  Aponta para:       http://localhost:${PORT}  (Supabase)`)
console.log('')
console.log('  >> Deixe esta janela ABERTA enquanto o outro notebook usar o sistema.')
console.log('  >> Ctrl+C para encerrar o túnel.')
console.log('')

// mantém o processo vivo até Ctrl+C
process.stdin.resume()
