export type RepStatus = "importada" | "editando" | "sincronizada" | "no_gdl"

export type WeaponType =
  | "REVÓLVER"
  | "PISTOLA"
  | "PISTOLETE"
  | "GARRUCHA"
  | "ESPINGARDA"
  | "CARABINA"
  | "FUZIL"
  | "METRALHADORA"
  | "SUBMETRALHADORA"
  | "ARMA DE CHOQUE"
  | "ESTOJO"
  | "PROJÉTIL"
  | "CARTUCHO"
  | "FACA"
  | "ARMA DE PRESSÃO"
  | "ARMA DE ANTECARGA"
  | "PÓLVORA"
  | "ESPOLETA"
  | "CARREGADOR"
  | "OUTRO"

export type WeaponEntry = {
  type: WeaponType
  // 1. Identificação
  identificacao: string
  brand: string
  model: string
  caliber: string
  serial: string
  paisFabricacao: string
  origemMunicao: string
  // 2. Características físicas
  material: string
  acabamento: string
  compCano: string
  numCamaras: string
  rebatimentoTambor: string
  tamborSobressalente: string
  tamborSobressalenteQtd: string
  canoSobressalente: string
  canoSobressalenteQtd: string
  canoSobressalenteComp: string
  canoSobressalenteMaterial: string
  canoSobressalenteAcabamento: string
  tipoMira: string[]
  tipoCarregador: string[]
  // 3. Mecanismo de funcionamento
  acaoSimples: boolean
  acaoDupla: boolean
  tamborGira: boolean
  indexacaoCorreta: boolean
  caoFuncional: boolean
  gatilhoFuncional: boolean
  seguranca: boolean
  basculaFunc: boolean          // Garrucha/break-action: báscula abre e trava
  // Arma de choque (dispositivo elétrico)
  bateriaPresente: boolean
  indicadorCargaFunc: boolean
  lanternaFunc: boolean
  eletrodosIntegros: boolean
  arcoEletricoVisivel: boolean
  emiteSomEstalo: boolean
  intensidadeCompativel: boolean
  // 4. Estado de conservação
  ferrugem: boolean
  ferrugemObs: string
  desgaste: boolean
  desgasteObs: string
  danoEstruturais: boolean
  danoEstruturaisObs: string
  pecasFaltantes: boolean
  pecasFaltantesObs: string
  estadoGeralArma: string       // GDL "Estado Geral da Arma": Bom / Regular / Ruim
  // 5. Exame de disparo (revólver)
  aptoDisparo: boolean
  funcMunicaoReal: boolean
  testePercussao: boolean
  marcacaoPercussor: boolean
  tipoMunicaoDisparo: string
  qtdMunicaoDisparo: string
  // Carabina — Funcionamento
  sistemaRepeticao: boolean
  // Pistola — Funcionamento
  carregadorPresente: boolean
  carregadorFuncional: boolean
  ferrolhoFuncional: boolean
  percussorFuncional: boolean
  extratorFuncional: boolean
  ejetorFuncional: boolean
  retencaoFerrolho: boolean
  alimentacaoFuncional: boolean
  // Pistola — Estado de conservação
  desgasteMecanico: boolean
  desgasteMecanicoObs: string
  danosAparentes: boolean
  danosAparentesObs: string
  // Pistola — Teste de disparo
  extracaoFuncional: boolean
  ejacaoFuncional: boolean
  ciclagemFuncional: boolean
  // Físicas gerais (multi-tipo)
  compTotal: string
  capacidadeCarregador: string
  numCanos: string
  // Armas de fogo
  sistemaAcionamento: string
  tamanhoCamara: string
  disposicaoCanos: string       // Espingarda: Cano único / Justaposto (lado a lado) / Sobreposto
  tipoRaiamento: string
  materialQuadro: string
  materialCoroha: string
  materialTambor: string        // Revólver: material e acabamento do tambor (cilindro)
  // ── Classificação técnica: os 6 eixos do diagrama de arma de fogo ──
  // Eixos ORTOGONAIS: toda arma de fogo tem um valor em cada um, simultaneamente.
  // Não substituem `sistemaAcionamento` nem o WeaponType — convivem com eles.
  // Preenchidos automaticamente por derivarEixos() (src/lib/eixos.ts); o perito
  // pode sobrescrever. Vocabulário e regras: ver aquele arquivo.
  //
  // POR QUE SÃO CAMPOS GRAVADOS e não derivados na leitura, mesmo os que
  // parecem redundantes (almaCano sai de tipoRaiamento):
  //  1. Um laudo é registro pericial de um momento. Se derivássemos na leitura,
  //     mudar uma regra de classificação amanhã reescreveria a conclusão de
  //     laudos já assinados. Inaceitável — o que foi concluído fica.
  //  2. Metade das derivações depende de campos da FICHA do catálogo
  //     (tipo_descritivo, sistema_percussao, carregador_tipo) que não existem
  //     em WeaponEntry. Fora do momento do preenchimento, não há como recalcular.
  almaCano: string             // eixo 1  Lisa | Raiada | Híbrida/Combinada
  sistemaCarregamento: string  // eixo 2  Antecarga | Retrocarga
  sistemaFuncionamento: string // eixo 3  Tiro unitário | Repetição manual | Semi-automática | Automática
  percussaoLocalizacao: string // eixo 5a Intrínseca | Extrínseca
  // NÃO confundir com `tipoEspoleta` (mais abaixo), que descreve uma ESPOLETA
  // examinada como peça própria — Boxer/Berdan/Rimfire/elétrica. Este aqui diz
  // que munição a ARMA dispara. Sujeitos diferentes: uma peça ESPOLETA não tem
  // alma de cano, um revólver não tem espoleta-como-item. Daí o prefixo.
  percussaoTipoEspoleta: string // eixo 5a Central (centerfire) | Anular/radial (rimfire)
  percussaoTransmissao: string // eixo 5b Direta | Indireta
  percussaoMecanismo: string   // eixo 5c Cão | Percussor lançado
  alimentacaoTipo: string      // eixo 6  Depósito fixo | Carregador removível
  // FUZIL / METRALHADORA
  modoFogo: string
  seletoDisparo: boolean
  modoSemiAuto: boolean
  modoAutoFuncional: boolean
  culatelFuncional: boolean
  // ESTOJO / PROJÉTIL
  formato: string
  numEstrias: string
  sentidoEstrias: string
  // Alma híbrida/combinada: sentido das raias de CADA cano (índice = cano).
  // Só usado quando tipoRaiamento é "Híbrida/Combinada".
  sentidosPorCano: string[]
  diametro: string
  marcacaoExtrator: boolean
  marcacaoEjetor: boolean
  marcacaoCamara: boolean
  estriasPresentes: boolean
  deformacaoPresente: boolean
  fragmentado: boolean
  oxidacaoPresente: boolean
  inscricaoFabricante: string
  lote: string
  // CARTUCHO
  amassado: boolean
  completo: boolean
  tipoConstrutivo: string
  // FACA
  tipoLamina: string
  compLamina: string
  tipoGume: string
  gumeFuncional: boolean
  aptaUso: boolean
  laminaIntegra: boolean
  caboDanificado: boolean
  manchas: boolean
  manchasObs: string
  institucional: boolean | null
  // Quando institucional: número de inscrição da arma no órgão + instituição.
  inscricaoInstitucional: string
  instituicao: string
  naFlags: string[]
  tipoProd: string
  serialEstado: string
  // Nº de série SUPRIMIDO: houve tentativa de revelação? + resultado + anotação.
  serialTentativaRevelacao: boolean | null
  serialRevelacao: string
  serialReveladoObs: string
  quantidade: string
  diametroMin: string
  massa: string
  origemProjetil: string
  origemProjetilRef: string
  regiaoColeta: string
  deformacoesAcidentais: string
  estadoProjetil: string
  estadoCartucho: string
  estadoEstojo: string
  alturaProjetil: string
  // PÓLVORA
  tipoPolvora: string
  cor: string
  // ESPOLETA
  tipoEspoleta: string
  // ARMA DE PRESSÃO
  adaptadaArmaFogo: boolean | null
  // OUTRO (peça genérica — parâmetros do GDL "OUTROS")
  medida: string                // GDL Medida: UNIDADES/GRAMAS/ML/KG/PORÇÃO/AMOSTRA/HECTARE/m2
  quantDescricao: string        // GDL "Quant. Descrição"
  examinadoInLoco: boolean      // GDL "Examinado In Loco"
  codigoVestigio: string        // GDL "Código do Vestígio"
  resultadoPSA: string          // GDL "Resultado PSA": NEGATIVO/POSITIVO/POSITIVO FRACO
  // GDL — identificação da peça
  idPeca: string
  gdlPartsId: string
  // GDL — Guia de Remessa (por peça)
  lacreEntradaPeca: string
  lacreSaidaPeca: string
  dataEntradaPeca: string
  dataLiberacaoPeca: string
  unidadeMedida: string
  consumidaExame: string
  observacaoPeca: string
  // Coleta de Padrão
  coletaNumero: string
  coletaRepAno: string
  coletaMunicaoTipo: string
  coletaMunicaoCalibre: string   // calibre da munição utilizada na coleta (ex.: .38 SPL)
  coletaQtdProjeteis: string
  coletaQtdEstojos: string
  coletaTipoProjetil: string
  coletaMaterialProjetil: string
  coletaTipoEstojo: string
  coletaMaterialEstojo: string
  // Coleta de padrão: listas (permitem mais de um projétil / estojo).
  coletaProjeteis: { tipo: string; calibre: string; quantidade: string; identificacao: string; descricao: string; dataEntrada: string; lacreSaida: string }[]
  coletaEstojos: { quantidade: string; material: string; calibre: string; fabricante: string; identificacao: string; descricao: string; dataEntrada: string; lacreSaida: string }[]
  // Munições da coleta: lista única — cada item é projétil ou estojo (kind).
  coletaMunicoes: { kind: string; tipo: string; material: string; calibre: string; fabricante: string; quantidade: string; identificacao: string; descricao: string; dataEntrada: string; dataLiberacao: string; lacreEntrada: string; lacreSaida: string }[]
  coletaLacreSaida: string
  coletaSalva: boolean
  // Destinação
  destinacao: "LIBERADO" | "CONSUMIDO" | ""
  // Acessórios e Embalagem
  tipoAcessorio: string[]
  lacreEntradaAcessorio: string
  lacreEntradaMesmoDaPeca: boolean
  lacreSaidaAcessorio: string
  lacreSaidaMesmoDaPeca: boolean
  origemAcessorio: string
  materialAcessorio: Record<string, string>
  descricaoAcessorio: string
  // Rascunho de capacidade do carregador do acessório (independente da capacidade
  // da peça em capacidadeCarregador, que é usada nas Características / tipo CARREGADOR).
  capacidadeAcessorio: string
  // Lista de acessórios salvos (cada um independente). Os campos acima funcionam
  // como rascunho do acessório em edição; ao salvar, viram um item desta lista.
  acessorios: AcessorioEntry[]
}

export type AcessorioEntry = {
  id: string
  tipoAcessorio: string[]
  tipoMira: string[]
  tipoCarregador: string[]
  capacidade: string
  origemAcessorio: string
  materialAcessorio: Record<string, string>
  descricaoAcessorio: string
  lacreEntradaAcessorio: string
  lacreEntradaMesmoDaPeca: boolean
  lacreSaidaAcessorio: string
  lacreSaidaMesmoDaPeca: boolean
}

export type RecordItem = {
  id: string
  number: string
  year: string
  type: WeaponType
  model: string
  updatedAt: string
  unit: string
  expert: string
  repStatus?: RepStatus
  naturezaExame?: string
}

export type ExamType = "EFICIÊNCIA" | "CONSTATAÇÃO"

export type ExamForm = {
  examNumber: string
  examYear: string
  caseNumber: string
  unit: string
  expert: string
  date: string
  observacoes: string
  // Capa do Laudo (GDL)
  solicitante: string
  remetenteCidade: string
  remetenteOrgao: string
  naturezaExame: string
  naturezaOcorrencia: string
  dataEntrada: string
  horaEntrada: string
  enderecoExame: string
  oficio: string
  ipApfd: string
  processo: string
  // Documentos vinculados manualmente (JSON: {tipo, numero, ano}[])
  documentos: string
}

export type ProfileView = null | "main"
