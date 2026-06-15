import type { WeaponEntry, WeaponType } from '../types'
import { makeWeaponEntry } from '../data/constants'

export type RepGdlData = {
  rep:      Record<string, string>
  grids:    Record<string, Record<string, string>[]>
  arquivos: { url: string; tipo: string }[]
  pecas:    Record<string, string>[]
}

export type RepMapeada = {
  form: {
    examNumber:  string
    examYear:    string
    caseNumber:  string
    date:        string
    observacoes: string
  }
  pecas:  WeaponEntry[]
  lacres: { entrada: string; saida: string }[]
}

// ── Helpers ────────────────────────────────────────────────────

function campo(obj: Record<string, string>, sufixo: string): string {
  const entry = Object.entries(obj).find(([k]) => k.endsWith(sufixo))
  return entry?.[1]?.trim() ?? ''
}

function parseDateBR(dataHora: string): string {
  // "29/08/2025 06:51" → "29/08/2025"
  return dataHora.split(' ')[0] ?? ''
}

function mapTipo(gdlTipo: string): WeaponType | null {
  const s = gdlTipo.toUpperCase().trim()
  if (s.startsWith('PISTOLA'))                                                        return 'PISTOLA'
  if (s.startsWith('REVÓLVER') || s.startsWith('REVOLVER'))                          return 'REVÓLVER'
  if (s.startsWith('ESPINGARDA'))                                                     return 'ESPINGARDA'
  if (s.startsWith('CARABINA'))                                                       return 'CARABINA'
  if (s.startsWith('FUZIL') || s.startsWith('FUZIS'))                                return 'FUZIL'
  if (s.startsWith('METRALHADORA'))                                                   return 'METRALHADORA'
  if (s.startsWith('ESTOJO'))                                                         return 'ESTOJO'
  if (s.startsWith('PROJÉTIL') || s.startsWith('PROJETIL') ||
      s.startsWith('PROJÉTEIS') || s.startsWith('PROJETEIS'))                        return 'PROJÉTIL'
  if (s.startsWith('CARTUCHO'))                                                       return 'CARTUCHO'
  if (s.startsWith('FACA'))                                                           return 'FACA'
  if (s.includes('PRESSÃO') || s.includes('PRESSAO'))                                return 'ARMA DE PRESSÃO'
  if (s.includes('ANTECARGA'))                                                        return 'ARMA DE ANTECARGA'
  if (s.startsWith('PÓLVORA') || s.startsWith('POLVORA'))                            return 'PÓLVORA'
  if (s.startsWith('ESPOLETA'))                                                       return 'ESPOLETA'
  if (s.startsWith('CARREGADOR'))                                                     return 'CARREGADOR'
  return null
}

function extrairCalibre(identificacao: string): string {
  const m = identificacao.match(/CAL\.\s*([^\s,]+(?:\s*[xX×]\s*[^\s,]+)?)/i)
  return m ? m[1].toUpperCase() : ''
}

function buildObservacoes(grids: RepGdlData['grids'], rep: Record<string, string>): string {
  const origens: string[] = []

  const gridOrigens = grids['Content_RepMain_ucOrigin_gridOrigin'] ?? []
  for (const linha of gridOrigens) {
    const tipo   = linha['Origem']  ?? ''
    const numero = linha['Número']  ?? ''
    const ano    = linha['Ano']     ?? ''
    const cidade = linha['Cidade']  ?? ''
    const orgao  = linha['Órgão']   ?? ''
    if (!numero) continue

    const ref = ano ? `${numero}/${ano}` : numero
    const local = [orgao, cidade].filter(Boolean).join(' - ')

    if (tipo.includes('IP') || tipo.includes('APFD')) {
      origens.push(`IP/APFD: ${ref}${local ? ` | ${local}` : ''}`)
    } else if (tipo.includes('PROCESSO')) {
      origens.push(`Processo: ${ref}${local ? ` | ${local}` : ''}`)
    } else if (tipo.includes('OFÍCIO') || tipo.includes('OFICIO')) {
      origens.push(`Ofício: ${ref}${local ? ` | ${local}` : ''}`)
    } else if (tipo) {
      origens.push(`${tipo}: ${ref}${local ? ` | ${local}` : ''}`)
    }
  }

  const solicitante = campo(rep, '$txtNameApplicant')
  if (solicitante) origens.push(`Solicitante: ${solicitante}`)

  return origens.join('\n')
}

// ── Mapper principal ───────────────────────────────────────────

export function mapearRepGdl(dados: RepGdlData): RepMapeada {
  const rep      = dados.rep   ?? {}
  const grids    = dados.grids ?? {}
  const pecasGdl = dados.pecas ?? []

  // ── Cabeçalho do exame ─────────────────────────────────────
  const numAno     = campo(rep, '$hdnRepNumberYear')   // "99047/2025"
  const [examNumber = '', examYear = ''] = numAno.split('/')
  const caseNumber  = campo(rep, '$txtCaseNumber')
  const date        = parseDateBR(campo(rep, '$hdfDateOpen'))
  const observacoes = buildObservacoes(grids, rep)

  // ── Peças ──────────────────────────────────────────────────
  const pecas:  WeaponEntry[]                        = []
  const lacres: { entrada: string; saida: string }[] = []

  for (const peca of pecasGdl) {
    const tipoGdl = campo(peca, '$ddlTypeParts')
    const tipo    = mapTipo(tipoGdl)
    if (!tipo) continue

    const identificacao = campo(peca, '$txtIdentifyParts')
    const entry         = makeWeaponEntry(tipo)

    // Campos de identificação
    entry.identificacao = identificacao
    entry.caliber       = extrairCalibre(identificacao)
    entry.serial        = campo(peca, '$ctl01$txtField')  // N.º de série
    entry.brand         = campo(peca, '$ctl02$txtField')  // Marca/fabricante
    entry.model         = campo(peca, '$ctl03$txtField')  // Modelo (quando preenchido)

    // Quantidade
    entry.quantidade    = campo(peca, '$txtQtdeColorParts')

    pecas.push(entry)
    lacres.push({
      entrada: campo(peca, '$txtSealEntryParts'),
      saida:   campo(peca, '$txtSealExitParts'),
    })
  }

  return {
    form: {
      examNumber:  examNumber.trim(),
      examYear:    examYear.trim(),
      caseNumber,
      date,
      observacoes,
    },
    pecas,
    lacres,
  }
}
