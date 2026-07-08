import type { WeaponEntry, WeaponType } from '../types'
import { makeWeaponEntry } from '../data/constants'

export type RepGdlData = {
  rep:      Record<string, string>
  grids:    Record<string, Record<string, string>[]>
  arquivos: { url: string; tipo: string; base64?: string }[]
  pecas:    Record<string, string>[]
}

export type RepMapeada = {
  form: {
    examNumber:       string
    examYear:         string
    caseNumber:       string
    date:             string
    observacoes:      string
    solicitante:      string
    remetenteCidade:  string
    remetenteOrgao:   string
    naturezaExame:    string
    naturezaOcorrencia: string
    dataEntrada:      string
    horaEntrada:      string
    enderecoExame:    string
    oficio:           string
    ipApfd:           string
    processo:         string
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

function buildObservacoes(grids: RepGdlData['grids']): string {
  const origens: string[] = []

  const gridOrigens = grids['Content_RepMain_ucOrigin_gridOrigin'] ?? []
  for (const linha of gridOrigens) {
    const tipo   = linha['Origem']  ?? ''
    const numero = linha['Número']  ?? ''
    const ano    = linha['Ano']     ?? ''
    const cidade = linha['Cidade']  ?? ''
    const orgao  = linha['Órgão']   ?? ''
    if (!numero) continue

    // Ignora o que já tem campo dedicado em Informações Gerais
    if (tipo.includes('IP') || tipo.includes('APFD')) continue
    if (tipo.includes('PROCESSO')) continue
    if (tipo.includes('OFÍCIO') || tipo.includes('OFICIO')) continue

    const ref = ano ? `${numero}/${ano}` : numero
    const local = [orgao, cidade].filter(Boolean).join(' - ')
    if (tipo) origens.push(`${tipo}: ${ref}${local ? ` | ${local}` : ''}`)
  }

  return origens.join('\n')
}

function extrairOrigens(grids: RepGdlData['grids']): { oficio: string; ipApfd: string; processo: string } {
  let oficio = '', ipApfd = '', processo = ''
  const gridOrigens = grids['Content_RepMain_ucOrigin_gridOrigin'] ?? []
  for (const linha of gridOrigens) {
    const tipo   = linha['Origem']  ?? ''
    const numero = linha['Número']  ?? ''
    const ano    = linha['Ano']     ?? ''
    const cidade = linha['Cidade']  ?? ''
    const orgao  = linha['Órgão']   ?? ''
    if (!numero) continue
    const ref   = ano ? `${numero}/${ano}` : numero
    const local = [orgao, cidade].filter(Boolean).join(' — ')
    const full  = local ? `${ref} | ${local}` : ref
    if (tipo.includes('IP') || tipo.includes('APFD'))             ipApfd   = full
    else if (tipo.includes('PROCESSO'))                            processo = full
    else if (tipo.includes('OFÍCIO') || tipo.includes('OFICIO'))  oficio   = full
  }
  return { oficio, ipApfd, processo }
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
  const observacoes = buildObservacoes(grids)

  // ── Capa do Laudo ──────────────────────────────────────────
  const solicitante      = campo(rep, '$txtNameApplicant') || campo(rep, '$txtSendFrom')
  const remetenteCidade  = campo(rep, '$ddlSendFromCity')
  const remetenteOrgao   = campo(rep, '$ddlSendFromOrgan')
  const naturezaExame    = campo(rep, '$ddlNatureExam')
  const naturezaOcorrencia = campo(rep, '$ddlOccurrenceNature')
  const dataEntrada      = campo(rep, '$txtDateEntry')
  const horaEntrada      = campo(rep, '$txtHourEntry')
  const endParts         = [
    campo(rep, '$txtAddressExamOthers'),
    campo(rep, '$txtAddressNumberOthers'),
    campo(rep, '$txtAddressComplementOthers'),
    campo(rep, '$ddlOthersCity'),
  ].filter(Boolean)
  const enderecoExame    = endParts.join(', ')
  const { oficio, ipApfd, processo } = extrairOrigens(grids)

  // ── Peças ──────────────────────────────────────────────────
  const pecas:  WeaponEntry[]                        = []
  const lacres: { entrada: string; saida: string }[] = []

  for (let i = 0; i < pecasGdl.length; i++) {
    const peca    = pecasGdl[i]
    const tipoGdl = campo(peca, '$ddlTypeParts')
    const tipo    = mapTipo(tipoGdl)
    if (!tipo) continue

    const identificacao = campo(peca, '$txtIdentifyParts')
    const entry         = makeWeaponEntry(tipo)

    // ID sequencial da lista do GDL + ID interno do WebForms
    entry.idPeca           = String(i + 1)
    entry.gdlPartsId       = campo(peca, 'hdnPartsId')

    // Campos de identificação
    entry.identificacao    = identificacao
    entry.caliber          = extrairCalibre(identificacao)
    entry.serial           = campo(peca, '$ctl01$txtField')
    entry.brand            = campo(peca, '$ctl02$txtField')
    entry.model            = campo(peca, '$ctl03$txtField')
    const capacidadeGdl    = campo(peca, '$ctl04$txtField')
    if (tipo === 'REVÓLVER') {
      entry.numCamaras     = capacidadeGdl
    } else {
      entry.capacidadeCarregador = capacidadeGdl
    }
    const serialStatusGdl  = campo(peca, '$ctl06$ddlField')
    if (serialStatusGdl) entry.serialEstado = serialStatusGdl.toUpperCase()
    const paisGdl          = campo(peca, '$ctl10$ddlField')
    if (paisGdl) entry.paisFabricacao = paisGdl.toUpperCase()
    entry.quantidade       = campo(peca, '$txtQtdeColorParts')

    // Para tipos sem campo "Modelo" separado no web app (ARMA DE PRESSÃO, ESTOJO, CARTUCHO,
    // ESPOLETA, CARREGADOR, FACA), a Identificação exibida no web app é o campo 'model'.
    // Se ctl03 chegou vazio do GDL, popula model com identificacao para manter round-trip correto.
    const ARMAS_FOGO_COM_MODELO: typeof tipo[] = [
      'REVÓLVER','PISTOLA','ESPINGARDA','CARABINA','FUZIL','METRALHADORA','ARMA DE ANTECARGA'
    ]
    if (!ARMAS_FOGO_COM_MODELO.includes(tipo) && !entry.model) {
      entry.model = entry.identificacao
    }

    // Grupo de cartuchos/estojos com quantidade → sempre ÍNTEGRO
    if (tipo === 'CARTUCHO' && entry.quantidade) entry.estadoCartucho = 'ÍNTEGRO'
    if (tipo === 'ESTOJO'   && entry.quantidade) entry.estadoEstojo   = 'ÍNTEGRO'

    // Arma de fogo com número de série preenchido → industrial + legível
    const ARMAS_FOGO: typeof tipo[] = ['REVÓLVER','PISTOLA','ESPINGARDA','CARABINA','FUZIL','METRALHADORA','ARMA DE PRESSÃO','ARMA DE ANTECARGA']
    if (ARMAS_FOGO.includes(tipo) && entry.serial) {
      entry.tipoProd     = 'INDUSTRIAL'
      entry.serialEstado = 'LEGÍVEL'
    }

    // Lacres (armazenados na própria peça)
    entry.lacreEntradaPeca  = campo(peca, '$txtSealEntryParts')
    entry.lacreSaidaPeca    = campo(peca, '$txtSealExitParts')

    // Guia de Remessa
    entry.dataEntradaPeca   = campo(peca, '$txtDtaEntryParts')
    // Se o GDL não trouxer data de liberação, mantém o default (hoje) de makeWeaponEntry
    entry.dataLiberacaoPeca = campo(peca, '$txtDtaLiberationParts') || entry.dataLiberacaoPeca
    entry.unidadeMedida     = campo(peca, '$ddlDimensionParts')
    entry.consumidaExame    = campo(peca, '$ddlItemsConsumedExaminationParts')
    entry.observacaoPeca    = campo(peca, '$txtObservation')

    pecas.push(entry)
    lacres.push({
      entrada: entry.lacreEntradaPeca,
      saida:   entry.lacreSaidaPeca,
    })
  }

  return {
    form: {
      examNumber:        examNumber.trim(),
      examYear:          examYear.trim(),
      caseNumber,
      date,
      observacoes,
      solicitante,
      remetenteCidade,
      remetenteOrgao,
      naturezaExame,
      naturezaOcorrencia,
      dataEntrada,
      horaEntrada,
      enderecoExame,
      oficio,
      ipApfd,
      processo,
    },
    pecas,
    lacres,
  }
}
