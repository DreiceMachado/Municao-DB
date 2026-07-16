import type { WeaponEntry, WeaponType } from '../types'
import { makeWeaponEntry } from '../data/constants'
import {
  normalizarMarcaGdl, normalizarPaisGdl, extrairCalibre,
  camposDoTipo, normalizarAcabamentoGdl, funcionamentoParaApto, calibreDoDropdown,
  normalizarStatusSerieGdl, mesclarDescricaoGdl, normalizarTamborGdl,
  normalizarMarcaMunicaoGdl, normalizarOrigemGdl, normalizarResultadoPsaGdl,
  institucionalGdl,
} from './gdlNormaliza'

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
  if (s.startsWith('SUBMETRALHADORA'))                                                return 'SUBMETRALHADORA'
  if (s.startsWith('METRALHADORA'))                                                   return 'METRALHADORA'
  if (s.startsWith('GARRUCHA'))                                                       return 'GARRUCHA'
  if (s.startsWith('PISTOLETE'))                                                      return 'PISTOLETE'
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
  if (s.includes('JET LOADER'))                                                       return 'CARREGADOR'   // speedloader → carregador
  if (s.includes('CHOQUE'))                                                           return 'ARMA DE CHOQUE'
  if (s.startsWith('OUTRO'))                                                          return 'OUTRO'
  return null
}

// extrairCalibre foi movido para ./gdlNormaliza (versão tolerante a "CAL" sem ponto
// e que casa com a lista oficial de calibres do GDL por tipo).

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
    entry.caliber          = extrairCalibre(identificacao, tipo)
    entry.serial           = campo(peca, '$ctl01$txtField')
    // Marca: o perito pode preencher o campo texto "Marca" (ctl02) OU o dropdown
    // "Marca da Arma"/"Marca de Cartucho" (índice varia por tipo). Usa o texto; se
    // vazio, cai no dropdown.
    const camposTipo       = camposDoTipo(tipoGdl)
    const MUNICAO: typeof tipo[] = ['ESTOJO','CARTUCHO','CARREGADOR','ESPOLETA','PÓLVORA']
    const marcaBruta       = campo(peca, '$ctl02$txtField')
      || (camposTipo.marcaDropdown ? campo(peca, camposTipo.marcaDropdown) : '')
    // Munição usa o catálogo de fabricantes de munição; armas usam o catálogo de armas.
    entry.brand            = MUNICAO.includes(tipo)
      ? normalizarMarcaMunicaoGdl(marcaBruta)
      : normalizarMarcaGdl(marcaBruta)
    entry.model            = campo(peca, '$ctl03$txtField')
    const capacidadeGdl    = campo(peca, '$ctl04$txtField')
    if (tipo === 'REVÓLVER') {
      entry.numCamaras     = capacidadeGdl
    } else {
      entry.capacidadeCarregador = capacidadeGdl
    }
    // Status do Número de Série (índice varia por tipo; no revólver é ctl05, não ctl06).
    // Guardado aqui e aplicado adiante junto com tipoProd (INDUSTRIAL) e o número.
    const statusSerieGdl   = camposTipo.statusSerie ? campo(peca, camposTipo.statusSerie) : ''
    const serialEstadoApp  = normalizarStatusSerieGdl(statusSerieGdl)
    // País no GDL é adjetivo ("brasileira") → substantivo do app ("Brasil").
    // Lê o campo correto por tipo (fallback ctl10). Ignora placeholders/lixo.
    const paisGdl          = normalizarPaisGdl(campo(peca, camposTipo.pais ?? '$ctl10$ddlField'))
    if (paisGdl) entry.paisFabricacao = paisGdl
    entry.quantidade       = campo(peca, '$txtQtdeColorParts')

    // Calibre: o dropdown "Calibre Nominal" (quando preenchido pelo perito) é
    // autoritativo e sobrepõe o calibre extraído do texto da identificação.
    if (camposTipo.calibreDropdown) {
      const calDrop = calibreDoDropdown(campo(peca, camposTipo.calibreDropdown))
      if (calDrop) entry.caliber = calDrop
    }
    // "Tipo Acabamento" do GDL → "Material e acabamento do quadro" do app.
    if (camposTipo.acabamento) {
      const acab = normalizarAcabamentoGdl(campo(peca, camposTipo.acabamento))
      if (acab) entry.materialQuadro = acab
    }
    // "Funcionamento" do GDL → Exame de disparo (apto para disparo):
    // Eficiente → apta; Ineficiente → não apta; "Não testado"/vazio → não altera.
    if (camposTipo.funcionamento) {
      const apto = funcionamentoParaApto(campo(peca, camposTipo.funcionamento))
      if (apto !== undefined) entry.aptoDisparo = apto
    }
    // "Tambor" do GDL ("reversível para a esquerda/direita") → Rebatimento do tambor
    // no app ("Esquerda"/"Direita"). Só existe em revólver.
    if (camposTipo.tambor) {
      const reb = normalizarTamborGdl(campo(peca, camposTipo.tambor))
      if (reb) entry.rebatimentoTambor = reb
    }
    // "Estado Geral da Arma" do GDL (Bom/Regular/Ruim) → estado de conservação no app.
    if (camposTipo.estadoGeral) {
      const eg = campo(peca, camposTipo.estadoGeral).trim()
      if (eg === 'Bom' || eg === 'Regular' || eg === 'Ruim') entry.estadoGeralArma = eg
    }
    // "ORIGEM/COLETA" do GDL → Origem de coleta (DELEGACIA/LOCAL/NECROPSIA/HOSPITAL/OUTRO).
    if (camposTipo.origemColeta) {
      const orig = normalizarOrigemGdl(campo(peca, camposTipo.origemColeta))
      if (orig) entry.origemProjetil = orig
    }
    // "Resultado PSA" do GDL (tipo OUTRO) → resultadoPSA (NEGATIVO/POSITIVO/POSITIVO FRACO).
    if (camposTipo.resultadoPSA) {
      const psa = normalizarResultadoPsaGdl(campo(peca, camposTipo.resultadoPSA))
      if (psa) entry.resultadoPSA = psa
    }
    // "Código do Vestígio" do GDL → codigoVestigio (texto livre).
    const codVestigio = campo(peca, '$txtTraceCodeParts')
    if (codVestigio) entry.codigoVestigio = codVestigio
    // "Institucional?" (CheckBoxList do GDL) → vínculo da arma.
    // SIM → Institucional (true); NÃO → Particular (false); Indeterminado → não define.
    if (camposTipo.institucionalSim || camposTipo.institucionalNao) {
      const inst = institucionalGdl(
        camposTipo.institucionalSim ? campo(peca, camposTipo.institucionalSim) : '',
        camposTipo.institucionalNao ? campo(peca, camposTipo.institucionalNao) : '',
      )
      if (inst !== null) entry.institucional = inst
    }

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

    // Arma de fogo: o número de série no app só aparece após escolher
    // tipoProd = INDUSTRIAL e o estado do serial. No GDL, ter "Status do Número de
    // Série" preenchido (ou um número) indica arma industrial (numeração de fábrica).
    // Então: status do GDL OU número presente ⇒ INDUSTRIAL; o estado vem do status
    // do GDL (LEGÍVEL/PARCIAL/SUPRIMIDO/NÃO APARENTE); se não veio status mas há
    // número, assume LEGÍVEL para o campo do número aparecer.
    const ARMAS_FOGO: typeof tipo[] = ['REVÓLVER','PISTOLA','ESPINGARDA','CARABINA','FUZIL','METRALHADORA','ARMA DE PRESSÃO','ARMA DE ANTECARGA']
    if (ARMAS_FOGO.includes(tipo)) {
      if (serialEstadoApp || entry.serial) entry.tipoProd = 'INDUSTRIAL'
      if (serialEstadoApp)      entry.serialEstado = serialEstadoApp
      else if (entry.serial)    entry.serialEstado = 'LEGÍVEL'
      // Número com "?" (dígitos ilegíveis, ex.: "GC13??4" ou "????") → leitura PARCIAL.
      // O "?" no número é sinal mais forte que o status; só rebaixa de LEGÍVEL,
      // não mexe em SUPRIMIDO / NÃO APARENTE (que não têm número lido).
      if (entry.serial && entry.serial.includes('?') &&
          (entry.serialEstado === 'LEGÍVEL' || !entry.serialEstado)) {
        entry.serialEstado = 'PARCIAL'
      }
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
    // Descrição da peça: no GDL vem em "Quant. Descrição" (txtQtdeDescColorParts) e/ou
    // "Observação" (txtObservation), normalmente com o mesmo texto. Mescla sem duplicar.
    entry.observacaoPeca    = mesclarDescricaoGdl(
      campo(peca, '$txtQtdeDescColorParts'),
      campo(peca, '$txtObservation'),
    )

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
