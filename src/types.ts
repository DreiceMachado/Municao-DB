export type WeaponType =
  | "REVÓLVER"
  | "PISTOLA"
  | "ESPINGARDA"
  | "CARABINA"
  | "FUZIL"
  | "METRALHADORA"
  | "ESTOJO"
  | "PROJÉTIL"
  | "CARTUCHO"
  | "FACA"
  | "ARMA DE PRESSÃO"
  | "ARMA DE ANTECARGA"
  | "PÓLVORA"
  | "ESPOLETA"
  | "CARREGADOR"

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
  // 4. Estado de conservação
  ferrugem: boolean
  ferrugemObs: string
  desgaste: boolean
  desgasteObs: string
  danoEstruturais: boolean
  danoEstruturaisObs: string
  pecasFaltantes: boolean
  pecasFaltantesObs: string
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
  tipoRaiamento: string
  materialQuadro: string
  materialCoroha: string
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
  diametro: string
  marcacaoExtrator: boolean
  marcacaoEjetor: boolean
  marcacaoCamara: boolean
  estriasPresentes: boolean
  deformacaoPresente: boolean
  fragmentado: boolean
  oxidacaoPresente: boolean
  inscricaoFabricante: string
  // CARTUCHO
  amassado: boolean
  completo: boolean
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
  naFlags: string[]
  tipoProd: string
  serialEstado: string
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
  // Coleta de Padrão
  coletaNumero: string
  coletaRepAno: string
  coletaMunicaoTipo: string
  coletaQtdProjeteis: string
  coletaQtdEstojos: string
  coletaTipoProjetil: string
  coletaMaterialProjetil: string
  coletaTipoEstojo: string
  coletaMaterialEstojo: string
  coletaLacreSaida: string
  coletaSalva: boolean
  // Acessórios e Embalagem
  tipoAcessorio: string[]
  lacreEntradaAcessorio: string
  lacreSaidaAcessorio: string
  origemAcessorio: string
  materialAcessorio: Record<string, string>
  descricaoAcessorio: string
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
}

export type ExamType = "EFICIÊNCIA" | "CONSTATAÇÃO"

export type ExamForm = {
  examNumber: string
  examYear: string
  unit: string
  expert: string
  date: string
  observacoes: string
}

export type ProfileView = null | "main" | "changeEmail" | "changePassword"
