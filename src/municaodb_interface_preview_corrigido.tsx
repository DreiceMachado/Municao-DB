import React, { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import logoEscudo from "./assets/logo-escudo.png"
import {
  AlertCircle,
  BookOpen,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Crosshair,
  Database,
  Download,
  Link2,
  Loader2,
  MapPin,
  Menu,
  Microscope,
  ChevronUp,
  Package,
  Pencil,
  Plus,
  Search,
  User2,
  RefreshCw,
  Wifi,
  Wand2,
  X,
} from "lucide-react"

import type { WeaponEntry, WeaponType, ProfileView, RepStatus } from "./types"
import { supabase, supabaseAtivo } from "./lib/supabase"
import { makeWeaponEntry } from "./data/constants"
import { useLaudoDb } from "./hooks/useLaudoDb"
import { db, buscarLaudoCompleto, atualizarRepStatus, limparRepsLocais } from "./lib/db"
import { generateId } from "./lib/uuid"
import { BottomTabBar, type Section } from "./components/BottomTabBar"
import { cn } from "./utils/cn"
import { CollapsibleSection } from "./components/ui/CollapsibleSection"
import { CollapsibleCard } from "./components/ui/CollapsibleCard"
import { PieceIcon } from "./components/ui/PieceIcon"
import { TopTab } from "./components/ui/TopTab"
import { PhotoSlot } from "./components/PhotoSlot"
import { LacreInput } from "./components/LacreInput"
import { SidebarContent } from "./components/SidebarContent"
import { ProfilePanel } from "./components/ProfilePanel"
import { LaudoDetailPanel } from "./components/LaudoDetailPanel"
import { ConfirmDialogs } from "./components/ConfirmDialogs"
import { PhotosScreen } from "./components/PhotosScreen"
import { WeaponFormProvider } from "./context/WeaponFormContext"
import { AllPickers } from "./components/AllPickers"
import { mapearRepGdl, type RepGdlData } from "./lib/repMapper"
import { useWeaponCatalog, useCatalogoBrands, useCatalogoModels } from "./hooks/useWeaponCatalog"
import { populateCatalogDb } from "./lib/catalogDb"
import { useLiveQuery } from "dexie-react-hooks"

const _ARMAS_FOGO_GDL: WeaponType[] = ["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","ARMA DE ANTECARGA"]
const _MODEL_IDENT_GDL: WeaponType[] = ["CARREGADOR","ESTOJO","CARTUCHO","ARMA DE CHOQUE"]
const _VINCULO_GDL: WeaponType[] = ["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","ARMA DE PRESSÃO","ARMA DE ANTECARGA"]

function validarCamposGdlPeca(peca: WeaponEntry): string[] {
  const faltando: string[] = []
  if (!peca.dataEntradaPeca) faltando.push("Data de Entrada")
  if (!peca.lacreEntradaPeca) faltando.push("Lacre de Entrada")
  if (_ARMAS_FOGO_GDL.includes(peca.type) && !peca.identificacao) faltando.push("Identificação")
  if (_MODEL_IDENT_GDL.includes(peca.type) && !peca.model) faltando.push("Identificação")
  if (_VINCULO_GDL.includes(peca.type) && peca.institucional === null) faltando.push("Vínculo da arma")
  return faltando
}

export default function BalísticaDBInterfacePreview({ onLogout }: { onLogout: () => void }) {
  const { laudoLocalId, setLaudoLocalId, laudos: laudosDB, salvarForm, finalizarLaudo, salvarPecas, salvarFotoNoBanco, removerFotoNoBanco, recarregarLista } = useLaudoDb()
  const [salvouExame, setSalvouExame] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>("exames")
  const [nomePerito, setNomePerito] = useState("Perito responsável")

  // Busca nome do perito logado para preencher o campo expert automaticamente
  useEffect(() => {
    async function carregarNome() {
      if (supabaseAtivo && supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        const nome = user?.user_metadata?.nome as string | undefined
        if (nome?.trim()) {
          setNomePerito(nome.trim())
          setForm(f => ({ ...f, expert: nome.trim() }))
          return
        }
      }
      // Fallback: tenta localStorage (salvo no cadastro offline)
      const salvo = localStorage.getItem("balisticadb_nome_perito")
      if (salvo) {
        setNomePerito(salvo)
        setForm(f => ({ ...f, expert: salvo }))
      }
    }
    carregarNome()
  }, [])

  // Popula o banco de dados local do catálogo na inicialização do app
  useEffect(() => {
    populateCatalogDb()
  }, [])

  const [menuOpen, setMenuOpen] = useState(false)
  const [weaponType, setWeaponType] = useState<WeaponType | null>(null)
  const [showGroupFirearms, setShowGroupFirearms] = useState(false)
  const [showGroupAmmo, setShowGroupAmmo] = useState(false)
  const [showGroupOthers, setShowGroupOthers] = useState(false)
  const [numberFilter, setNumberFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("2026")
  const [unitFilter, setUnitFilter] = useState("")

  const emptyForm = {
    examNumber: "",
    examYear: String(new Date().getFullYear()),
    caseNumber: "",
    unit: "Núcleo de Polícia Científica",
    expert: "Perito responsável",
    date: new Date().toLocaleDateString("pt-BR"),
    observacoes: "",
    // Capa do Laudo
    solicitante: "",
    remetenteCidade: "",
    remetenteOrgao: "",
    naturezaExame: "",
    naturezaOcorrencia: "",
    dataEntrada: "",
    horaEntrada: "",
    enderecoExame: "",
    oficio: "",
    ipApfd: "",
    processo: "",
  }
  const [form, setForm] = useState(emptyForm)

  const [weapons, setWeapons] = useState<WeaponEntry[]>([])
  const [activeWeaponIdx, setActiveWeaponIdx] = useState(0)
  const [savedPieces, setSavedPieces] = useState<WeaponEntry[]>([])
  const [editingPieceIdx, setEditingPieceIdx] = useState<number | null>(null)
  const [confirmDeletePieceIdx, setConfirmDeletePieceIdx] = useState<number | null>(null)
  const [gdlResultado, setGdlResultado] = useState<{ ok: boolean; msg: string } | null>(null)
  const [atualizandoPecas, setAtualizandoPecas] = useState(false)
  const [enviandoLote, setEnviandoLote] = useState(false)
  const [resultadoLote, setResultadoLote] = useState<{ ok: boolean; msg: string } | null>(null)
  const [importandoReps, setImportandoReps] = useState(false)
  const [resultadoImportacao, setResultadoImportacao] = useState<{ ok: boolean; msg: string } | null>(null)
  const [importarFiltro, setImportarFiltro] = useState<"todas" | "pendentes" | "concluidas">("todas")
  const [confirmandoLimpar, setConfirmandoLimpar] = useState(false)
  const [atualizandoPecasProgresso, setAtualizandoPecasProgresso] = useState<{ fase: string; atual: number; total: number }>({ fase: '', atual: 0, total: 0 })
  const [pieceFormOpen, setPieceFormOpen] = useState(false)
  const [typePickerOpen, setTypePickerOpen] = useState(false)
  const [changePieceTypeOpen, setChangePieceTypeOpen] = useState(false)
  const [infoGeraisOpen, setInfoGeraisOpen] = useState(false)
  const [examType, setExamType] = useState<"EFICIÊNCIA" | "CONSTATAÇÃO" | null>(null)
  const [repMinimized, setRepMinimized] = useState(false)
  const [repGdlCarregando, setRepGdlCarregando] = useState(false)
  const [repGdlErro, setRepGdlErro] = useState<string | null>(null)
  const [gdlFotos, setGdlFotos] = useState<string[]>([])
  const [confirmDeleteRep, setConfirmDeleteRep] = useState(false)
  const [confirmDeleteMira, setConfirmDeleteMira] = useState(false)
  const [confirmDeleteCarregador, setConfirmDeleteCarregador] = useState(false)
  const [photosOpen, setPhotosOpen] = useState(false)
  const [lacreNumero, setLacreNumero] = useState("")
  const [lacreSaidaNumero, setLacreSaidaNumero] = useState("")
  const [photoUrls, setPhotoUrls] = useState<Map<string, string>>(new Map())
  const [photoSyncMap, setPhotoSyncMap] = useState<Record<number, number>>({})
  const [viewerPhoto, setViewerPhoto] = useState<string | null>(null)
  const [materialPickerOpen, setMaterialPickerOpen] = useState(false)
  const [formatoPickerOpen, setFormatoPickerOpen] = useState(false)
  const [sentidoPickerOpen, setSentidoPickerOpen] = useState(false)
  const [deformacoesPickerOpen, setDeformacoesPickerOpen] = useState(false)
  const [miraPickerOpen, setMiraPickerOpen] = useState(false)
  const [carregadorPickerOpen, setCarregadorPickerOpen] = useState(false)
  const [tipoLaminaPickerOpen, setTipoLaminaPickerOpen] = useState(false)
  const [tipoGumePickerOpen, setTipoGumePickerOpen] = useState(false)
  const [acabamentoPickerOpen, setAcabamentoPickerOpen] = useState(false)
  const [sistemaAcionamentoPickerOpen, setSistemaAcionamentoPickerOpen] = useState(false)
  const [calibreArmaPressaoPickerOpen, setCalibreArmaPressaoPickerOpen] = useState(false)
  const [calibreAntecargaPickerOpen, setCalibreAntecargaPickerOpen] = useState(false)
  const [tamborPickerOpen, setTamborPickerOpen] = useState(false)
  const [canoSobresPickerOpen, setCanoSobresPickerOpen] = useState(false)
  const [calibrePickerOpen, setCalibrePickerOpen] = useState(false)
  // calibreCustomInput is now managed locally inside AllPickers
  const [paisPickerOpen, setPaisPickerOpen] = useState(false)
  const [tipoRaiamentoPickerOpen, setTipoRaiamentoPickerOpen] = useState(false)
  const [materialCoronhaPickerOpen, setMaterialCoronhaPickerOpen] = useState(false)
  const [materialQuadroPickerOpen, setMaterialQuadroPickerOpen] = useState(false)
  const [tipoPolvoraPickerOpen, setTipoPolvoraPickerOpen] = useState(false)
  const [tipoEspoletaPickerOpen, setTipoEspoletaPickerOpen] = useState(false)
  const [acessorioPickerOpen, setAcessorioPickerOpen] = useState(false)
  const [origemAcessorioPickerOpen, setOrigemAcessorioPickerOpen] = useState(false)
  const [materialAcessorioPickerOpen, setMaterialAcessorioPickerOpen] = useState(false)
  const [materialAcessorioItem, setMaterialAcessorioItem] = useState<string | null>(null)
  const [acessoriosEditando, setAcessoriosEditando] = useState(false)
  const [tipoMunicaoPickerOpen, setTipoMunicaoPickerOpen] = useState(false)
  const [qtdMunicaoPickerOpen, setQtdMunicaoPickerOpen] = useState(false)
  const [tipoMunicaoCustom, setTipoMunicaoCustom] = useState("")
  const [confirmDeleteAcessorios, setConfirmDeleteAcessorios] = useState(false)

  // ── Catálogo de armas ────────────────────────────────────────────────────
  const [catalogoMarcaPickerOpen, setCatalogoMarcaPickerOpen] = useState(false)
  const [catalogoModeloPickerOpen, setCatalogoModeloPickerOpen] = useState(false)
  const [catalogoMarcaSel, setCatalogoMarcaSel] = useState("")
  const [catalogoModeloSel, setCatalogoModeloSel] = useState("")
  const { buscarFicha, fichaParaWeaponEntry, loadingFicha } = useWeaponCatalog()
  const catalogoMarcas = useLiveQuery(() => useCatalogoBrands(weaponType ?? undefined), [weaponType]) ?? []
  const _catalogoBrand = weapons[activeWeaponIdx]?.brand
  const catalogoModelos = useLiveQuery(() => useCatalogoModels(weaponType ?? undefined, _catalogoBrand), [weaponType, _catalogoBrand]) ?? []
  const TIPOS_COM_CATALOGO: WeaponType[] = ["PISTOLA","PISTOLETE","REVÓLVER","GARRUCHA","ESPINGARDA","FUZIL","CARABINA","SUBMETRALHADORA"]
  const [coletaActivePieceIdx, setColetaActivePieceIdx] = useState<number | null>(null)
  const [coletaPhotoUrls, setColetaPhotoUrls] = useState<Map<string, string>>(new Map())
  const [coletaQtdProjeteisPicker, setColetaQtdProjeteisPicker] = useState(false)
  const [coletaQtdEstojosPicker, setColetaQtdEstojosPicker] = useState(false)
  const [coletaTipoProjetilPicker, setColetaTipoProjetilPicker] = useState(false)
  const [coletaMaterialProjetilPicker, setColetaMaterialProjetilPicker] = useState(false)
  const [coletaTipoEstojoPicker, setColetaTipoEstojoPicker] = useState(false)
  const [coletaMaterialEstojoPicker, setColetaMaterialEstojoPicker] = useState(false)

  const handleColetaPhotoCapture = (key: string, file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const url = e.target?.result as string
      setColetaPhotoUrls(prev => { const n = new Map(prev); n.set(key, url); return n })
    }
    reader.readAsDataURL(file)
  }
  const handleColetaPhotoRemove = (key: string) =>
    setColetaPhotoUrls(prev => { const n = new Map(prev); n.delete(key); return n })

  const updateColeta = (idx: number, field: keyof WeaponEntry, value: string | boolean) =>
    setSavedPieces(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))

  useEffect(() => { setAcessoriosEditando(false) }, [activeWeaponIdx])

  // Auto-salva só quando o número do exame estiver preenchido
  useEffect(() => {
    if (form.examNumber.trim()) {
      salvarForm(form)
    }
  }, [form])
  const [fieldHelper, setFieldHelper] = useState<{ title: string; text: string } | null>(null)
  const HelpBtn = ({ title, text }: { title: string; text: string }) => (
    <span
      role="button"
      tabIndex={0}
      onClick={e => { e.stopPropagation(); setFieldHelper({ title, text }) }}
      onKeyDown={e => e.key === "Enter" && setFieldHelper({ title, text })}
      className="ml-1.5 inline-flex h-[18px] w-[18px] shrink-0 cursor-pointer select-none items-center justify-center rounded-full border border-[#c8a96e] bg-[#fdf6e8] text-[10px] font-black text-[#9e7f45] transition active:bg-[#f0d08a]"
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
    >?</span>
  )

  const [profileView, setProfileView] = useState<ProfileView>(null)
  const [selectedLaudoId, setSelectedLaudoId] = useState<string | null>(null)
  // Profile email/password states are now local to ProfilePanel component

  const handleImportarGdl = async () => {
    const numLimpo = form.examNumber.trim().replace(/[^0-9]/g, '')
    if (!numLimpo) { setRepGdlErro('Digite o número da REP antes de buscar'); return }
    setRepGdlCarregando(true)
    setRepGdlErro(null)
    try {
      const res = await fetch('/api/rep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: `${numLimpo}/${form.examYear}` }),
      })
      const dados: RepGdlData & { erro?: string } = await res.json()
      if (!res.ok) {
        const detalhe = (dados as any).detalhe
        setRepGdlErro(detalhe ? `${dados.erro}: ${detalhe}` : (dados.erro ?? 'Erro desconhecido'))
        return
      }
      const { form: f, pecas: p, lacres } = mapearRepGdl(dados)
      setForm(prev => ({
        ...prev,
        caseNumber:         prev.caseNumber         || f.caseNumber,
        date:               prev.date               || f.date,
        observacoes:        prev.observacoes        || f.observacoes,
        solicitante:        prev.solicitante        || f.solicitante,
        remetenteCidade:    prev.remetenteCidade    || f.remetenteCidade,
        remetenteOrgao:     prev.remetenteOrgao     || f.remetenteOrgao,
        naturezaExame:      prev.naturezaExame      || f.naturezaExame,
        naturezaOcorrencia: prev.naturezaOcorrencia || f.naturezaOcorrencia,
        dataEntrada:        prev.dataEntrada        || f.dataEntrada,
        horaEntrada:        prev.horaEntrada        || f.horaEntrada,
        enderecoExame:      prev.enderecoExame      || f.enderecoExame,
        oficio:             prev.oficio             || f.oficio,
        ipApfd:             prev.ipApfd             || f.ipApfd,
        processo:           prev.processo           || f.processo,
      }))
      if (p.length > 0) {
        setSavedPieces(prev => {
          if (prev.length === 0) return p
          // Mescla peças do GDL com peças existentes do BalísticaDB
          const merged = p.map((gdlPeca, i) => {
            // Tenta encontrar pelo gdlPartsId, senão usa posição
            const existente = (gdlPeca.gdlPartsId
              ? prev.find(e => e.gdlPartsId === gdlPeca.gdlPartsId)
              : undefined) ?? prev[i]
            if (!existente) return gdlPeca
            // Dados do BalísticaDB têm prioridade; GDL preenche apenas campos vazios
            return {
              ...gdlPeca,
              ...existente,
              // IDs do GDL são sempre autoritativos
              gdlPartsId: gdlPeca.gdlPartsId || existente.gdlPartsId,
              idPeca:     gdlPeca.idPeca     || existente.idPeca,
            }
          })
          // Mantém peças que o usuário adicionou que não existem no GDL
          const gdlIds = new Set(p.map(g => g.gdlPartsId).filter(Boolean))
          const soNoBD = prev.filter(e => !e.gdlPartsId || !gdlIds.has(e.gdlPartsId))
          return [...merged, ...soNoBD]
        })
      }
      const fotos = dados.arquivos?.filter(a => a.base64).map(a => a.base64!) ?? []
      if (fotos.length > 0) setGdlFotos(fotos)
      if (lacres[0]) {
        setLacreNumero(lacres[0].entrada)
        setLacreSaidaNumero(lacres[0].saida)
      }
      // Marca a REP como "importada" no pipeline de estágios
      await atualizarRepStatus(laudoLocalId, "importada")
      recarregarLista()
    } catch {
      setRepGdlErro('Falha ao conectar com o servidor')
    } finally {
      setRepGdlCarregando(false)
    }
  }

  const handlePhotoCapture = (key: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      setPhotoUrls(prev => {
        const next = new Map(prev)
        next.set(key, url)
        return next
      })
      salvarFotoNoBanco(key, url)
    }
    reader.readAsDataURL(file)
  }
  const handlePhotoRemove = (key: string) => {
    setPhotoUrls(prev => { const n = new Map(prev); n.delete(key); return n })
    removerFotoNoBanco(key)
  }

  const activeWeapon = weapons[activeWeaponIdx] ?? null

  // Índice único da peça sendo editada (para chaves de foto por peça)
  const currentPhotoIdx = editingPieceIdx ?? savedPieces.length
  const getEffectivePhotoIdx = (idx: number) => photoSyncMap[idx] ?? idx
  const effectivePhotoIdx = getEffectivePhotoIdx(currentPhotoIdx)

  const handleSyncPhoto = (pieceIdx: number, masterIdx: number) =>
    setPhotoSyncMap(prev => ({ ...prev, [pieceIdx]: masterIdx }))
  const handleUnsyncPhoto = (pieceIdx: number) =>
    setPhotoSyncMap(prev => { const n = { ...prev }; delete n[pieceIdx]; return n })

  // ── Pipeline de estágios — helpers ──────────────────────────────────────────

  const REP_STATUS_LABEL: Record<RepStatus, string> = {
    importada:    "Importada",
    editando:     "Em Edição",
    sincronizada: "Pronta",
    no_gdl:       "No GDL",
  }

  const REP_STATUS_BADGE: Record<RepStatus, string> = {
    importada:    "bg-[#3d5a8a]/15 text-[#4e7ab5] border border-[#4e7ab5]/30",
    editando:     "bg-[#8a6d2e]/15 text-[#b89240] border border-[#b89240]/30",
    sincronizada: "bg-[#2e6b3e]/15 text-[#3d9b55] border border-[#3d9b55]/30",
    no_gdl:       "bg-[#12213d]/15 text-[#8ea4c0] border border-[#8ea4c0]/30",
  }

  // ── Envia todas as REPs "sincronizadas" para o GDL em lote ─────────────────

  const handleEnviarTodasAoGdl = async () => {
    const sincronizadas = laudosDB.filter(l => l.repStatus === "sincronizada")
    if (sincronizadas.length === 0) return
    setEnviandoLote(true)
    setResultadoLote(null)
    let ok = 0
    let erros = 0
    try {
      for (const item of sincronizadas) {
        const completo = await buscarLaudoCompleto(item.id)
        if (!completo) { erros++; continue }
        const pecas = completo.armas.map(a => JSON.parse(a.dadosJson) as WeaponEntry)
        const numLimpo = (completo.laudo.examNumber || '').replace(/[^0-9]/g, '')
        if (!numLimpo) { erros++; continue }
        const repNumero = `${numLimpo}/${completo.laudo.examYear}`
        try {
          const resp = await fetch('/api/gdl/atualizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rep_numero: repNumero, pecas }),
          })
          if (resp.ok) {
            await atualizarRepStatus(item.id, "no_gdl")
            ok++
          } else {
            erros++
          }
        } catch {
          erros++
        }
      }
      await recarregarLista()
      const msg = ok > 0
        ? `${ok} REP(s) enviada(s) ao GDL${erros > 0 ? ` · ${erros} com erro` : ''}`
        : `Erro ao enviar ${erros} REP(s)`
      setResultadoLote({ ok: ok > 0, msg })
    } finally {
      setEnviandoLote(false)
      setTimeout(() => setResultadoLote(null), 6000)
    }
  }

  const handleImportarTodasReps = async () => {
    setImportandoReps(true)
    setResultadoImportacao(null)
    try {
      const resp = await fetch("/api/gdl/importar-designadas", { method: "POST" })
      const data = await resp.json()
      if (!resp.ok || !data.ok) {
        setResultadoImportacao({ ok: false, msg: data.erro || "Erro ao buscar REPs no GDL." })
        return
      }

      const reps: { numero: string; natureza: string }[] = data.reps ?? []
      const agora = new Date().toISOString()
      let novas = 0

      for (const { numero, natureza } of reps) {
        const partes = numero.replace(/\./g, "").split("/")
        const examNumber = partes[0] ?? numero
        const examYear   = partes[1] ?? new Date().getFullYear().toString()

        // Não duplica — verifica se já existe pelo número+ano (filter não exige índice)
        const existe = await db.laudos
          .filter(l => l.examNumber === examNumber && l.examYear === examYear)
          .first()
        if (existe) continue

        await db.laudos.add({
          localId:           generateId(),
          examNumber,
          examYear,
          caseNumber:        "",
          unit:              "",
          expert:            "",
          date:              agora.slice(0, 10),
          observacoes:       "",
          naturezaExame:     natureza,
          status:            "rascunho",
          syncStatus:        "pending",
          repStatus:         "importada",
          criadoEm:          agora,
          atualizadoEm:      agora,
        })
        novas++
      }

      await recarregarLista()
      setResultadoImportacao({
        ok:  true,
        msg: novas > 0
          ? `${novas} REP(s) nova(s) importada(s) de ${reps.length} encontrada(s).`
          : `Nenhuma REP nova — ${reps.length} já estavam importadas.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setResultadoImportacao({ ok: false, msg: `Erro: ${msg}` })
    } finally {
      setImportandoReps(false)
      setTimeout(() => setResultadoImportacao(null), 8000)
    }
  }

  const handleLimparReps = async () => {
    const removidas = await limparRepsLocais()
    await recarregarLista()
    setConfirmandoLimpar(false)
    setResultadoImportacao({
      ok: removidas > 0,
      msg: removidas > 0
        ? `${removidas} REP(s) removida(s) do app.`
        : "Nenhuma REP encontrada para remover.",
    })
    setTimeout(() => setResultadoImportacao(null), 5000)
  }

  // ── Atualiza GDL em sessão única: uma chamada, um browser ───────────────────

  const handleAtualizarTodasPecasGdl = async () => {
    const numLimpo = form.examNumber.trim().replace(/[^0-9]/g, '')
    if (!numLimpo) {
      setGdlResultado({ ok: false, msg: 'Número da REP inválido para o GDL' })
      setTimeout(() => setGdlResultado(null), 3000)
      return
    }
    const repNumero = `${numLimpo}/${form.examYear}`

    const pecasInvalidas = savedPieces
      .map((p, i) => ({ num: i + 1, tipo: p.type, brand: p.brand, faltando: validarCamposGdlPeca(p) }))
      .filter(x => x.faltando.length > 0)
    if (pecasInvalidas.length > 0) {
      const p1 = pecasInvalidas[0]
      const nome = `Peça ${p1.num}${p1.brand ? ` · ${p1.brand}` : ''} (${p1.tipo})`
      const extra = pecasInvalidas.length > 1 ? ` e mais ${pecasInvalidas.length - 1}` : ''
      setGdlResultado({ ok: false, msg: `${nome}${extra}: falta ${p1.faltando.join(', ')}` })
      setTimeout(() => setGdlResultado(null), 6000)
      return
    }

    setAtualizandoPecas(true)
    setAtualizandoPecasProgresso({ fase: 'Atualizando GDL...', atual: 1, total: 1 })

    try {
      const resp = await fetch('/api/gdl/atualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rep_numero: repNumero, pecas: savedPieces }),
      })
      const data = await resp.json()

      // Persiste peças com gdlPartsIds atualizados (novos IDs capturados pelo Python)
      if (Array.isArray(data.pecasAtualizadas)) {
        setSavedPieces(data.pecasAtualizadas)
        salvarPecas(data.pecasAtualizadas)
      }

      const partes = [
        data.adicionadas > 0 && `${data.adicionadas} adicionada(s)`,
        data.editadas    > 0 && `${data.editadas} editada(s)`,
        data.excluidas   > 0 && `${data.excluidas} excluída(s) do GDL`,
      ].filter(Boolean)
      const msg = partes.length > 0 ? partes.join(' · ') : 'GDL sincronizado'
      setGdlResultado({ ok: data.ok, msg })
    } catch (err: any) {
      setGdlResultado({ ok: false, msg: err?.message ?? 'Erro de rede' })
    } finally {
      setAtualizandoPecas(false)
      setAtualizandoPecasProgresso({ fase: '', atual: 0, total: 0 })
      setTimeout(() => setGdlResultado(null), 5000)
    }
  }

  const handleSalvarExame = async () => {
    const idParaSincronizar = laudoLocalId
    await finalizarLaudo(form, savedPieces)
    await atualizarRepStatus(idParaSincronizar, "sincronizada")
    recarregarLista()
    setModoEdicao(false)
    setSalvouExame(true)
    // Reseta todo o estado do formulário e fecha o exame
    setExamType(null)
    setRepMinimized(false)
    setSavedPieces([])
    setWeapons([])
    setWeaponType(null)
    setActiveWeaponIdx(0)
    setPieceFormOpen(false)
    setTypePickerOpen(false)
    setForm({ ...emptyForm, expert: nomePerito })
    setTimeout(() => setSalvouExame(false), 2500)
  }

  const handleEditarLaudo = async (localId: string) => {
    const completo = await buscarLaudoCompleto(localId)
    if (!completo) return
    const { laudo, armas, fotosDoLaudo } = completo
    setLaudoLocalId(localId)
    setForm({
      examNumber:         laudo.examNumber        ?? '',
      examYear:           laudo.examYear          ?? '',
      caseNumber:         laudo.caseNumber        ?? '',
      unit:               laudo.unit              ?? '',
      expert:             laudo.expert            ?? '',
      date:               laudo.date              ?? '',
      observacoes:        laudo.observacoes       ?? '',
      solicitante:        laudo.solicitante       ?? '',
      remetenteCidade:    laudo.remetenteCidade   ?? '',
      remetenteOrgao:     laudo.remetenteOrgao    ?? '',
      naturezaExame:      laudo.naturezaExame     ?? '',
      naturezaOcorrencia: laudo.naturezaOcorrencia ?? '',
      dataEntrada:        laudo.dataEntrada       ?? '',
      horaEntrada:        laudo.horaEntrada       ?? '',
      enderecoExame:      laudo.enderecoExame     ?? '',
      oficio:             laudo.oficio            ?? '',
      ipApfd:             laudo.ipApfd            ?? '',
      processo:           laudo.processo          ?? '',
    })
    const pecas = armas.map(a => JSON.parse(a.dadosJson) as WeaponEntry)
    setSavedPieces(pecas)
    setWeapons([])
    setActiveWeaponIdx(0)
    setPieceFormOpen(false)
    setWeaponType(null)
    // Carrega fotos do laudo no mapa de preview
    const fotoMap = new Map<string, string>()
    for (const foto of fotosDoLaudo) {
      fotoMap.set(foto.slotLabel, foto.imagemBase64)
    }
    setPhotoUrls(fotoMap)
    setPhotoSyncMap({})
    setExamType("EFICIÊNCIA")
    setModoEdicao(true)
    setSelectedLaudoId(null)
    setActiveSection("exames")
  }

  const resetPieceForm = () => {
    setWeaponType(null)
    setWeapons([])
    setActiveWeaponIdx(0)
    setPieceFormOpen(false)
    setShowGroupFirearms(false)
    setShowGroupAmmo(false)
    setShowGroupOthers(false)
    setPhotosOpen(false)
    setLacreNumero("")
    setLacreSaidaNumero("")
    setPhotoUrls(prev => {
      const next = new Map<string, string>()
      prev.forEach((v, k) => { if (k.startsWith("coleta-")) next.set(k, v) })
      return next
    })
    setViewerPhoto(null)
    setEditingPieceIdx(null)
  }

  const resetFullExam = () => {
    resetPieceForm()
    setSavedPieces([])
    setColetaActivePieceIdx(null)
    setColetaPhotoUrls(new Map())
    setPhotoUrls(new Map())
    setExamType(null)
    setRepMinimized(false)
  }

  const savePiece = () => {
    if (!activeWeapon) return
    let novaLista: WeaponEntry[]
    if (editingPieceIdx !== null) {
      novaLista = savedPieces.map((p, i) => i === editingPieceIdx ? { ...activeWeapon } : p)
      setSavedPieces(novaLista)
    } else {
      novaLista = [...savedPieces, { ...activeWeapon }]
      setSavedPieces(novaLista)
    }
    salvarPecas(novaLista)
    resetPieceForm()
  }

  const openEditPiece = (idx: number) => {
    const piece = savedPieces[idx]
    setEditingPieceIdx(idx)
    setWeaponType(piece.type)
    setWeapons([{ ...piece }])
    setActiveWeaponIdx(0)
    setLacreNumero(piece.lacreEntradaPeca ?? "")
    setLacreSaidaNumero(piece.lacreSaidaPeca ?? "")
    setPieceFormOpen(true)
  }

  const removeSavedPiece = (idx: number) => {
    const novas = savedPieces.filter((_, i) => i !== idx)
    setSavedPieces(novas)
    salvarPecas(novas)
  }

  const tituloMaterialAcessorio = (item: string): string => {
    const map: Record<string, string> = {
      "Varetas":            "Material das Varetas",
      "Recipientes":        "Material dos Recipientes",
      "Balança":            "Material da Balança",
      "Caixas":             "Material das Caixas",
      "Maletas":            "Material das Maletas",
      "Capa":               "Material da Capa",
      "Coldre":             "Material do Coldre",
      "Mira":               "Material da Mira",
      "Carregador":         "Material do Carregador",
      "Cano Sobressalente": "Material do Cano Sobressalente",
      "Bipé":               "Material do Bipé",
      "Cinto de munição":   "Material do Cinto de munição",
    }
    return map[item] ?? `Material — ${item}`
  }

  const filteredRecords = useMemo(() => {
    return laudosDB.filter((item) => {
      const numberOk =
        !numberFilter ||
        item.number.toLowerCase().includes(numberFilter.toLowerCase()) ||
        item.model.toLowerCase().includes(numberFilter.toLowerCase())
      const yearOk = !yearFilter || item.year.includes(yearFilter)
      const unitOk = !unitFilter || item.unit.toLowerCase().includes(unitFilter.toLowerCase())
      return numberOk && yearOk && unitOk
    })
  }, [laudosDB, numberFilter, yearFilter])

  const handleField =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        event.target instanceof HTMLInputElement && event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value
      setForm((current) => ({ ...current, [field]: value as never }))
    }

  const handleWeaponField =
    (field: keyof Omit<WeaponEntry, "type">) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        event.target instanceof HTMLInputElement && event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value
      setWeapons((prev) =>
        prev.map((w, i) => (i === activeWeaponIdx ? { ...w, [field]: value as never } : w))
      )
    }

  const setWeaponDirect = (field: keyof Omit<WeaponEntry, "type">, value: string | boolean | null | string[]) => {
    setWeapons(prev => prev.map((w, i) => i === activeWeaponIdx ? { ...w, [field]: value as never } : w))
  }

  const handleWeaponNaToggle = (field: string) => {
    setWeapons(prev => prev.map((w, i) => {
      if (i !== activeWeaponIdx) return w
      const naFlags = w.naFlags.includes(field)
        ? w.naFlags.filter(f => f !== field) // Remove if already present
        : [...w.naFlags, field]
      return { ...w, naFlags }
    }))
  }

  const sidebarDesktop = (
    <aside className="hidden w-[300px] shrink-0 border-r border-[#8e7340] bg-[linear-gradient(180deg,#0d1a31_0%,#11203c_58%,#0b1730_100%)] xl:block">
      <SidebarContent
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onOpenProfile={() => setProfileView("main")}
      />
    </aside>
  )



  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#09142a_0%,#0d1a34_50%,#091429_100%)] text-white">
      <div className="min-h-screen bg-[radial-gradient(circle_at_15%_18%,rgba(245,211,128,.08),transparent_18%),radial-gradient(circle_at_90%_10%,rgba(245,211,128,.05),transparent_18%),linear-gradient(180deg,rgba(255,255,255,.01),rgba(255,255,255,0))]">
        <header className="border-b-[3px] border-[#b79248] bg-[linear-gradient(180deg,#13233f_0%,#10203b_100%)] shadow-[0_12px_28px_rgba(0,0,0,.28)]">
          <div className="border-b border-[#8e7340]/70 px-4 py-2.5 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              {/* ── Esquerda: menu + logo (mobile) / logo (desktop) ── */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setMenuOpen(true)}
                  className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a]"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center ml-1">
                  <img src={logoEscudo} alt="BalísticaDB" className="h-10 w-auto object-contain" style={{ marginRight: "-10px" }} />
                  <div className="flex flex-col gap-0" style={{ marginLeft: "-10px" }}>
                    <div style={{ paddingLeft: "5px" }} className="text-lg font-black text-[#f0d08a] leading-tight">BalísticaDB</div>
                    <div style={{ paddingLeft: "2px" }} className="text-[9px] font-bold text-white/60 uppercase tracking-[0.16em] leading-tight">Polícia Científica do Paraná</div>
                  </div>
                </div>
              </div>

              <div className="hidden items-center lg:flex">
                <img
                  src={logoEscudo}
                  alt="BalísticaDB"
                  className="h-20 w-auto object-contain drop-shadow-[0_0_16px_rgba(240,208,138,.2)]"
                  style={{ marginRight: "-18px" }}
                />
                <div style={{ marginLeft: "-34px" }} className="flex flex-col gap-0">
                  <h1 style={{ paddingLeft: "6px" }} className="text-xl font-black tracking-tight text-[#f0d08a]">BalísticaDB</h1>
                  <p style={{ paddingLeft: "8px" }} className="text-[11px] text-[#f4e6be]">
                    Perícia Balística — Sistema de Exames e Banco de Dados
                  </p>
                  <p style={{ paddingLeft: "2px" }} className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
                    Polícia Científica do Paraná
                  </p>
                </div>
              </div>

              {/* ── Direita: botão de perfil (mobile + desktop) ── */}
              <button
                onClick={() => setProfileView("main")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#8e7340] bg-[#12213d] text-[#f0d08a] transition active:bg-[#1a2c4f] hover:bg-[#1a2c4f]"
              >
                {nomePerito && nomePerito !== "Perito responsável" ? (
                  <span className="text-xs font-black leading-none">
                    {nomePerito.trim().split(" ").filter(Boolean).length >= 2
                      ? (nomePerito.trim().split(" ")[0][0] + nomePerito.trim().split(" ").filter(Boolean).slice(-1)[0][0]).toUpperCase()
                      : nomePerito.trim().slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <User2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1800px]">
          {sidebarDesktop}

          <main className="flex-1 px-4 py-5 pb-36 lg:px-8 lg:py-6 xl:px-10 xl:pb-6">
            <div className="grid gap-6 max-w-[1060px] mx-auto">
              {/* ── INÍCIO ─────────────────────────────────────────── */}
              {activeSection === "inicio" && (
                <section className="space-y-6">
                  <div className="rounded-2xl border border-[#8e7340] bg-[linear-gradient(180deg,rgba(20,35,63,.92)_0%,rgba(11,23,48,.96)_100%)] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,.18)]">
                    <h2 className="text-base font-black tracking-tight text-[#f0d08a] md:text-lg">Início</h2>
                    <p className="mt-0.5 text-[12px] text-[#eadab0]">Visão geral do sistema</p>
                  </div>

                  <div className="rounded-[26px] border border-[#8e7340] bg-[linear-gradient(180deg,#14233f_0%,#0b1730_100%)] shadow-[0_16px_40px_rgba(0,0,0,.24)] overflow-hidden">
                    <div className="border-b border-[#8e7340]/60 px-5 py-3">
                      <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#ccb780]">Painel</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#8e7340]/40">
                      {([
                        [<Database className="h-6 w-6" />, String(laudosDB.length), "Laudos salvos"],
                        [<CircleDot className="h-6 w-6" />, "0", "Calibres"],
                        [<Building2 className="h-6 w-6" />, "0", "Fabricantes"],
                        [<Wifi className="h-6 w-6" />, "0", "Sincronizados"],
                      ] as [React.ReactNode, string, string][]).map(([icn, value, label], i) => (
                        <div key={i} className="p-5">
                          <div className="mb-3 w-fit rounded-2xl border border-[#8e7340] bg-[#0f1e39] p-3 text-[#f0d08a]">{icn}</div>
                          <div className="text-4xl font-extrabold tracking-tight text-[#f0d08a]">{value}</div>
                          <div className="mt-1 text-sm text-[#eadab0]">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f4edde] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                    <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                      <h3 className="text-xl font-black text-[#f0d08a]">Laudos recentes</h3>
                    </div>
                    <div className="space-y-3 p-5 text-[#26221b]">
                      {laudosDB.slice(0, 5).map((item) => (
                        <button key={item.id} onClick={() => setActiveSection("registros")}
                          className="flex w-full items-center justify-between rounded-2xl border border-[#d9ccb2] bg-[#fbf8f3] px-4 py-3 text-left transition hover:border-[#ac8d50]">
                          <div>
                            <div className="text-base font-black tracking-tight">{item.number}/{item.year}</div>
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#67583d]">{item.unit}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-[#b89a58]" />
                        </button>
                      ))}
                      {laudosDB.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#cab88d] bg-[#fbf8f3] px-4 py-8 text-center text-[#6e614d]">
                          Nenhum laudo salvo ainda. Vá em <strong>Exames</strong> para criar.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* ── EXAMES ─────────────────────────────────────────── */}
              {activeSection === "exames" && (
                <section className="space-y-6">
                  <div className="rounded-2xl border border-[#8e7340] bg-[linear-gradient(180deg,rgba(20,35,63,.92)_0%,rgba(11,23,48,.96)_100%)] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,.18)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <h2 className="text-base font-black tracking-tight text-[#f0d08a] md:text-lg">Exames de Armas</h2>
                        <p className="mt-0.5 text-[12px] text-[#eadab0]">Cadastro e gestão de exames em andamento</p>
                      </div>
                      <button type="button"
                        onClick={() => { setWeaponType(null); setWeapons([]); setSavedPieces([]); setExamType(null); setRepMinimized(false); setTypePickerOpen(true) }}
                        className="flex h-12 items-center gap-2 rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#e1c580_0%,#caa65c_100%)] px-6 text-sm font-black tracking-wide text-[#1d2433] shadow transition hover:brightness-105">
                        + NOVA REP
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f4edde] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                    <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                      <h3 className="text-xl font-black text-[#f0d08a]">Laudos em execução</h3>
                    </div>
                    <div className="space-y-3 p-5 text-[#26221b]">
                      {laudosDB.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#cab88d] bg-[#fbf8f3] px-4 py-6 text-center text-sm font-medium text-[#6e614d]">
                          Nenhum exame em execução
                        </div>
                      )}
                      {laudosDB.map((item) => (
                        <button key={item.id} onClick={() => setSelectedLaudoId(item.id)} className="flex w-full flex-col rounded-2xl border border-[#d9ccb2] bg-[#fbf8f3] px-4 py-4 text-left transition hover:border-[#ac8d50] active:brightness-95">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-xl font-black tracking-tight">{item.number}/{item.year}</div>
                              <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#67583d]">{item.unit}</div>
                            </div>
                            {item.repStatus
                              ? <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-[0.16em] ${REP_STATUS_BADGE[item.repStatus]}`}>{REP_STATUS_LABEL[item.repStatus]}</span>
                              : <span className="rounded-full border border-[#d8c59b] bg-[#f2e4bc] px-3 py-1 text-xs font-bold tracking-[0.16em] text-[#5b4a2e]">Em execução</span>
                            }
                          </div>
                          <div className="mt-2 text-sm text-[#6a5c45]">{item.expert}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                </section>
              )}

              {/* ── REGISTROS ──────────────────────────────────────── */}
              {activeSection === "registros" && (
                <section className="space-y-6">
                  <div className="rounded-2xl border border-[#8e7340] bg-[linear-gradient(180deg,rgba(20,35,63,.92)_0%,rgba(11,23,48,.96)_100%)] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,.18)]">
                    <h2 className="text-base font-black tracking-tight text-[#f0d08a] md:text-lg">Registros</h2>
                    <p className="mt-0.5 text-[12px] text-[#eadab0]">Histórico de laudos salvos</p>
                  </div>

                  <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f4edde] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                    <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                      <h3 className="text-xl font-black text-[#f0d08a]">Buscar</h3>
                    </div>
                    <div className="space-y-4 p-5 text-[#27231c] lg:grid lg:grid-cols-4 lg:gap-4 lg:items-end lg:space-y-0">
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-[#6b5838]">Número</label>
                        <input value={numberFilter} onChange={(e) => setNumberFilter(e.target.value)}
                          className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                          placeholder="Digite número, tipo ou modelo" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-[#6b5838]">Ano</label>
                        <input value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}
                          className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                          placeholder="2026" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-[#6b5838]">Unidade</label>
                        <input value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}
                          className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                          placeholder="Ex: NPC Curitiba" />
                      </div>
                      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#6e572f_0%,#49391f_100%)] text-sm font-black tracking-[0.16em] text-[#f8e3b3] shadow-[0_10px_18px_rgba(66,50,24,.22)]">
                        <Search className="h-4 w-4" />BUSCAR
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f7f1e5] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                    <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                      <h3 className="text-xl font-black text-[#f0d08a]">Laudos Registrados</h3>
                    </div>
                    <div className="space-y-4 p-5 text-[#26221b]">
                      {filteredRecords.map((item) => (
                        <button key={item.id}
                          onClick={() => setSelectedLaudoId(item.id)}
                          className="flex w-full flex-col rounded-2xl border border-[#d9ccb2] bg-[#fbf8f3] px-4 py-4 text-left transition hover:border-[#ac8d50] hover:shadow-[0_10px_24px_rgba(0,0,0,.08)] active:brightness-95">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-2xl font-black tracking-tight">{item.number}/{item.year}</div>
                              <div className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-[#67583d]">{item.type}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="rounded-full border border-[#d8c59b] bg-[#f2e4bc] px-3 py-1 text-xs font-bold tracking-[0.16em] text-[#5b4a2e]">{item.unit}</span>
                              {item.repStatus && (
                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${REP_STATUS_BADGE[item.repStatus]}`}>
                                  {REP_STATUS_LABEL[item.repStatus]}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 text-base text-[#40362a]">{item.model}</div>
                          <div className="mt-3 text-sm text-[#6a5c45]">Perito: {item.expert}</div>
                        </button>
                      ))}
                      {filteredRecords.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#cab88d] bg-[#fbf8f3] px-4 py-8 text-center text-[#6e614d]">
                          Nenhum registro encontrado.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* ── SINCRONIZAR ─────────────────────────────────────── */}
              {activeSection === "sincronizar" && (() => {
                const porStatus = {
                  importada:    laudosDB.filter(l => l.repStatus === "importada"),
                  editando:     laudosDB.filter(l => l.repStatus === "editando"),
                  sincronizada: laudosDB.filter(l => l.repStatus === "sincronizada"),
                  no_gdl:       laudosDB.filter(l => l.repStatus === "no_gdl"),
                }
                const filaGdl = porStatus.sincronizada
                return (
                  <section className="space-y-4">
                    <div className="rounded-2xl border border-[#8e7340] bg-[linear-gradient(180deg,rgba(20,35,63,.92)_0%,rgba(11,23,48,.96)_100%)] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,.18)]">
                      <h2 className="text-base font-black tracking-tight text-[#f0d08a] md:text-lg">Exportar ao GDL</h2>
                      <p className="mt-0.5 text-[12px] text-[#eadab0]">Pipeline de estágios e envio em lote</p>
                    </div>

                    {/* Painel de estágios */}
                    <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f4edde] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                      <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                        <h3 className="text-base font-black text-[#f0d08a]">Pipeline de REPs</h3>
                        <p className="text-[11px] text-[#ccb780]">Visão geral dos estágios</p>
                      </div>
                      <div className="grid grid-cols-4 gap-px bg-[#d9ccb2] border-b border-[#d9ccb2]">
                        {([
                          { key: "importada"    as RepStatus, label: "Importadas", color: "text-[#4e7ab5]", bg: "bg-[#3d5a8a]/8" },
                          { key: "editando"     as RepStatus, label: "Em Edição",  color: "text-[#b89240]", bg: "bg-[#8a6d2e]/8" },
                          { key: "sincronizada" as RepStatus, label: "Prontas",    color: "text-[#3d9b55]", bg: "bg-[#2e6b3e]/8" },
                          { key: "no_gdl"       as RepStatus, label: "No GDL",     color: "text-[#8ea4c0]", bg: "bg-[#12213d]/8" },
                        ]).map(({ key, label, color, bg }) => (
                          <div key={key} className={`flex h-[76px] flex-col items-center justify-center ${bg}`}>
                            <span className={`text-2xl font-black ${color}`}>{porStatus[key].length}</span>
                            <span className="mt-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#6b5838] text-center leading-tight">{label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="px-5 py-4 text-[12px] text-[#7a6840] leading-relaxed">
                        Abra uma REP em <strong>Registros</strong> para avançar seu estágio. Quando marcadas como <strong>Prontas</strong>, aparecem na fila abaixo para envio ao GDL.
                      </div>
                    </div>

                    {/* Fila para GDL */}
                    <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f4edde] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                      <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-black text-[#f0d08a]">Fila para o GDL</h3>
                          <p className="text-[11px] text-[#ccb780]">REPs marcadas como Prontas</p>
                        </div>
                        {filaGdl.length > 0 && (
                          <span className="rounded-full bg-[#3d9b55]/20 px-3 py-1 text-xs font-black text-[#3d9b55]">
                            {filaGdl.length} pronta{filaGdl.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        {filaGdl.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-[#cab88d] bg-[#fbf8f3] px-4 py-8 text-center">
                            <RefreshCw className="h-8 w-8 mx-auto mb-2 text-[#cab88d]" />
                            <p className="text-sm text-[#6e614d]">Nenhuma REP na fila.</p>
                            <p className="mt-1 text-xs text-[#9e8c6e]">Avance REPs para "Pronta" em Registros.</p>
                          </div>
                        ) : (
                          <>
                            {filaGdl.map(item => (
                              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-[#d9ccb2] bg-[#fbf8f3] px-4 py-3">
                                <div>
                                  <div className="text-base font-black text-[#26221b]">{item.number}/{item.year}</div>
                                  <div className="text-xs text-[#6a5c45]">{item.unit || "—"}</div>
                                </div>
                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${REP_STATUS_BADGE["sincronizada"]}`}>
                                  Pronta
                                </span>
                              </div>
                            ))}
                            {resultadoLote && (
                              <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-black ${resultadoLote.ok ? "bg-[#1e3d1e]/10 text-[#2d6e2d]" : "bg-[#3d1e1e]/10 text-[#8b2020]"}`}>
                                {resultadoLote.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                {resultadoLote.msg}
                              </div>
                            )}
                            <button
                              onClick={handleEnviarTodasAoGdl}
                              disabled={enviandoLote}
                              className="w-full rounded-2xl border-2 border-[#1b3a6b] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-4 text-sm font-black tracking-[0.10em] text-[#f0d08a] shadow-[0_8px_20px_rgba(20,40,100,.30)] transition active:brightness-95 disabled:opacity-50"
                            >
                              {enviandoLote ? "ENVIANDO..." : `ENVIAR ${filaGdl.length > 1 ? `TODAS (${filaGdl.length})` : "PARA O GDL"}`}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </section>
                )
              })()}

              {/* ── IMPORTAR REPs ────────────────────────────────── */}
              {activeSection === "importar" && (() => {
                const fmtDate = (iso: string) => {
                  if (!iso) return "—"
                  const d = new Date(iso)
                  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
                }
                const STATUS_CFG: Record<string, { label: string; dot: string; text: string; btn: string; btnLabel: string }> = {
                  importada:    { label: "A Iniciar",    dot: "bg-[#4e7ab5]",  text: "text-[#4e7ab5]",  btn: "border-[#a18449] bg-[#ece6da] text-[#7a6840]", btnLabel: "EDITAR" },
                  editando:     { label: "Em Andamento", dot: "bg-[#b89240]",  text: "text-[#b89240]",  btn: "border-[#a18449] bg-[#ece6da] text-[#7a6840]", btnLabel: "EDITAR" },
                  sincronizada: { label: "Pronta",       dot: "bg-[#3d9b55]",  text: "text-[#3d9b55]",  btn: "border-[#a18449] bg-[#ece6da] text-[#7a6840]", btnLabel: "EDITAR" },
                  no_gdl:       { label: "No GDL",       dot: "bg-[#8ea4c0]",  text: "text-[#8ea4c0]",  btn: "border-[#a18449] bg-[#ece6da] text-[#7a6840]", btnLabel: "VER" },
                }
                const repsFiltered = laudosDB.filter(l => {
                  if (importarFiltro === "pendentes")  return l.repStatus === "importada" || l.repStatus === "editando"
                  if (importarFiltro === "concluidas") return l.repStatus === "sincronizada" || l.repStatus === "no_gdl"
                  return true
                })
                const contPendentes  = laudosDB.filter(l => l.repStatus === "importada" || l.repStatus === "editando").length
                const contConcluidas = laudosDB.filter(l => l.repStatus === "sincronizada" || l.repStatus === "no_gdl").length
                return (
                  <section className="space-y-4">
                    <div className="rounded-2xl border border-[#8e7340] bg-[linear-gradient(180deg,rgba(20,35,63,.92)_0%,rgba(11,23,48,.96)_100%)] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,.18)]">
                      <h2 className="text-base font-black tracking-tight text-[#f0d08a] md:text-lg">Importar REPs</h2>
                      <p className="mt-0.5 text-[12px] text-[#eadab0]">REPs designadas para este perito</p>
                    </div>

                    {/* Card de importação */}
                    <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f4edde] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                      <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f0d08a]/15">
                          <Download className="h-5 w-5 text-[#f0d08a]" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-[#f0d08a]">Buscar no GDL</h3>
                          <p className="text-[11px] text-[#ccb780]">Importa REPs designadas automaticamente</p>
                        </div>
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        {resultadoImportacao && (
                          <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-black ${resultadoImportacao.ok ? "bg-[#1e3d1e]/10 text-[#2d6e2d]" : "bg-[#3d1e1e]/10 text-[#8b2020]"}`}>
                            {resultadoImportacao.ok
                              ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                              : <AlertCircle className="h-4 w-4 shrink-0" />}
                            {resultadoImportacao.msg}
                          </div>
                        )}
                        <button
                          onClick={handleImportarTodasReps}
                          disabled={importandoReps}
                          className="w-full rounded-2xl border-2 border-[#1b3a6b] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-3.5 text-sm font-black tracking-[0.10em] text-[#f0d08a] shadow-[0_8px_20px_rgba(20,40,100,.30)] transition active:brightness-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {importandoReps
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> BUSCANDO NO GDL...</>
                            : <><Download className="h-4 w-4" /> IMPORTAR TODAS AS REPs</>}
                        </button>
                      </div>
                    </div>

                    {/* Filtros + lista */}
                    <div className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f4edde] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                      <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-3 space-y-2">
                        {/* Linha 1: título + botão Limpar */}
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="text-base font-black text-[#f0d08a]">REPs disponíveis</h3>
                            <p className="text-[11px] text-[#ccb780]">{laudosDB.length} no total</p>
                          </div>
                          {confirmandoLimpar ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-black text-[#f0a08a]">Confirmar?</span>
                              <button
                                onClick={handleLimparReps}
                                className="rounded-xl bg-[#8b2020] px-4 py-2 text-[12px] font-black text-white active:brightness-90 transition"
                              >
                                SIM
                              </button>
                              <button
                                onClick={() => setConfirmandoLimpar(false)}
                                className="rounded-xl bg-[#f0d08a]/10 px-4 py-2 text-[12px] font-black text-[#f0d08a]/70 active:brightness-90 transition"
                              >
                                NÃO
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmandoLimpar(true)}
                              className="shrink-0 rounded-xl bg-[#8b2020]/30 px-4 py-2 text-[12px] font-black text-[#f0a08a] hover:bg-[#8b2020]/50 active:brightness-90 transition"
                            >
                              Limpar
                            </button>
                          )}
                        </div>
                        {/* Linha 2: pílulas de filtro */}
                        <div className="flex gap-1.5">
                          {([
                            { id: "todas",      label: "Todas",     count: laudosDB.length },
                            { id: "pendentes",  label: "Pendentes", count: contPendentes },
                            { id: "concluidas", label: "Prontas",   count: contConcluidas },
                          ] as const).map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setImportarFiltro(tab.id)}
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px] font-black transition",
                                importarFiltro === tab.id
                                  ? "bg-[#f0d08a] text-[#12213d]"
                                  : "bg-[#f0d08a]/10 text-[#f0d08a]/70 hover:bg-[#f0d08a]/20"
                              )}
                            >
                              {tab.label}{tab.count > 0 ? ` ${tab.count}` : ""}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="divide-y divide-[#e8dfc8]">
                        {repsFiltered.length === 0 ? (
                          <div className="px-5 py-10 text-center">
                            <Package className="h-10 w-10 mx-auto mb-2 text-[#cab88d]" />
                            <p className="text-sm font-black text-[#6e614d]">Nenhuma REP encontrada</p>
                            <p className="mt-1 text-xs text-[#9e8c6e]">
                              {importarFiltro === "todas"
                                ? "Use o botão acima para importar REPs do GDL."
                                : "Nenhuma REP neste filtro."}
                            </p>
                          </div>
                        ) : repsFiltered.map(item => {
                          const cfg = item.repStatus ? STATUS_CFG[item.repStatus] : null
                          return (
                            <div key={item.id} className="px-5 py-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[15px] font-black text-[#26221b]">
                                      REP {item.number}/{item.year}
                                    </span>
                                    {cfg && (
                                      <span className={`flex items-center gap-1 text-[10px] font-black ${cfg.text}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                        {cfg.label}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 space-y-0.5">
                                    {item.unit && (
                                      <p className="text-[12px] text-[#6a5c45] truncate">{item.unit}</p>
                                    )}
                                    {item.model && item.model !== "—" && (
                                      <p className="text-[11px] text-[#9e8c6e] truncate">BC: {item.model}</p>
                                    )}
                                    <p className="text-[10px] text-[#b5a07e]">Atualizado: {fmtDate(item.updatedAt)}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleEditarLaudo(item.id)}
                                  className={cn(
                                    "shrink-0 rounded-2xl border-2 px-4 py-2.5 text-[11px] font-black tracking-[0.08em] transition active:brightness-95",
                                    cfg ? cfg.btn : "border-[#a18449] bg-[#ece6da] text-[#7a6840]"
                                  )}
                                >
                                  {cfg ? cfg.btnLabel : "EDITAR"}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </section>
                )
              })()}

              {/* ── DADOS ──────────────────────────────────────────── */}
              {activeSection === "dados" && (
                <section className="space-y-6">
                  <div className="rounded-2xl border border-[#8e7340] bg-[linear-gradient(180deg,rgba(20,35,63,.92)_0%,rgba(11,23,48,.96)_100%)] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,.18)]">
                    <h2 className="text-base font-black tracking-tight text-[#f0d08a] md:text-lg">Dados de Referência</h2>
                    <p className="mt-0.5 text-[12px] text-[#eadab0]">Calibres, fabricantes e tipos cadastrados</p>
                  </div>
                  {([
                    { title: "Calibres",        count: "0", desc: "Calibres cadastrados no sistema",    icon: null },
                    { title: "Fabricantes",      count: "0", desc: "Fabricantes de armas e munições",    icon: null },
                    { title: "Tipos de munição", count: "0", desc: "Tipos e subtipos de munição",        icon: null },
                    { title: "Sincronizados",    count: "0", desc: "Laudos enviados para o servidor",   icon: <Wifi className="h-5 w-5 text-[#f0d08a]" /> },
                  ]).map((card) => (
                    <div key={card.title} className="overflow-hidden rounded-[28px] border border-[#a18449] bg-[#f4edde] shadow-[0_18px_44px_rgba(0,0,0,.24)]">
                      <div className="border-b border-[#ccb890] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {card.icon}
                          <h3 className="text-xl font-black text-[#f0d08a]">{card.title}</h3>
                        </div>
                        <span className="rounded-full bg-[#f0d08a]/15 px-3 py-1 text-xs font-black text-[#f0d08a]">{card.count}</span>
                      </div>
                      <div className="px-5 py-6 text-center text-[#6e614d]">
                        <p className="text-sm">{card.desc}</p>
                        <p className="mt-2 text-xs text-[#9e8c6e]">Em desenvolvimento</p>
                      </div>
                    </div>
                  ))}
                </section>
              )}

            </div>
          </main>
        </div>

        {/* ── Modal de tipo de exame ── */}
        <AnimatePresence>
          {typePickerOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setTypePickerOpen(false)}
              />
              <motion.div
                className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 sm:p-6"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
              >
                <div className="w-full max-w-sm rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_32px_80px_rgba(0,0,0,.55)] overflow-hidden">
                  {/* topo */}
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-5">
                    <div className="text-xl font-black text-[#f0d08a]">Nova REP</div>
                    <div className="mt-0.5 text-xs uppercase tracking-[0.2em] text-[#ccb780]">Selecione o tipo de exame</div>
                  </div>
                  {/* opções */}
                  <div className="space-y-3 p-4">
                    {(["EFICIÊNCIA", "CONSTATAÇÃO"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setTypePickerOpen(false); setExamType(t) }}
                        className="flex w-full items-center justify-between rounded-2xl border-2 border-[#d3c4a8] bg-white px-5 py-5 text-left transition active:scale-[.97] active:bg-[#ece6da]"
                      >
                        <div>
                          <div className="text-base font-black uppercase tracking-[0.12em] text-[#1d2433]">{t}</div>
                          <div className="mt-1 text-xs leading-relaxed text-[#8d7854]">
                            {t === "EFICIÊNCIA" ? "Exame de disparo e funcionamento da arma" : "Constatação de características e estado geral"}
                          </div>
                        </div>
                        <ChevronRight className="ml-3 h-5 w-5 shrink-0 text-[#b89a58]" />
                      </button>
                    ))}
                  </div>
                  {/* importar do GDL */}
                  <div className="px-4 pb-3">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-[#d3c4a8]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9e8c6e]">ou</span>
                      <div className="h-px flex-1 bg-[#d3c4a8]" />
                    </div>
                    <button type="button"
                      onClick={() => { setTypePickerOpen(false); setExamType("EFICIÊNCIA"); setRepMinimized(false); setRepGdlErro(null) }}
                      className="flex w-full items-center justify-between rounded-2xl border-2 border-[#8e7340] bg-[#12213d] px-5 py-4 text-left transition active:scale-[.97]">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#f0d08a]">
                          <Database className="h-4 w-4" />
                          Importar do GDL
                        </div>
                        <div className="mt-1 text-xs leading-relaxed text-[#ccb780]">Preencher automaticamente a partir da REP</div>
                      </div>
                      <ChevronRight className="ml-3 h-5 w-5 shrink-0 text-[#f0d08a]" />
                    </button>
                  </div>
                  {/* cancelar */}
                  <div className="px-4 pb-5">
                    <button type="button" onClick={() => setTypePickerOpen(false)}
                      className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838] active:brightness-95">
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>


        {/* ── REP Minimizado ── */}
        <AnimatePresence>
          {examType !== null && repMinimized && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-sm xl:bottom-6"
            >
              <button
                type="button"
                onClick={() => setRepMinimized(false)}
                className="w-full overflow-hidden rounded-[32px] border border-[#f1d58d]/30 bg-[#12213d] p-1 shadow-2xl active:brightness-110"
              >
                <div className="flex items-center gap-4 rounded-[28px] bg-[linear-gradient(135deg,#1b2947_0%,#12213d_100%)] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0d08a]/10 text-[#f0d08a]">
                    <CircleDot className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ccb780]">REP em andamento</div>
                    <div className="text-sm font-black text-[#f0d08a]">{examType}</div>
                  </div>
                  <div className="rounded-xl bg-[#f1d58d] px-4 py-2 text-xs font-black text-[#12213d]">
                    VOLTAR
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom Tab Bar (mobile) — oculta quando tela cheia está aberta ── */}
        {!typePickerOpen && !(examType !== null && !repMinimized) && !photosOpen && !profileView && (
          <BottomTabBar active={activeSection} onChange={setActiveSection} />
        )}

        {/* ── Menu Mobile ── */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 top-0 z-[100] w-[300px] bg-[#0d1a31] lg:hidden"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div className="flex items-center">
                      <img src={logoEscudo} alt="BalísticaDB" className="h-11 w-auto object-contain" style={{ marginRight: "-12px" }} />
                      <span style={{ paddingLeft: "6px" }} className="text-xl font-black text-[#f0d08a]">BalísticaDB</span>
                    </div>
                    <button onClick={() => setMenuOpen(false)} className="text-white/60">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <SidebarContent
                      activeSection={activeSection}
                      onSectionChange={(s) => { setActiveSection(s); setMenuOpen(false) }}
                      onOpenProfile={() => { setMenuOpen(false); setProfileView("main") }}
                    />
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>


        {/* ── Formulário do REP ── */}
        <AnimatePresence>
          {examType !== null && !repMinimized && (
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed inset-0 z-[60] overflow-y-auto"
            >
              <div className="min-h-full bg-[#f5efe3] text-[#26221b]">
                {/* header */}
                <div className="sticky top-0 z-10 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setRepMinimized(true)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#8e7340] bg-[#12213d] text-[#f0d08a] active:bg-[#1a2c4f]">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <div className="text-lg font-black text-[#f0d08a]">Nova REP</div>
                        <div className="inline-block rounded-full bg-[#f0d08a]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#f0d08a]">{examType}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setRepMinimized(true)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#8e7340] bg-[#12213d] text-[#f0d08a] active:bg-[#1a2c4f]">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* conteúdo */}
                <div className="space-y-6 p-5 md:p-8 max-w-[860px] mx-auto">

                  {/* Identificação */}
                  <div>
                    <div className="mb-6 border-b border-[#d3c3a4] pb-3 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Identificação do exame
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número do exame</label>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                          <input value={form.examNumber} onChange={handleField("examNumber")}
                            onKeyDown={e => e.key === 'Enter' && handleImportarGdl()}
                            placeholder="Nº REP"
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm" />
                        </div>
                        <span className="text-2xl font-black text-[#9e7f45]">/</span>
                        <div className="relative shrink-0">
                          <select value={form.examYear} onChange={e => setForm(f => ({ ...f, examYear: e.target.value }))}
                            className="h-14 w-auto appearance-none rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] pl-3 pr-8 text-[16px] text-center outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm cursor-pointer">
                            {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                              <option key={y} value={String(y)}>{y}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e7f45]" />
                        </div>
                        <button type="button" onClick={handleImportarGdl}
                          disabled={repGdlCarregando || !form.examNumber.trim()}
                          className="flex h-14 items-center gap-1.5 rounded-2xl bg-[#12213d] px-4 text-[13px] font-black text-[#f0d08a] shadow-sm disabled:opacity-40 active:bg-[#1a2c4f]">
                          {repGdlCarregando
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Database className="h-4 w-4" />}
                          {repGdlCarregando ? 'Buscando…' : 'Buscar'}
                        </button>
                      </div>
                      {repGdlErro && (
                        <div className="mt-1.5 text-[12px] font-semibold text-red-600">{repGdlErro}</div>
                      )}
                    </div>

                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número do caso</label>
                        <div className="relative">
                          <Database className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7854]" />
                          <input value={form.caseNumber} onChange={handleField("caseNumber")}
                            placeholder="Ex.: 12345"
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] pl-10 pr-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Peças salvas */}
                  {savedPieces.length > 0 && (
                    <div>
                      <div className="mb-3 border-b border-[#d3c3a4] pb-2 text-[13px] font-black uppercase tracking-[0.18em] text-[#50442f]">
                        Peças do exame
                      </div>
                      <div className="space-y-1.5">
                        {savedPieces.map((p, i) => (
                          <div key={i} className="overflow-hidden rounded-xl border border-[#ddd0b3] bg-white shadow-sm">
                            <div className="flex items-stretch">
                              <button
                                type="button"
                                onClick={() => openEditPiece(i)}
                                className="flex flex-1 items-center gap-2.5 px-3 py-2.5 text-left transition active:bg-[#f5efe3]"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[#f0d08a]">
                                  <PieceIcon type={p.type} className="h-4 w-auto max-w-[22px]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b89a58]">{p.type}</div>
                                    {validarCamposGdlPeca(p).length > 0 && (
                                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c87070]" />
                                    )}
                                  </div>
                                  <div className="truncate text-[13px] font-black leading-tight text-[#26221b]">
                                    {p.brand || <span className="font-medium italic text-[#b8a070]">Não identificado</span>}
                                  </div>
                                  {p.model && p.model !== "" && (
                                    <div className="truncate text-[11px] text-[#6b5838]">{p.model}</div>
                                  )}
                                </div>
                                <Pencil className="h-3.5 w-3.5 shrink-0 text-[#c8a96e]" />
                              </button>
                              <div className="my-2 w-px shrink-0 bg-[#e8dfc8]" />
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePieceIdx(i)}
                                className="flex w-10 shrink-0 items-center justify-center text-[#c87070] transition active:bg-[#fdf0f0]"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="border-t border-[#f0e8d8] bg-[#fdfaf5] px-3 py-1.5">
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                {p.identificacao && <span className="text-[10px] text-[#9e8255]">Identificação: <span className="font-black text-[#50442f]">{p.identificacao}</span></span>}
                                <span className="text-[10px] text-[#9e8255]">Série: <span className="font-black text-[#50442f]">{p.serial || <span className="italic text-[#c4ac82]">—</span>}</span></span>
                                {p.tipoMira && p.tipoMira.length > 0 && <span className="text-[10px] text-[#9e8255]">Mira: <span className="font-black text-[#50442f]">{p.tipoMira.join(", ")}</span></span>}
                                {p.tipoCarregador && p.tipoCarregador.length > 0 && <span className="text-[10px] text-[#9e8255]">Carregador: <span className="font-black text-[#50442f]">{p.tipoCarregador.join(", ")}{p.capacidadeCarregador ? ` · ${p.capacidadeCarregador}` : ""}</span></span>}
                              </div>
                            </div>


                            {/* ── Coleta de Padrão por peça ── */}
                            {p.coletaSalva ? (
                              /* Estado salvo — card inteiro clicável para editar */
                              <button type="button"
                                onClick={() => { updateColeta(i, "coletaSalva", false); setColetaActivePieceIdx(i) }}
                                className="w-full border-t border-[#e8dfc8] bg-[#f5efe3] px-3 py-2.5 text-left transition active:bg-[#ece6da]">
                                <div className="flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Coleta de Padrão</div>
                                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0">
                                      {p.coletaNumero && <span className="text-[11px] font-black text-[#50442f]">Nº {p.coletaNumero}</span>}
                                      <span className="text-[11px] text-[#6b5838]">REP {form.examNumber || "—"}/{p.coletaRepAno || form.examYear}</span>
                                      {p.coletaQtdProjeteis && <span className="text-[11px] text-[#6b5838]">{p.coletaQtdProjeteis} proj.</span>}
                                      {p.coletaQtdEstojos   && <span className="text-[11px] text-[#6b5838]">{p.coletaQtdEstojos} est.</span>}
                                    </div>
                                  </div>
                                  <Pencil className="ml-2 h-3.5 w-3.5 shrink-0 text-[#c8a96e]" />
                                </div>
                              </button>
                            ) : (
                              /* Estado edição — formulário completo */
                              <>
                                <button type="button"
                                  onClick={() => setColetaActivePieceIdx(coletaActivePieceIdx === i ? null : i)}
                                  className="flex w-full items-center justify-between border-t border-[#e8dfc8] bg-[#f5efe3] px-3 py-2.5 transition active:bg-[#ece6da]">
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-3.5 w-3.5 text-[#9e7f45]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Adicionar coleta de padrão</span>
                                  </div>
                                  <ChevronDown className={`h-3.5 w-3.5 text-[#9e7f45] transition-transform ${coletaActivePieceIdx === i ? "rotate-180" : ""}`} />
                                </button>

                                {coletaActivePieceIdx === i && (
                                  <div className="border-t border-[#e8dfc8] bg-[#fdfaf5] px-3 pb-4 pt-3 space-y-4">

                                    {/* Chips pré-preenchidos da peça */}
                                    <div className="flex flex-wrap gap-1.5">
                                      {p.caliber && <span className="rounded-full bg-[#e8dfc8] px-2.5 py-1 text-[11px] font-black text-[#50442f]">{p.caliber}</span>}
                                      {p.brand   && <span className="rounded-full bg-[#e8dfc8] px-2.5 py-1 text-[11px] font-bold text-[#6b5838]">{p.brand}</span>}
                                      {p.model   && <span className="rounded-full bg-[#e8dfc8] px-2.5 py-1 text-[11px] text-[#6b5838]">{p.model}</span>}
                                    </div>

                                    {/* Nº coleta + Ano REP independente */}
                                    <div className="flex gap-2">
                                      <div className="flex-1">
                                        <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#8d7854]">Nº da coleta</label>
                                        <input value={p.coletaNumero} onChange={e => updateColeta(i, "coletaNumero", e.target.value)}
                                          placeholder="Ex.: 001"
                                          className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-white px-3 text-[15px] outline-none focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                                      </div>
                                      <div className="w-28">
                                        <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#8d7854]">Ano REP</label>
                                        <div className="relative">
                                          <select value={p.coletaRepAno || form.examYear}
                                            onChange={e => updateColeta(i, "coletaRepAno", e.target.value)}
                                            className="h-11 w-full appearance-none rounded-xl border border-[#cdbf9e] bg-white pl-3 pr-7 text-[14px] outline-none focus:border-[#9e7f45] cursor-pointer">
                                            {Array.from({ length: 11 }, (_, k) => new Date().getFullYear() - 5 + k).map(y => (
                                              <option key={y} value={String(y)}>{y}</option>
                                            ))}
                                          </select>
                                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9e7f45]" />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Munições utilizadas */}
                                    <div>
                                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[#8d7854]">Munições utilizadas</label>
                                      <div className="space-y-1.5">
                                        {([
                                          ["TODAS",      "Todas as munições que acompanham o material"],
                                          ["AMOSTRAGEM", "Amostragem das munições do material"],
                                          ["MISTA",      "Munições do material + munições próprias da unidade"],
                                          ["PROPRIA",    "Apenas munições próprias da unidade"],
                                        ] as const).map(([val, label]) => {
                                          const sel = p.coletaMunicaoTipo === val
                                          return (
                                            <button key={val} type="button"
                                              onClick={() => updateColeta(i, "coletaMunicaoTipo", sel ? "" : val)}
                                              className={cn("flex w-full items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 text-left transition active:scale-[0.99]",
                                                sel ? "border-[#7d6334] bg-[#7d6334]/10" : "border-[#d3c4a8] bg-white")}>
                                              <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                                                sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white")}>
                                                {sel && <svg viewBox="0 0 10 10" className="h-2 w-2"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                                              </span>
                                              <span className={`text-[12px] font-bold leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{label}</span>
                                            </button>
                                          )
                                        })}
                                      </div>
                                    </div>

                                    {/* Quantidades */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#8d7854]">Qtd. projéteis</label>
                                        <button type="button"
                                          onClick={() => { setColetaActivePieceIdx(i); setTipoMunicaoCustom(p.coletaQtdProjeteis); setColetaQtdProjeteisPicker(true) }}
                                          className="flex h-11 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-white px-3 text-left active:bg-[#f0e8d0]">
                                          <span className={`text-[13px] ${p.coletaQtdProjeteis ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>{p.coletaQtdProjeteis || "Selecionar…"}</span>
                                          <ChevronRight className="h-4 w-4 text-[#b89a58]" />
                                        </button>
                                      </div>
                                      <div>
                                        <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#8d7854]">Qtd. estojos</label>
                                        <button type="button"
                                          onClick={() => { setColetaActivePieceIdx(i); setTipoMunicaoCustom(p.coletaQtdEstojos); setColetaQtdEstojosPicker(true) }}
                                          className="flex h-11 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-white px-3 text-left active:bg-[#f0e8d0]">
                                          <span className={`text-[13px] ${p.coletaQtdEstojos ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>{p.coletaQtdEstojos || "Selecionar…"}</span>
                                          <ChevronRight className="h-4 w-4 text-[#b89a58]" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Projétil e Estojo — botões sheet */}
                                    <div className="grid grid-cols-2 gap-2 items-end">
                                      {([
                                        ["Tipo do projétil",     p.coletaTipoProjetil,     () => { setColetaActivePieceIdx(i); setColetaTipoProjetilPicker(true) }],
                                        ["Material do projétil", p.coletaMaterialProjetil, () => { setColetaActivePieceIdx(i); setColetaMaterialProjetilPicker(true) }],
                                        ["Tipo do estojo",       p.coletaTipoEstojo,       () => { setColetaActivePieceIdx(i); setColetaTipoEstojoPicker(true) }],
                                        ["Material do estojo",   p.coletaMaterialEstojo,   () => { setColetaActivePieceIdx(i); setColetaMaterialEstojoPicker(true) }],
                                      ] as [string, string, () => void][]).map(([label, value, open]) => (
                                        <div key={label} className="flex flex-col">
                                          <label className="mb-1.5 flex-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#8d7854] leading-tight">{label}</label>
                                          <button type="button" onClick={open}
                                            className="flex h-11 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-white px-3 text-left transition active:bg-[#f0e8d0]">
                                            <span className={`truncate text-[13px] ${value ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>{value || "Selecionar…"}</span>
                                            <ChevronRight className="ml-1 h-4 w-4 shrink-0 text-[#b89a58]" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Lacre de saída */}
                                    <LacreInput
                                      label="Lacre de Saída (coleta)"
                                      slotKey={`coleta-${i}-lacre`}
                                      value={p.coletaLacreSaida}
                                      onChange={v => updateColeta(i, "coletaLacreSaida", v)}
                                      allPhotoUrls={coletaPhotoUrls}
                                      onCapture={handleColetaPhotoCapture}
                                      onRemove={handleColetaPhotoRemove}
                                      onView={setViewerPhoto}
                                      placeholder="Nº do lacre de saída"
                                    />

                                    {/* Fotos */}
                                    <div>
                                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-[#8d7854]">Fotos</label>
                                      <div className="grid grid-cols-2 gap-2">
                                        <PhotoSlot slotKey={`coleta-${i}-material`}   label="Material coletado"  photoUrl={coletaPhotoUrls.get(`coleta-${i}-material`)}   onCapture={handleColetaPhotoCapture} onRemove={handleColetaPhotoRemove} onView={setViewerPhoto} />
                                        <PhotoSlot slotKey={`coleta-${i}-emb-frente`} label="Embalagem (frente)" photoUrl={coletaPhotoUrls.get(`coleta-${i}-emb-frente`)} onCapture={handleColetaPhotoCapture} onRemove={handleColetaPhotoRemove} onView={setViewerPhoto} />
                                        <PhotoSlot slotKey={`coleta-${i}-emb-verso`}  label="Embalagem (verso)"  photoUrl={coletaPhotoUrls.get(`coleta-${i}-emb-verso`)}  onCapture={handleColetaPhotoCapture} onRemove={handleColetaPhotoRemove} onView={setViewerPhoto} />
                                      </div>
                                    </div>

                                    {/* Botão Salvar */}
                                    <button type="button"
                                      onClick={() => { updateColeta(i, "coletaSalva", true); setColetaActivePieceIdx(null) }}
                                      className="w-full rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-3.5 text-sm font-black tracking-[0.16em] text-[#f0d08a] shadow-[0_8px_20px_rgba(0,0,0,.25)] transition hover:brightness-110">
                                      SALVAR COLETA
                                    </button>

                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Informações Gerais ── */}
                  {(form.solicitante || form.naturezaExame || form.enderecoExame || form.oficio || form.ipApfd || form.processo) && (
                    <div className="overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => setInfoGeraisOpen(v => !v)}
                        className="flex h-14 w-full items-center justify-between px-4 active:bg-[#f5efe3]"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full transition-colors ${infoGeraisOpen ? "bg-[#9e7f45]" : "bg-[#cdbf9e]"}`} />
                          <span className="text-[13px] font-black uppercase tracking-[0.18em] text-[#50442f]">Informações Gerais</span>
                        </div>
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${infoGeraisOpen ? "bg-[#1b2947]" : "bg-[#ece6da]"}`}>
                          <ChevronDown className={`h-5 w-5 transition-all duration-200 ${infoGeraisOpen ? "rotate-180 text-[#f0d08a]" : "rotate-0 text-[#8d7854]"}`} />
                        </div>
                      </button>
                      <AnimatePresence initial={false}>
                        {infoGeraisOpen && (
                          <motion.div
                            key="info-gerais-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-4 px-4 pb-4 pt-3">
                              {/* Natureza do exame — somente leitura */}
                              {form.naturezaExame && (
                                <div>
                                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#9e8255]">Natureza do exame</label>
                                  <div className="flex h-12 items-center rounded-xl border border-[#e0d5be] bg-[#f5f0e8] px-4 text-[13px] font-medium text-[#6b5838]">{form.naturezaExame}</div>
                                </div>
                              )}
                              <div className="grid gap-4 sm:grid-cols-2">
                                {([
                                  ["solicitante",        "Solicitante"],
                                  ["remetenteOrgao",     "Órgão remetente"],
                                  ["remetenteCidade",    "Cidade remetente"],
                                  ["naturezaOcorrencia", "Natureza da ocorrência"],
                                  ["oficio",             "Ofício requisitante"],
                                  ["ipApfd",             "IP / APFD"],
                                  ["processo",           "Processo"],
                                ] as [keyof typeof form, string][]).map(([key, label]) => (
                                  <div key={key}>
                                    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#9e8255]">{label}</label>
                                    <input
                                      value={form[key] as string}
                                      onChange={handleField(key)}
                                      className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[13px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="grid gap-4 grid-cols-[1fr_0.55fr_2fr]">
                                {([
                                  ["dataEntrada",  "Data de entrada"],
                                  ["horaEntrada",  "Hora"],
                                  ["enderecoExame","Endereço do exame"],
                                ] as [keyof typeof form, string][]).map(([key, label]) => (
                                  <div key={key}>
                                    <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.14em] text-[#9e8255]">{label}</label>
                                    <input
                                      value={form[key] as string}
                                      onChange={handleField(key)}
                                      className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[13px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Tipo de peça */}
                  <div>
                    <div className="mb-3 border-b border-[#d3c3a4] pb-3 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Tipo de peça
                    </div>

                    {/* Grupo helper */}
                    {([
                      {
                        key: "firearms",
                        label: "Armas de fogo",
                        open: showGroupFirearms,
                        toggle: () => setShowGroupFirearms(o => !o),
                        types: ["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","ARMA DE ANTECARGA"] as WeaponType[],
                      },
                      {
                        key: "ammo",
                        label: "Munição e componentes",
                        open: showGroupAmmo,
                        toggle: () => setShowGroupAmmo(o => !o),
                        types: ["PROJÉTIL","CARTUCHO","ESTOJO","ESPOLETA","PÓLVORA","CARREGADOR"] as WeaponType[],
                      },
                      {
                        key: "others",
                        label: "Outras armas",
                        open: showGroupOthers,
                        toggle: () => setShowGroupOthers(o => !o),
                        types: ["FACA","ARMA DE PRESSÃO","ARMA DE CHOQUE"] as WeaponType[],
                      },
                    ]).map(({ key, label, open, toggle, types }) => (
                      <div key={key} className="mb-3 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                        {/* Header — área de toque grande */}
                        <button
                          type="button"
                          onClick={toggle}
                          className="flex h-14 w-full items-center justify-between px-4 active:bg-[#f5efe3]"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full transition-colors ${open ? "bg-[#9e7f45]" : "bg-[#cdbf9e]"}`} />
                            <span className="text-[13px] font-black uppercase tracking-[0.18em] text-[#50442f]">{label}</span>
                          </div>
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${open ? "bg-[#1b2947]" : "bg-[#ece6da]"}`}>
                            <ChevronDown className={`h-5 w-5 transition-all duration-200 ${open ? "rotate-180 text-[#f0d08a]" : "rotate-0 text-[#8d7854]"}`} />
                          </div>
                        </button>

                        {/* Conteúdo colapsável */}
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              key={`content-${key}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-3 p-3 pt-0">
                                {types.map((type) => (
                                  <button key={type} type="button"
                                    onClick={() => { setWeaponType(type); setWeapons([makeWeaponEntry(type)]); setActiveWeaponIdx(0); setPieceFormOpen(true) }}
                                    className="flex min-h-[52px] items-center justify-center rounded-xl border-2 border-[#e8dfc8] bg-[#fdfaf4] px-2 py-3 text-center transition active:scale-[.96] active:bg-[#ece6da]"
                                  >
                                    <span className="text-[12px] font-black uppercase leading-tight tracking-[0.05em] text-[#1a1410]">{type}</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}

                  </div>

                  {/* Observações */}
                  <div>
                    <div className="mb-6 border-b border-[#d3c3a4] pb-3 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Observações
                    </div>
                    <textarea value={form.observacoes} onChange={handleField("observacoes")}
                      className="min-h-[140px] w-full rounded-[24px] border border-[#cdbf9e] bg-[#fbf8f2] px-5 py-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                      placeholder="Inserir observações técnicas, estado geral, particularidades e demais elementos relevantes." />
                  </div>

                  {/* Footer */}
                  <div className="border-t border-[#d3c3a4] pt-5 flex gap-3">
                    <button
                      onClick={() => setConfirmDeleteRep(true)}
                      className="flex-1 rounded-2xl border-2 border-[#b03030] bg-[linear-gradient(180deg,#8b2020_0%,#5c1515_100%)] py-4 text-sm font-black tracking-[0.14em] text-[#ffd4d4] shadow-[0_8px_20px_rgba(120,20,20,.30)] transition active:brightness-95">
                      EXCLUIR
                    </button>
                    <button
                      onClick={handleAtualizarTodasPecasGdl}
                      disabled={atualizandoPecas || savedPieces.length === 0}
                      className="flex-1 rounded-2xl border-2 border-[#1b3a6b] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-4 text-sm font-black tracking-[0.10em] text-[#f0d08a] shadow-[0_8px_20px_rgba(20,40,100,.30)] transition active:brightness-95 disabled:opacity-50">
                      {atualizandoPecas ? "..." : "ATUALIZAR GDL"}
                    </button>
                    <button
                      onClick={handleSalvarExame}
                      disabled={salvouExame}
                      className="flex-[2] rounded-2xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#6e572f_0%,#49391f_100%)] py-4 text-sm font-black tracking-[0.18em] text-[#f8e3b3] shadow-[0_12px_24px_rgba(66,50,24,.22)] transition active:brightness-95 disabled:opacity-70">
                      {salvouExame ? (modoEdicao ? "ATUALIZADO ✓" : "SALVO ✓") : (modoEdicao ? "ATUALIZAR EXAME" : "SALVAR EXAME")}
                    </button>
                  </div>

                  {/* Confirm delete dialog */}
                  <AnimatePresence>
                    {confirmDeleteRep && (
                      <>
                        <motion.div
                          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => setConfirmDeleteRep(false)}
                        />
                        <motion.div
                          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center p-4 sm:p-6"
                          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                          transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        >
                          <div className="w-full max-w-xs rounded-3xl border border-[#e8c0c0] bg-[#f5efe3] shadow-[0_32px_80px_rgba(0,0,0,.55)] overflow-hidden">
                            <div className="bg-[linear-gradient(180deg,#2e1414_0%,#1a0a0a_100%)] px-6 py-5">
                              <div className="text-xl font-black text-[#ffb3b3]">Excluir exame?</div>
                              <div className="mt-1 text-xs leading-relaxed text-[#e08080]">Esta ação não pode ser desfeita. Todas as peças adicionadas serão perdidas.</div>
                            </div>
                            <div className="flex gap-3 p-4">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRep(false)}
                                className="flex-1 rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#6b5838] active:brightness-95"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteRep(false)
                                  resetFullExam()
                                }}
                                className="flex-1 rounded-2xl border-2 border-[#b03030] bg-[linear-gradient(180deg,#8b2020_0%,#5c1515_100%)] py-4 text-sm font-black uppercase tracking-[0.12em] text-[#ffd4d4] active:brightness-90"
                              >
                                Sim, excluir
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tela de detalhes da peça ── */}
        <AnimatePresence>
          {pieceFormOpen && weaponType && (
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
              className="fixed inset-0 z-[70] overflow-y-auto"
            >
              <div className="min-h-full bg-[#f5efe3] text-[#26221b]">
                <div className="sticky top-0 z-10 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => { resetPieceForm() }}
                        className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a] hover:bg-[#1a2c4f]"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-xl font-black text-[#f0d08a]">{weaponType}</div>
                          {activeWeapon?.idPeca && (
                            <span className="rounded-full border border-[#f0d08a]/40 bg-[#f0d08a]/15 px-2 py-0.5 text-[10px] font-black tracking-[0.18em] text-[#f0d08a]">
                              ID {activeWeapon.idPeca}
                            </span>
                          )}
                        </div>
                        <div className="text-xs uppercase tracking-[0.22em] text-[#ccb780]">
                          {editingPieceIdx !== null ? `Editando peça ${editingPieceIdx + 1}` : "Dados da peça"}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { resetPieceForm() }}
                      className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a] hover:bg-[#1a2c4f]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6 p-5 md:p-8 max-w-[860px] mx-auto">
                  {/* ── Tipo de peça ── */}
                  <div className="flex items-center gap-4 rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(135deg,#1b2947_0%,#12213d_100%)] px-5 py-4 shadow-[0_6px_22px_rgba(0,0,0,.28)]">
                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-[#0f1e39] p-3 text-[#f0d08a]">
                      <PieceIcon type={weaponType} className="h-12 w-auto max-w-[80px]" />
                    </div>
                    {/* Tipo — clicável para trocar */}
                    <button
                      type="button"
                      onClick={() => setChangePieceTypeOpen(true)}
                      className="flex-1 text-left active:opacity-70"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ccb780]">Tipo de peça</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black uppercase tracking-[0.1em] text-[#f0d08a]">{weaponType}</span>
                        <Pencil className="h-3 w-3 text-[#f0d08a]/50" />
                      </div>
                    </button>
                    {/* ID — apenas exibição */}
                    {activeWeapon?.idPeca && (
                      <div className="flex flex-col items-center rounded-xl border border-[#f0d08a]/30 bg-[#0f1e39] px-3 py-2 min-w-[44px]">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ccb780]">ID</span>
                        <span className="text-xl font-black text-[#f0d08a]">{activeWeapon.idPeca}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                  <div className="space-y-3">
                    {/* Institucional — armas de fogo, pressão e antecarga */}
                    {(["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","ARMA DE PRESSÃO","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                      <div className="overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                        <div className="border-b border-[#e8dfc8] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-4 py-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#ccb780]">
                            Vínculo da arma
                            <span className="text-[#c87070] text-[11px] font-black leading-none">*</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-[#e8dfc8]">
                          {([
                            { v: true,  icon: <Building2 className="h-5 w-5" />, l: "Institucional", s: "Órgão público" },
                            { v: false, icon: <User2     className="h-5 w-5" />, l: "Particular",    s: "Pessoa física / privada" },
                          ] as { v: boolean; icon: React.ReactNode; l: string; s: string }[]).map(({ v, icon, l, s }) => {
                            const sel = activeWeapon?.institucional === v
                            return (
                              <button key={String(v)} type="button"
                                onClick={() => setWeaponDirect("institucional", sel ? null : v)}
                                className={cn(
                                  "flex flex-col items-center gap-2 px-4 py-5 transition active:scale-[0.97]",
                                  sel ? "bg-[#7d6334]/10" : "bg-white hover:bg-[#fbf8f2]"
                                )}>
                                <div className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
                                  sel ? "border-[#7d6334] bg-[#7d6334] text-white shadow-md" : "border-[#d3c4a8] bg-[#f5efe3] text-[#8d7854]"
                                )}>
                                  {icon}
                                </div>
                                <div className="text-center">
                                  <div className={`text-[13px] font-black leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{l}</div>
                                  <div className="mt-0.5 text-[11px] text-[#a08c68]">{s}</div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Estado do Projétil */}
                    {activeWeapon?.type === "PROJÉTIL" && (
                      <div className="rounded-2xl border border-[#d3c4a8] bg-white px-4 py-4 shadow-sm">
                        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Estado do projétil</div>
                        <div className="grid grid-cols-2 gap-2">
                          {(["ÍNTEGRO", "DEFLAGRADO"] as const).map((op) => {
                            const isSelected = activeWeapon?.estadoProjetil === op;
                            return (
                              <button
                                key={op}
                                type="button"
                                onClick={() => setWeaponDirect("estadoProjetil", isSelected ? "" : op)}
                                className={cn(
                                  "rounded-xl border-2 py-3 text-sm font-black tracking-[0.12em] transition active:scale-[0.98]",
                                  isSelected
                                    ? "border-[#7d6334] bg-[#7d6334] text-white shadow-md"
                                    : "border-[#d3c4a8] bg-[#fbf8f2] text-[#6b5838] hover:bg-[#f5efe3]"
                                )}
                              >
                                {op}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}


                    {/* Estado do Cartucho — ÍNTEGRO / PERCUTIDO */}
                    {activeWeapon?.type === "CARTUCHO" && (
                      <div className="rounded-2xl border border-[#d3c4a8] bg-white px-4 py-4 shadow-sm">
                        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Estado do cartucho</div>
                        <div className="grid grid-cols-2 gap-2">
                          {(["ÍNTEGRO", "PERCUTIDO"] as const).map((op) => {
                            const isSelected = activeWeapon?.estadoCartucho === op;
                            return (
                              <button
                                key={op}
                                type="button"
                                onClick={() => setWeaponDirect("estadoCartucho", isSelected ? "" : op)}
                                className={cn(
                                  "rounded-xl border-2 py-3 text-sm font-black tracking-[0.12em] transition active:scale-[0.98]",
                                  isSelected
                                    ? "border-[#7d6334] bg-[#7d6334] text-white shadow-md"
                                    : "border-[#d3c4a8] bg-[#fbf8f2] text-[#6b5838] hover:bg-[#f5efe3]"
                                )}
                              >
                                {op}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Estado do Estojo — ÍNTEGRO / PERCUTIDO */}
                    {activeWeapon?.type === "ESTOJO" && (
                      <div className="rounded-2xl border border-[#d3c4a8] bg-white px-4 py-4 shadow-sm">
                        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Estado do estojo</div>
                        <div className="grid grid-cols-2 gap-2">
                          {(["ÍNTEGRO", "PERCUTIDO"] as const).map((op) => {
                            const isSelected = activeWeapon?.estadoEstojo === op;
                            return (
                              <button
                                key={op}
                                type="button"
                                onClick={() => setWeaponDirect("estadoEstojo", isSelected ? "" : op)}
                                className={cn(
                                  "rounded-xl border-2 py-3 text-sm font-black tracking-[0.12em] transition active:scale-[0.98]",
                                  isSelected
                                    ? "border-[#7d6334] bg-[#7d6334] text-white shadow-md"
                                    : "border-[#d3c4a8] bg-[#fbf8f2] text-[#6b5838] hover:bg-[#f5efe3]"
                                )}
                              >
                                {op}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Origem — universal para todos os tipos */}
                    {(() => {
                      const origemLabel: Record<WeaponType, string> = {
                        "PROJÉTIL":    "Origem de coleta do projétil",
                        "CARTUCHO":    "Origem de coleta do cartucho",
                        "ESTOJO":      "Origem de coleta do estojo",
                        "FACA":        "Origem de coleta da faca",
                        "ARMA DE PRESSÃO":    "Origem de coleta da arma de pressão",
                        "ARMA DE ANTECARGA":  "Origem de coleta da arma de antecarga",
                        "REVÓLVER":        "Origem de coleta do revólver",
                        "PISTOLA":         "Origem de coleta da pistola",
                        "PISTOLETE":       "Origem de coleta do pistolete",
                        "GARRUCHA":        "Origem de coleta da garrucha",
                        "ESPINGARDA":      "Origem de coleta da espingarda",
                        "CARABINA":        "Origem de coleta da carabina",
                        "FUZIL":           "Origem de coleta do fuzil",
                        "METRALHADORA":    "Origem de coleta da metralhadora",
                        "SUBMETRALHADORA": "Origem de coleta da submetralhadora",
                        "ARMA DE CHOQUE":  "Origem de coleta da arma de choque",
                        "PÓLVORA":         "Origem de coleta da pólvora",
                        "ESPOLETA":        "Origem de coleta da espoleta",
                        "CARREGADOR":      "Origem de coleta do carregador",
                      }
                      const label = origemLabel[activeWeapon?.type as WeaponType] ?? "Origem"
                      return (
                        <div className="rounded-2xl border border-[#d3c4a8] bg-white px-4 py-4 shadow-sm">
                          <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#8d7854]">{label}</div>
                          <div className={`grid gap-2 ${(["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","PÓLVORA","ESPOLETA","CARREGADOR","ARMA DE PRESSÃO","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) ? "grid-cols-2" : "grid-cols-3"}`}>
                            {(
                              (["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","PÓLVORA","ESPOLETA","CARREGADOR","ARMA DE PRESSÃO","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType)
                                ? [
                                    { id: "DELEGACIA", label: "Delegacia", Icon: Building2 },
                                    { id: "LOCAL",     label: "Local",     Icon: MapPin    },
                                  ]
                                : [
                                    { id: "DELEGACIA", label: "Delegacia", Icon: Building2  },
                                    { id: "LOCAL",     label: "Local",     Icon: MapPin     },
                                    { id: "NECROPSIA", label: "Necropsia", Icon: Microscope },
                                  ]
                            ).map(({ id, label, Icon }) => {
                              const active = activeWeapon?.origemProjetil === id
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => setWeaponDirect("origemProjetil", active ? "" : id)}
                                  className={cn(
                                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-3 px-1 transition active:scale-95",
                                    active
                                      ? "border-[#7d6334] bg-[#7d6334] text-white shadow-md"
                                      : "border-[#d3c4a8] bg-[#fbf8f2] text-[#6b5838] hover:bg-[#f5efe3]"
                                  )}
                                >
                                  <Icon className={cn("h-6 w-6", active ? "text-white" : "text-[#9e7f45]")} />
                                  <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
                                </button>
                              )
                            })}
                          </div>
                          {activeWeapon?.origemProjetil === "LOCAL" && (
                            <div className="mt-3 space-y-3 border-t border-[#ede3ce] pt-3">
                              <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Referência do local</label>
                                <input
                                  value={String(activeWeapon?.origemProjetilRef ?? "")}
                                  onChange={handleWeaponField("origemProjetilRef" as keyof Omit<WeaponEntry,"type">)}
                                  className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                                  placeholder="Ex.: REP 138.740/2025"
                                />
                              </div>
                              <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Região da coleta</label>
                                <input
                                  value={String(activeWeapon?.regiaoColeta ?? "")}
                                  onChange={handleWeaponField("regiaoColeta" as keyof Omit<WeaponEntry,"type">)}
                                  className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                                  placeholder="Ex.: Interior do imóvel (#3)"
                                />
                              </div>
                            </div>
                          )}
                          {activeWeapon?.type === "CARTUCHO" && (
                            <div className="mt-3 border-t border-[#ede3ce] pt-3">
                              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Natureza da munição</div>
                              <div className="space-y-2">
                                {([
                                  { v: "Industrial",    d: "Fabricada em linha industrial por empresa homologada" },
                                  { v: "Recarga",       d: "Montada artesanalmente com componentes avulsos" },
                                  { v: "Indeterminado", d: "Não foi possível determinar a origem" },
                                ] as {v:string;d:string}[]).map(({v,d}) => {
                                  const sel = activeWeapon?.origemMunicao === v
                                  return (
                                    <button key={v} type="button"
                                      onClick={() => setWeaponDirect("origemMunicao", sel ? "" : v)}
                                      className={cn(
                                        "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                                        sel ? "border-[#7d6334] bg-[#7d6334]/10" : "border-[#d3c4a8] bg-[#fbf8f2]"
                                      )}>
                                      <span className={cn(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                                        sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"
                                      )}>
                                        {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                                      </span>
                                      <div className="min-w-0">
                                        <div className={`text-[13px] font-black leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{v}</div>
                                        <div className="text-[11px] text-[#a08c68]">{d}</div>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          {activeWeapon?.type === "ARMA DE PRESSÃO" && (
                            <div className="mt-3 border-t border-[#ede3ce] pt-3">
                              <div className="mb-2.5 flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#8d7854]">
                                Adaptada para arma de fogo?
                                <HelpBtn title="Adaptada para arma de fogo?" text="Indica se a arma de pressão foi modificada ou convertida para realizar disparos com munição de fogo real (pólvora). A adaptação é crime previsto no Estatuto do Desarmamento e altera o enquadramento pericial da peça." />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {([["Sim", true], ["Não", false]] as [string, boolean][]).map(([label, val]) => {
                                  const active = activeWeapon?.adaptadaArmaFogo === val
                                  return (
                                    <button key={label} type="button"
                                      onClick={() => setWeaponDirect("adaptadaArmaFogo", active ? null : val)}
                                      className={`rounded-xl border-2 py-3 text-sm font-black uppercase tracking-[0.1em] transition active:scale-[.97] ${active ? "border-[#7d6334] bg-[#7d6334] text-white" : "border-[#d3c4a8] bg-[#fbf8f2] text-[#6b5838]"}`}>
                                      {label}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>

                  {/* ── Lacre de Entrada ── */}
                  <LacreInput
                    label="Lacre de Entrada"
                    gdlRequired
                    slotKey="lacre-entrada-form"
                    value={activeWeapon?.lacreEntradaPeca ?? lacreNumero}
                    onChange={v => { setLacreNumero(v); setWeaponDirect("lacreEntradaPeca" as any, v) }}
                    allPhotoUrls={photoUrls}
                    onCapture={handlePhotoCapture}
                    onRemove={handlePhotoRemove}
                    onView={setViewerPhoto}
                    placeholder="Nº do lacre de entrada"
                  />

                  {/* ── Data de Entrada ── */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                      Data de Entrada
                      <span className="text-[#c87070] text-[13px] font-black leading-none">*</span>
                    </label>
                    <input
                      type="text"
                      value={activeWeapon?.dataEntradaPeca ?? ""}
                      onChange={handleWeaponField("dataEntradaPeca" as any)}
                      className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                      placeholder="DD/MM/AAAA"
                    />
                  </div>

                  {/* ── Campos base ── */}
                  {!(["PROJÉTIL","PÓLVORA","ESPOLETA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && <div className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-3">
                      {/* Identificação — armas de fogo usam campo próprio; demais usam model */}
                      {(["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                        <div>
                          <label className="mb-2 flex items-center gap-1 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Identificação
                            <span className="text-[#c87070] text-[13px] font-black leading-none">*</span>
                            <HelpBtn title="Identificação" text="Designação ou referência de identificação do item. Ex.: RT 627, REP 001/2025." />
                            {(activeWeapon?.brand || activeWeapon?.model || activeWeapon?.caliber) && (
                              <button type="button" title="Preencher com Fabricante, Modelo e Calibre" style={{ marginLeft: "6px" }}
                                onClick={() => {
                                  const p = [activeWeapon?.brand, activeWeapon?.model, activeWeapon?.caliber].filter(Boolean)
                                  setWeaponDirect("identificacao" as any, p.join(' '))
                                }}
                                className="inline-flex h-8 w-8 md:h-6 md:w-6 items-center justify-center rounded-full bg-[#e8dfc8] text-[#7a6840] hover:bg-[#ddd0b3] active:bg-[#ccc0a0]">
                                <Wand2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                              </button>
                            )}
                          </label>
                          <input value={activeWeapon?.identificacao ?? ""} onChange={handleWeaponField("identificacao" as keyof Omit<WeaponEntry,"type">)}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: RT 627, REP 001/2025…" />
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && activeWeapon?.type !== "ARMA DE PRESSÃO" && !(["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                        <div>
                          <label className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            {activeWeapon?.type === "CARTUCHO" ? "Tipo" : "Identificação"}
                            {_MODEL_IDENT_GDL.includes(activeWeapon?.type as WeaponType) && (
                              <span className="text-[#c87070] text-[13px] font-black leading-none">*</span>
                            )}
                            <HelpBtn title={activeWeapon?.type === "CARTUCHO" ? "Tipo" : "Identificação"} text={
                              activeWeapon?.type === "ESTOJO" ? "Headstamp ou marcação identificadora do estojo. Ex.: CBC .38, RP 9mm." :
                              activeWeapon?.type === "CARTUCHO" ? "Tipo construtivo da munição. Ex.: FMJ (encamisado), HP (ponta oca), Slug (projétil único para espingarda)." :
                              "Designação ou referência de identificação do item."
                            } />
                          </label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder={activeWeapon?.type === "CARTUCHO" ? "Ex.: FMJ, HP, Slug…" : "Ex.: RT 627"} />
                        </div>
                      )}
                      {/* Fabricante e Modelo com Catálogo Integrado */}
                      {(["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","ARMA DE ANTECARGA","ESTOJO","CARTUCHO"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                        <>
                          {/* Picker Fabricante */}
                          <div>
                            <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                              Fabricante
                              <HelpBtn title="Fabricante" text="Empresa responsável pela fabricação. Toque para selecionar a partir do catálogo ou digite manualmente." />
                            </label>
                            <button
                              type="button"
                              onClick={() => setCatalogoMarcaPickerOpen(true)}
                              className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]"
                            >
                              <span className={`truncate text-[16px] ${activeWeapon?.brand ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>{activeWeapon?.brand || "Selecionar fabricante…"}</span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          
                          {/* Picker Modelo */}
                          <div>
                            <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                              Modelo
                              <HelpBtn title="Modelo" text="Designação comercial ou nomenclatura. Toque para selecionar a partir do catálogo ou digite manualmente." />
                            </label>
                            <button
                              type="button"
                              onClick={() => { if (activeWeapon?.brand) setCatalogoModeloPickerOpen(true) }}
                              className={`flex h-14 w-full items-center justify-between rounded-2xl border px-4 text-left shadow-sm transition ${activeWeapon?.brand ? "border-[#cdbf9e] bg-[#fbf8f2] focus:border-[#9e7f45]" : "border-[#e0d5bc] bg-[#f5f2eb] opacity-50 cursor-not-allowed"}`}
                            >
                              <span className={`truncate text-[16px] ${activeWeapon?.model ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                {activeWeapon?.model || (activeWeapon?.brand ? "Selecionar modelo…" : "Selecione o fabricante primeiro")}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>

                        </>
                      )}

                      {/* Cano sobressalente — apenas ESPINGARDA */}
                      {activeWeapon?.type === "ESPINGARDA" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Cano sobressalente
                            <HelpBtn title="Cano sobressalente" text="Cano adicional apreendido junto com a espingarda, com calibre nominal diferente do original. Registrado como informação complementar; não altera o calibre nominal da arma." />
                          </label>
                          <button type="button" onClick={() => setCanoSobresPickerOpen(true)}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.canoSobressalente ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.canoSobressalente
                                ? [
                                    activeWeapon.canoSobressalente,
                                    activeWeapon.canoSobressalenteComp,
                                    activeWeapon.canoSobressalenteQtd && `${activeWeapon.canoSobressalenteQtd} unid.`,
                                  ].filter(Boolean).join(" · ")
                                : "Sem cano sobressalente"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && activeWeapon?.type !== "ARMA DE PRESSÃO" && activeWeapon?.type !== "CARREGADOR" && activeWeapon?.type !== "ARMA DE ANTECARGA" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Calibre
                            <HelpBtn title="Calibre" text="Designação nominal da munição compatível com a arma ou peça. Ex.: .38 SPL, 9 mm Luger, 12 Ga. Para projéteis deflagrados, utilize o campo de diâmetro medido." />
                          </label>
                          <button type="button" onClick={() => {
                            if (activeWeapon?.type === "ARMA DE ANTECARGA") setCalibreAntecargaPickerOpen(true);
                            else setCalibrePickerOpen(true);
                          }}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.caliber ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.caliber || "Selecionar calibre…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      )}
                      {activeWeapon?.type !== "FACA" && activeWeapon?.type !== "ARMA DE PRESSÃO" && activeWeapon?.type !== "CARREGADOR" && activeWeapon?.type !== "ARMA DE ANTECARGA" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            País de fabricação
                            <HelpBtn title="País de fabricação" text="País onde a peça foi fabricada, conforme indicação do fabricante ou marcação na arma. Ex.: Brasil, EUA, Alemanha." />
                          </label>
                          <button type="button" onClick={() => setPaisPickerOpen(true)}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.paisFabricacao ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.paisFabricacao || "Selecionar país…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      )}

                      {/* Tambor sobressalente — apenas REVÓLVER */}
                      {activeWeapon?.type === "REVÓLVER" && (
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Tambor sobressalente
                            <HelpBtn title="Tambor sobressalente" text="Tambor adicional apreendido junto com o revólver, com calibre diferente do original. Registrado como informação complementar; não altera o calibre nominal da arma." />
                          </label>
                          <button type="button" onClick={() => setTamborPickerOpen(true)}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.tamborSobressalente ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.tamborSobressalente
                                ? `${activeWeapon.tamborSobressalente}${activeWeapon.tamborSobressalenteQtd ? ` · ${activeWeapon.tamborSobressalenteQtd} unid.` : ""}`
                                : "Sem tambor sobressalente"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Botão Preencher ficha — aparece só quando fabricante e modelo estão selecionados */}
                    {TIPOS_COM_CATALOGO.includes(activeWeapon?.type as WeaponType) && activeWeapon?.brand && activeWeapon?.model && (
                      <button
                        type="button"
                        disabled={loadingFicha}
                        onClick={async () => {
                          if (!activeWeapon || !activeWeapon.brand || !activeWeapon.model) return
                          const ficha = await buscarFicha(activeWeapon.type, activeWeapon.brand, activeWeapon.model)
                          if (!ficha) return
                          const campos = fichaParaWeaponEntry(ficha)
                          Object.entries(campos).forEach(([campo, valor]) => {
                            setWeaponDirect(campo as keyof Omit<WeaponEntry, "type">, valor as string | boolean | null | string[])
                          })
                        }}
                        className="flex h-10 w-full items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 text-left shadow-sm transition active:opacity-70 disabled:opacity-40"
                      >
                        <span className="flex items-center gap-2 text-[13px] font-medium text-blue-600">
                          {loadingFicha ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookOpen className="h-3.5 w-3.5" />}
                          Preencher ficha
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-blue-300" />
                      </button>
                    )}

                    {/* Tipo de produção — apenas armas de fogo */}
                    {(["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (
                      <div className="rounded-2xl border border-[#d3c4a8] bg-white p-4 shadow-sm">
                        <label className="mb-3 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de produção</label>
                        <div className="flex gap-2">
                          {(["INDUSTRIAL", "ARTESANAL"]).map(tipo => (
                            <button
                              key={tipo}
                              type="button"
                              onClick={() => { setWeaponDirect("tipoProd", tipo); if (tipo === "ARTESANAL") setWeaponDirect("serialEstado", "") }}
                              className={`flex-1 rounded-xl border-2 py-3 text-sm font-black tracking-[0.12em] transition active:scale-[.97] ${
                                activeWeapon?.tipoProd === tipo
                                  ? "border-[#9e7f45] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[#f0d08a] shadow-md"
                                  : "border-[#cdbf9e] bg-[#fbf8f2] text-[#6b5838]"
                              }`}
                            >
                              {tipo}
                            </button>
                          ))}
                        </div>

                        {/* Bloco de número de série — só para INDUSTRIAL */}
                        {activeWeapon?.tipoProd === "INDUSTRIAL" && (
                          <div className="mt-4 border-t border-[#e8dfc8] pt-4">
                            <label className="mb-3 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                              Número de série — estado
                              <HelpBtn title="Número de série" text="Indica a condição em que o número de série se encontra na arma. LEGÍVEL: completamente visível. PARCIAL: parte dos algarismos visível. SUPRIMIDO: intencionalmente removido ou apagado. NÃO APARENTE: não localizado no exame visual." />
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {(["LEGÍVEL", "PARCIAL", "SUPRIMIDO", "NÃO APARENTE"]).map(est => (
                                <button
                                  key={est}
                                  type="button"
                                  onClick={() => setWeaponDirect("serialEstado", est)}
                                  className={`rounded-xl border-2 py-2.5 text-xs font-black tracking-[0.08em] transition active:scale-[.97] ${
                                    activeWeapon?.serialEstado === est
                                      ? "border-[#9e7f45] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[#f0d08a]"
                                      : "border-[#cdbf9e] bg-[#fbf8f2] text-[#6b5838]"
                                  }`}
                                >
                                  {est}
                                </button>
                              ))}
                            </div>

                            {/* Input do número — só para LEGÍVEL ou PARCIAL */}
                            {(activeWeapon?.serialEstado === "LEGÍVEL" || activeWeapon?.serialEstado === "PARCIAL") && (
                              <div className="mt-3">
                                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                                  Número de série
                                  {activeWeapon?.serialEstado === "PARCIAL" && (
                                    <span className="ml-2 text-[10px] font-semibold normal-case tracking-normal text-[#b89a58]">(registrar parte visível)</span>
                                  )}
                                </label>
                                <input
                                  value={activeWeapon?.serial ?? ""}
                                  onChange={handleWeaponField("serial")}
                                  className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                                  placeholder={
                                    activeWeapon?.type === "REVÓLVER" ? "Ex.: TE123456" :
                                    activeWeapon?.type === "PISTOLA" ? "Ex.: T1G23456" :
                                    activeWeapon?.type === "PISTOLETE" ? "Ex.: T1G23456" :
                                    activeWeapon?.type === "GARRUCHA" ? "Ex.: GR123456" :
                                    activeWeapon?.type === "ESPINGARDA" ? "Ex.: SG-123456" :
                                    activeWeapon?.type === "CARABINA" ? "Ex.: CB123456" :
                                    activeWeapon?.type === "FUZIL" ? "Ex.: FZ123456" :
                                    activeWeapon?.type === "METRALHADORA" ? "Ex.: MT123456" :
                                    activeWeapon?.type === "SUBMETRALHADORA" ? "Ex.: SM123456" :
                                    activeWeapon?.type === "ARMA DE CHOQUE" ? "Ex.: AC123456" :
                                    "Ex.: ABC-123456"
                                  }
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </div>}

                  {/* ── REVÓLVER ── */}
                  {activeWeapon?.type === "REVÓLVER" && (<>
                    <CollapsibleSection title="Características físicas" defaultOpen={true}>
                      {/* Material — picker */}
                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                        <button type="button" onClick={() => setMaterialPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                            {activeWeapon?.material || "Selecionar material…"}
                          </span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
                      {/* Acabamento — picker */}
                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                        <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                            {activeWeapon?.acabamento || "Selecionar acabamento…"}
                          </span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do quadro</label>
                        <button type="button" onClick={() => setMaterialQuadroPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.materialQuadro ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialQuadro || "Selecionar material…"}</span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
                      {/* Sistema de acionamento — picker */}
                      <div className="mb-4">
                        <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                        <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                            {activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}
                          </span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
                      {/* Raiamento do cano */}
                      <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                        <div className="border-b border-[#ede3ce] px-4 py-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento do cano</div>
                        </div>
                        <div className="divide-y divide-[#ede3ce]">
                          <div className="px-4 py-3">
                            <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de raiamento<HelpBtn title="Tipo de raiamento" text="Característica interna do cano. Alma lisa: sem raias, comum em espingardas. Raiamento convencional: raias helicoidais que estabilizam o projétil. Poligonal: perfil poligonal em vez de raias tradicionais, comum em Glocks." /></label>
                            <button type="button" onClick={() => setTipoRaiamentoPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.tipoRaiamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.tipoRaiamento || "Selecionar raiamento…"}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          {activeWeapon?.tipoRaiamento && activeWeapon.tipoRaiamento !== "Alma lisa (sem raiamento)" && (<>
                          <div className="px-4 py-3">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido</label>
                            <button type="button" onClick={() => setSentidoPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sentidoEstrias || "Selecionar sentido…"}</span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          <div className="px-4 py-3">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de raias</label>
                            <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 6" />
                          </div>
                          </>)}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {([
                          ["compCano",   "Comprimento do cano", "Ex.: 4 pol."],
                          ["numCamaras", "Número de câmaras",   "Ex.: 6"],
                        ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                          <div key={field}>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                            <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder={ph} />
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    <div className="space-y-4">
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["acaoSimples",      "Ação simples funcional"],
                            ["acaoDupla",        "Ação dupla funcional"],
                            ["tamborGira",       "Tambor gira livremente"],
                            ["indexacaoCorreta", "Indexação correta do tambor"],
                            ["caoFuncional",     "Cão funcional"],
                            ["gatilhoFuncional", "Gatilho funcional"],
                            ["seguranca",        "Sistema de segurança"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, true);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>SIM</button>
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, false);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",       "ferrugemObs",       "Presença de ferrugem"],
                            ["desgaste",       "desgasteObs",       "Desgaste"],
                            ["danoEstruturais","danoEstruturaisObs","Danos estruturais"],
                            ["pecasFaltantes", "pecasFaltantesObs", "Peças faltantes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",      "Apto a disparo"],
                            ["funcMunicaoReal",  "Funcionamento com munição real"],
                            ["testePercussao",   "Teste de percussão"],
                            ["marcacaoPercussor","Marcação de percussor"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-[#ede3ce] pt-4">
                          <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Munições utilizadas no exame</label>
                          <div className="space-y-2">
                            {( [
                              ["TODAS",      "Exame feito com todas as munições que acompanham o material"],
                              ["AMOSTRAGEM", "Com uma amostragem das munições que acompanham o material"],
                              ["MISTA",      "Com as munições que acompanham o material e utilização de munições próprias cedidas pela unidade"],
                              ["PROPRIA",    "Apenas com munições próprias cedidas pela unidade"],
                            ] as const).map(([val, label]) => {
                              const sel = (activeWeapon as any)?.tipoMunicaoExame === val
                              return (
                                <button key={val} type="button"
                                  onClick={() => setWeaponDirect("tipoMunicaoExame" as any, sel ? "" : val)}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                                    sel ? "border-[#7d6334] bg-[#7d6334]/10" : "border-[#d3c4a8] bg-[#fbf8f2]"
                                  )}>
                                  <span className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                                    sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"
                                  )}>
                                    {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                                  </span>
                                  <span className={`text-[12px] font-bold leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{label}</span>
                                </button>
                              )
                            })}
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Calibre</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.tipoMunicaoDisparo ?? ""); setTipoMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`truncate text-[14px] ${activeWeapon?.tipoMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.tipoMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Qtd. utilizada</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.qtdMunicaoDisparo ?? ""); setQtdMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`text-[14px] ${activeWeapon?.qtdMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.qtdMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                          </div>

                        </div>
                      </CollapsibleCard>
                    </div>
                  </>)}

                  {/* ── CARABINA ── */}
                  {activeWeapon?.type === "CARABINA" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.material || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                          <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.acabamento || "Selecionar acabamento…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da coronha</label>
                          <button type="button" onClick={() => setMaterialCoronhaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialCoroha ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialCoroha || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do quadro</label>
                          <button type="button" onClick={() => setMaterialQuadroPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialQuadro ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialQuadro || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                          <div className="border-b border-[#ede3ce] px-4 py-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento do cano</div>
                          </div>
                          <div className="divide-y divide-[#ede3ce]">
                            <div className="px-4 py-3">
                              <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de raiamento<HelpBtn title="Tipo de raiamento" text="Característica interna do cano. Alma lisa: sem raias, comum em espingardas. Raiamento convencional: raias helicoidais que estabilizam o projétil. Poligonal: perfil poligonal em vez de raias tradicionais, comum em Glocks." /></label>
                              <button type="button" onClick={() => setTipoRaiamentoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.tipoRaiamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.tipoRaiamento || "Selecionar raiamento…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido</label>
                              <button type="button" onClick={() => setSentidoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sentidoEstrias || "Selecionar sentido…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de raias</label>
                              <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder="Ex.: 6" />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",             "Comprimento do cano",  "Ex.: 510 mm"],
                            ["compTotal",            "Comprimento total",    "Ex.: 940 mm"],
                            ["capacidadeCarregador", "Capacidade (munições)","Ex.: Sete"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["sistemaRepeticao",   "Sistema de repetição funcional"],
                            ["ferrolhoFuncional",  "Ferrolho funcional"],
                            ["percussorFuncional", "Percussor funcional"],
                            ["extratorFuncional",  "Extrator funcional"],
                            ["ejetorFuncional",    "Ejetor funcional"],
                            ["gatilhoFuncional",   "Gatilho funcional"],
                            ["seguranca",          "Trava de segurança funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, true);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>SIM</button>
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, false);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",        "ferrugemObs",         "Presença de ferrugem"],
                            ["desgasteMecanico","desgasteMecanicoObs", "Desgaste mecânico"],
                            ["pecasFaltantes",  "pecasFaltantesObs",   "Peças faltantes"],
                            ["danosAparentes",  "danosAparentesObs",   "Danos aparentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",       "Apta para disparo"],
                            ["testePercussao",    "Percussão funcional"],
                            ["extracaoFuncional", "Extração funcional"],
                            ["ejacaoFuncional",   "Ejeção funcional"],
                            ["ciclagemFuncional", "Ciclagem funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-[#ede3ce] pt-4">
                          <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Munições utilizadas no exame</label>
                          <div className="space-y-2">
                            {( [
                              ["TODAS",      "Exame feito com todas as munições que acompanham o material"],
                              ["AMOSTRAGEM", "Com uma amostragem das munições que acompanham o material"],
                              ["MISTA",      "Com as munições que acompanham o material e utilização de munições próprias cedidas pela unidade"],
                              ["PROPRIA",    "Apenas com munições próprias cedidas pela unidade"],
                            ] as const).map(([val, label]) => {
                              const sel = (activeWeapon as any)?.tipoMunicaoExame === val
                              return (
                                <button key={val} type="button"
                                  onClick={() => setWeaponDirect("tipoMunicaoExame" as any, sel ? "" : val)}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                                    sel ? "border-[#7d6334] bg-[#7d6334]/10" : "border-[#d3c4a8] bg-[#fbf8f2]"
                                  )}>
                                  <span className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                                    sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"
                                  )}>
                                    {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                                  </span>
                                  <span className={`text-[12px] font-bold leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{label}</span>
                                </button>
                              )
                            })}
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Calibre</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.tipoMunicaoDisparo ?? ""); setTipoMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`truncate text-[14px] ${activeWeapon?.tipoMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.tipoMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Qtd. utilizada</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.qtdMunicaoDisparo ?? ""); setQtdMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`text-[14px] ${activeWeapon?.qtdMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.qtdMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── PISTOLA / PISTOLETE ── */}
                  {(activeWeapon?.type === "PISTOLA" || activeWeapon?.type === "PISTOLETE") && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.material || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                          <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.acabamento || "Selecionar acabamento…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do quadro</label>
                          <button type="button" onClick={() => setMaterialQuadroPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialQuadro ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialQuadro || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                          <div className="border-b border-[#ede3ce] px-4 py-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento do cano</div>
                          </div>
                          <div className="divide-y divide-[#ede3ce]">
                            <div className="px-4 py-3">
                              <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de raiamento<HelpBtn title="Tipo de raiamento" text="Característica interna do cano. Alma lisa: sem raias, comum em espingardas. Raiamento convencional: raias helicoidais que estabilizam o projétil. Poligonal: perfil poligonal em vez de raias tradicionais, comum em Glocks." /></label>
                              <button type="button" onClick={() => setTipoRaiamentoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.tipoRaiamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.tipoRaiamento || "Selecionar raiamento…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido</label>
                              <button type="button" onClick={() => setSentidoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sentidoEstrias || "Selecionar sentido…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de raias</label>
                              <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder="Ex.: 6" />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",             "Comprimento do cano",     "Ex.: 100 mm"],
                            ["compTotal",            "Comprimento total",       "Ex.: 180 mm"],
                            ["capacidadeCarregador", "Capacidade do carregador","Ex.: 17 cartuchos"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["carregadorPresente",  "Carregador presente"],
                            ["carregadorFuncional", "Carregador funcional"],
                            ["ferrolhoFuncional",   "Ferrolho funcional"],
                            ["percussorFuncional",  "Percussor funcional"],
                            ["extratorFuncional",   "Extrator funcional"],
                            ["ejetorFuncional",     "Ejetor funcional"],
                            ["gatilhoFuncional",    "Gatilho funcional"],
                            ["seguranca",           "Trava de segurança funcional"],
                            ["retencaoFerrolho",    "Retenção do ferrolho funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, true);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>SIM</button>
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, false);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",        "ferrugemObs",         "Presença de ferrugem"],
                            ["desgasteMecanico","desgasteMecanicoObs", "Desgaste mecânico"],
                            ["pecasFaltantes",  "pecasFaltantesObs",   "Peças faltantes"],
                            ["danosAparentes",  "danosAparentesObs",   "Danos aparentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",       "Apta para disparo"],
                            ["testePercussao",    "Percussão funcional"],
                            ["extracaoFuncional", "Extração funcional"],
                            ["ejacaoFuncional",   "Ejeção funcional"],
                            ["ciclagemFuncional", "Ciclagem funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-[#ede3ce] pt-4">
                          <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Munições utilizadas no exame</label>
                          <div className="space-y-2">
                            {( [
                              ["TODAS",      "Exame feito com todas as munições que acompanham o material"],
                              ["AMOSTRAGEM", "Com uma amostragem das munições que acompanham o material"],
                              ["MISTA",      "Com as munições que acompanham o material e utilização de munições próprias cedidas pela unidade"],
                              ["PROPRIA",    "Apenas com munições próprias cedidas pela unidade"],
                            ] as const).map(([val, label]) => {
                              const sel = (activeWeapon as any)?.tipoMunicaoExame === val
                              return (
                                <button key={val} type="button"
                                  onClick={() => setWeaponDirect("tipoMunicaoExame" as any, sel ? "" : val)}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                                    sel ? "border-[#7d6334] bg-[#7d6334]/10" : "border-[#d3c4a8] bg-[#fbf8f2]"
                                  )}>
                                  <span className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                                    sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"
                                  )}>
                                    {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                                  </span>
                                  <span className={`text-[12px] font-bold leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{label}</span>
                                </button>
                              )
                            })}
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Calibre</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.tipoMunicaoDisparo ?? ""); setTipoMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`truncate text-[14px] ${activeWeapon?.tipoMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.tipoMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Qtd. utilizada</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.qtdMunicaoDisparo ?? ""); setQtdMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`text-[14px] ${activeWeapon?.qtdMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.qtdMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── ESPINGARDA ── */}
                  {activeWeapon?.type === "ESPINGARDA" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.material || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                          <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.acabamento || "Selecionar acabamento…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da coronha</label>
                          <button type="button" onClick={() => setMaterialCoronhaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialCoroha ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialCoroha || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",             "Comprimento do cano",  "Ex.: 510 mm"],
                            ["compTotal",            "Comprimento total",    "Ex.: 940 mm"],
                            ["numCanos",             "Número de canos",      "Ex.: 1, 2"],
                            ["tamanhoCamara",        "Tamanho da câmara",    "Ex.: 2 ¾ polegadas"],
                            ["capacidadeCarregador", "Capacidade (munições)","Ex.: Sete"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["gatilhoFuncional",    "Gatilho funcional"],
                            ["caoFuncional",        "Cão funcional"],
                            ["extratorFuncional",   "Extrator funcional"],
                            ["seguranca",           "Trava de segurança funcional"],
                            ["sistemaRepeticao",    "Sistema de repetição funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, true);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>SIM</button>
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, false);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",        "ferrugemObs",         "Presença de ferrugem"],
                            ["desgasteMecanico","desgasteMecanicoObs", "Desgaste mecânico"],
                            ["pecasFaltantes",  "pecasFaltantesObs",   "Peças faltantes"],
                            ["danosAparentes",  "danosAparentesObs",   "Danos aparentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",      "Apta para disparo"],
                            ["testePercussao",   "Percussão funcional"],
                            ["extracaoFuncional","Extração funcional"],
                            ["ejacaoFuncional",  "Ejeção funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-[#ede3ce] pt-4">
                          <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Munições utilizadas no exame</label>
                          <div className="space-y-2">
                            {( [
                              ["TODAS",      "Exame feito com todas as munições que acompanham o material"],
                              ["AMOSTRAGEM", "Com uma amostragem das munições que acompanham o material"],
                              ["MISTA",      "Com as munições que acompanham o material e utilização de munições próprias cedidas pela unidade"],
                              ["PROPRIA",    "Apenas com munições próprias cedidas pela unidade"],
                            ] as const).map(([val, label]) => {
                              const sel = (activeWeapon as any)?.tipoMunicaoExame === val
                              return (
                                <button key={val} type="button"
                                  onClick={() => setWeaponDirect("tipoMunicaoExame" as any, sel ? "" : val)}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                                    sel ? "border-[#7d6334] bg-[#7d6334]/10" : "border-[#d3c4a8] bg-[#fbf8f2]"
                                  )}>
                                  <span className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                                    sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"
                                  )}>
                                    {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                                  </span>
                                  <span className={`text-[12px] font-bold leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{label}</span>
                                </button>
                              )
                            })}
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Calibre</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.tipoMunicaoDisparo ?? ""); setTipoMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`truncate text-[14px] ${activeWeapon?.tipoMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.tipoMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Qtd. utilizada</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.qtdMunicaoDisparo ?? ""); setQtdMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`text-[14px] ${activeWeapon?.qtdMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.qtdMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── FUZIL ── */}
                  {activeWeapon?.type === "FUZIL" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.material || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                          <div className="border-b border-[#ede3ce] px-4 py-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento do cano</div>
                          </div>
                          <div className="divide-y divide-[#ede3ce]">
                            <div className="px-4 py-3">
                              <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de raiamento<HelpBtn title="Tipo de raiamento" text="Característica interna do cano. Alma lisa: sem raias, comum em espingardas. Raiamento convencional: raias helicoidais que estabilizam o projétil. Poligonal: perfil poligonal em vez de raias tradicionais, comum em Glocks." /></label>
                              <button type="button" onClick={() => setTipoRaiamentoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.tipoRaiamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.tipoRaiamento || "Selecionar raiamento…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido</label>
                              <button type="button" onClick={() => setSentidoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sentidoEstrias || "Selecionar sentido…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de raias</label>
                              <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder="Ex.: 6" />
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da coronha</label>
                          <button type="button" onClick={() => setMaterialCoronhaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialCoroha ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialCoroha || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do quadro</label>
                          <button type="button" onClick={() => setMaterialQuadroPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialQuadro ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialQuadro || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",             "Comprimento do cano",   "Ex.: 410 mm"],
                            ["compTotal",            "Comprimento total",     "Ex.: 860 mm"],
                            ["capacidadeCarregador", "Capacidade (munições)", "Ex.: Trinta"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["ferrolhoFuncional",   "Ferrolho funcional"],
                            ["percussorFuncional",  "Percussor funcional"],
                            ["extratorFuncional",   "Extrator funcional"],
                            ["ejetorFuncional",     "Ejetor funcional"],
                            ["gatilhoFuncional",    "Gatilho funcional"],
                            ["seguranca",           "Trava de segurança funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                            ["seletoDisparo",       "Seletor de disparo funcional"],
                            ["modoSemiAuto",        "Modo semi-automático funcional"],
                            ["modoAutoFuncional",   "Modo automático funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, true);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>SIM</button>
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, false);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",        "ferrugemObs",         "Presença de ferrugem"],
                            ["desgasteMecanico","desgasteMecanicoObs", "Desgaste mecânico"],
                            ["pecasFaltantes",  "pecasFaltantesObs",   "Peças faltantes"],
                            ["danosAparentes",  "danosAparentesObs",   "Danos aparentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",      "Apto a disparo"],
                            ["testePercussao",   "Percussão funcional"],
                            ["extracaoFuncional","Extração funcional"],
                            ["ejacaoFuncional",  "Ejeção funcional"],
                            ["ciclagemFuncional","Ciclagem funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-[#ede3ce] pt-4">
                          <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Munições utilizadas no exame</label>
                          <div className="space-y-2">
                            {( [
                              ["TODAS",      "Exame feito com todas as munições que acompanham o material"],
                              ["AMOSTRAGEM", "Com uma amostragem das munições que acompanham o material"],
                              ["MISTA",      "Com as munições que acompanham o material e utilização de munições próprias cedidas pela unidade"],
                              ["PROPRIA",    "Apenas com munições próprias cedidas pela unidade"],
                            ] as const).map(([val, label]) => {
                              const sel = (activeWeapon as any)?.tipoMunicaoExame === val
                              return (
                                <button key={val} type="button"
                                  onClick={() => setWeaponDirect("tipoMunicaoExame" as any, sel ? "" : val)}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                                    sel ? "border-[#7d6334] bg-[#7d6334]/10" : "border-[#d3c4a8] bg-[#fbf8f2]"
                                  )}>
                                  <span className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                                    sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"
                                  )}>
                                    {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                                  </span>
                                  <span className={`text-[12px] font-bold leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{label}</span>
                                </button>
                              )
                            })}
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Calibre</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.tipoMunicaoDisparo ?? ""); setTipoMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`truncate text-[14px] ${activeWeapon?.tipoMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.tipoMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Qtd. utilizada</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.qtdMunicaoDisparo ?? ""); setQtdMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`text-[14px] ${activeWeapon?.qtdMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.qtdMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── METRALHADORA / SUBMETRALHADORA ── */}
                  {(activeWeapon?.type === "METRALHADORA" || activeWeapon?.type === "SUBMETRALHADORA") && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.material || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                          <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.acabamento || "Selecionar acabamento…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da coronha</label>
                          <button type="button" onClick={() => setMaterialCoronhaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialCoroha ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialCoroha || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do quadro</label>
                          <button type="button" onClick={() => setMaterialQuadroPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialQuadro ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialQuadro || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sistema de acionamento<HelpBtn title="Sistema de acionamento" text="Define como o mecanismo de disparo funciona. SA (ação simples): o cão precisa ser amartilhado antes. DA (ação dupla): o gatilho arma e dispara. Striker-fired: percussor interno armado pelo ciclo do ferrolho." /></label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                          <div className="border-b border-[#ede3ce] px-4 py-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento do cano</div>
                          </div>
                          <div className="divide-y divide-[#ede3ce]">
                            <div className="px-4 py-3">
                              <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de raiamento<HelpBtn title="Tipo de raiamento" text="Característica interna do cano. Alma lista: sem raias, comum em espingardas. Raiamento convencional: raias helicoidais que estabilizam o projétil. Poligonal: perfil poligonal em vez de raias tradicionais, comum em Glocks." /></label>
                              <button type="button" onClick={() => setTipoRaiamentoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.tipoRaiamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.tipoRaiamento || "Selecionar raiamento…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido</label>
                              <button type="button" onClick={() => setSentidoPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.sentidoEstrias || "Selecionar sentido…"}</span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div className="px-4 py-3">
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de raias</label>
                              <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder="Ex.: 6" />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",             "Comprimento do cano",  "Ex.: 260 mm"],
                            ["compTotal",            "Comprimento total",    "Ex.: 690 mm"],
                            ["capacidadeCarregador", "Capacidade (munições)","Ex.: Cem"],
                            ["modoFogo",             "Modo de fogo",         "Ex.: semi, auto"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["ferrolhoFuncional",   "Ferrolho funcional"],
                            ["percussorFuncional",  "Percussor funcional"],
                            ["extratorFuncional",   "Extrator funcional"],
                            ["ejetorFuncional",     "Ejetor funcional"],
                            ["gatilhoFuncional",    "Gatilho funcional"],
                            ["seguranca",           "Trava de segurança funcional"],
                            ["alimentacaoFuncional","Alimentação funcional"],
                            ["seletoDisparo",       "Seletor de disparo funcional"],
                            ["modoAutoFuncional",   "Modo automático funcional"],
                            ["culatelFuncional",    "Culatel funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean(activeWeapon?.[key] ?? true)
                            const isNao = !isNa && !Boolean(activeWeapon?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, true);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>SIM</button>
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, false);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",        "ferrugemObs",         "Presença de ferrugem"],
                            ["desgasteMecanico","desgasteMecanicoObs", "Desgaste mecânico"],
                            ["pecasFaltantes",  "pecasFaltantesObs",   "Peças faltantes"],
                            ["danosAparentes",  "danosAparentesObs",   "Danos aparentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",      "Apto a disparo"],
                            ["testePercussao",   "Percussão funcional"],
                            ["extracaoFuncional","Extração funcional"],
                            ["ejacaoFuncional",  "Ejeção funcional"],
                            ["ciclagemFuncional","Ciclagem funcional"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-[#ede3ce] pt-4">
                          <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Munições utilizadas no exame</label>
                          <div className="space-y-2">
                            {( [
                              ["TODAS",      "Exame feito com todas as munições que acompanham o material"],
                              ["AMOSTRAGEM", "Com uma amostragem das munições que acompanham o material"],
                              ["MISTA",      "Com as munições que acompanham o material e utilização de munições próprias cedidas pela unidade"],
                              ["PROPRIA",    "Apenas com munições próprias cedidas pela unidade"],
                            ] as const).map(([val, label]) => {
                              const sel = (activeWeapon as any)?.tipoMunicaoExame === val
                              return (
                                <button key={val} type="button"
                                  onClick={() => setWeaponDirect("tipoMunicaoExame" as any, sel ? "" : val)}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                                    sel ? "border-[#7d6334] bg-[#7d6334]/10" : "border-[#d3c4a8] bg-[#fbf8f2]"
                                  )}>
                                  <span className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                                    sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"
                                  )}>
                                    {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                                  </span>
                                  <span className={`text-[12px] font-bold leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{label}</span>
                                </button>
                              )
                            })}
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Calibre</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.tipoMunicaoDisparo ?? ""); setTipoMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`truncate text-[14px] ${activeWeapon?.tipoMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.tipoMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Qtd. utilizada</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.qtdMunicaoDisparo ?? ""); setQtdMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`text-[14px] ${activeWeapon?.qtdMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.qtdMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── ESTOJO ── */}
                  {activeWeapon?.type === "ESTOJO" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Material — picker */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Formato / tipo de rebordo — picker */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de rebordo</label>
                          <button type="button" onClick={() => setFormatoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.formato ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.formato || "Selecionar tipo…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Inscrições (headstamp) */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Inscrições (headstamp)</label>
                          <input
                            value={activeWeapon?.inscricaoFabricante ?? ""}
                            onChange={handleWeaponField("inscricaoFabricante")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: CBC .38 SPL, RP 9mm LUGER…"
                          />
                        </div>
                        {/* Outros campos */}
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ...((activeWeapon?.estadoEstojo === "ÍNTEGRO" || !!activeWeapon?.quantidade) ? [["quantidade", "Quantidade", "Ex.: 3"]] : []),
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Marcações balísticas">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["marcacaoPercussor","Marcação de percussor"],
                            ["marcacaoExtrator", "Marcação de extrator"],
                            ["marcacaoEjetor",   "Marcação de ejetor"],
                            ["marcacaoCamara",   "Marcação de câmara"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["ferrugem",          "Ferrugem presente"],
                            ["deformacaoPresente","Deformação presente"],
                            ["fragmentado",       "Fragmentado"],
                            ["oxidacaoPresente",  "Oxidação presente"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Deformações acidentais</label>
                          <button type="button" onClick={() => setDeformacoesPickerOpen(true)}
                            className="flex min-h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-left transition focus:border-[#9e7f45]">
                            <span className={`text-[14px] leading-snug ${activeWeapon?.deformacoesAcidentais ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.deformacoesAcidentais || "Selecionar deformações…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── PROJÉTIL ── */}
                  {activeWeapon?.type === "PROJÉTIL" && (
                    <div className="space-y-4">

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Identificação</label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: CBC, Remington…" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Fabricante</label>
                          <input value={activeWeapon?.brand ?? ""} onChange={handleWeaponField("brand")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: CBC, Sellier & Bellot…" />
                        </div>
                      </div>

                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Material — seletor bottom sheet */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button
                            type="button"
                            onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]"
                          >
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Formato — seletor bottom sheet */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Formato</label>
                          <button
                            type="button"
                            onClick={() => setFormatoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]"
                          >
                            <span className={`truncate text-[15px] ${activeWeapon?.formato ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.formato || "Selecionar formato…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </CollapsibleSection>

                      <CollapsibleCard title="Marcações balísticas">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["estriasPresentes",  "Estrias presentes"],
                            ["deformacaoPresente","Deformação presente"],
                            ["fragmentado",       "Fragmentado"],
                            ["oxidacaoPresente",  "Oxidação presente"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Deformações acidentais</label>
                          <button type="button" onClick={() => setDeformacoesPickerOpen(true)}
                            className="flex min-h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-left transition focus:border-[#9e7f45]">
                            <span className={`text-[14px] leading-snug ${activeWeapon?.deformacoesAcidentais ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.deformacoesAcidentais || "Selecionar deformações…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Estado de conservação">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["completo", "Projétil íntegro / completo"],
                            ["manchas",  "Manchas ou resíduos presentes"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleSection title="Medições e calibre" defaultOpen={true}>
                        {/* Raias — só para DEFLAGRADO */}
                        {activeWeapon?.estadoProjetil !== "ÍNTEGRO" && (<>
                          {/* Sentido das raias */}
                          <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Sentido das raias</label>
                            <button
                              type="button"
                              onClick={() => setSentidoPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]"
                            >
                              <span className={`truncate text-[15px] ${activeWeapon?.sentidoEstrias ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.sentidoEstrias || "Selecionar…"}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          {/* N° de raias */}
                          <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">N° de raias</label>
                            <input value={String(activeWeapon?.numEstrias ?? "")} onChange={handleWeaponField("numEstrias")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 6" />
                          </div>
                          {/* Cavados/Ressaltos e Raiamento — calculados */}
                          {(() => {
                            const n = activeWeapon?.numEstrias?.trim()
                            const sentido = activeWeapon?.sentidoEstrias?.trim()
                            const orientacaoMap: Record<string, string> = {

                              "Dextrorso": "dextrógiro",
                              "Sinistrorso": "sinistrógiro",
                              "Dextrorso e Sinistrorso (combinado)": "combinado dextro/sinistro",
                              "Anfidextrorso": "anfidextrorso",

                              "Indeterminado": "orientação indeterminada",
                            }
                            const orientacao = sentido ? (orientacaoMap[sentido] ?? sentido.toLowerCase()) : null
                            if (!n && !sentido) return null
                            return (
                              <div className="mb-4 overflow-hidden rounded-2xl border border-[#d3c4a8] bg-white shadow-sm">
                                <div className="border-b border-[#ede3ce] px-4 py-3">
                                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Raiamento</div>
                                </div>
                                <div className="divide-y divide-[#ede3ce]">
                                  {n && (
                                    <div className="flex items-center justify-between px-4 py-3">
                                      <span className="text-[13px] font-semibold text-[#7a6540]">Cavados e Ressaltos</span>
                                      <span className="text-[15px] font-black text-[#26221b]">{n} e {n}</span>
                                    </div>
                                  )}
                                  {(n || orientacao) && (
                                    <div className="flex items-center justify-between px-4 py-3">
                                      <span className="text-[13px] font-semibold text-[#7a6540]">Raiamento e Orientação</span>
                                      <span className="text-[15px] font-black text-right text-[#26221b]">
                                        {[n ? `${n} raias` : null, orientacao].filter(Boolean).join(", ")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })()}
                          {/* Diâmetro máx / mín e calibre calculado — só DEFLAGRADO */}
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            {([
                              ["diametro",    "Diâmetro máx.", "Ex.: 9,02 mm"],
                              ["diametroMin", "Diâmetro mín.", "Ex.: 8,98 mm"],
                            ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                              <div key={field}>
                                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                                <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                  className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                  placeholder={ph} />
                              </div>
                            ))}
                          </div>
                          {(() => {
                            const pv = (v: string | undefined) => parseFloat(String(v ?? "").replace(",", ".").replace(/[^\d.]/g, ""))
                            const dMax  = pv(activeWeapon?.diametro)
                            const dMin  = pv(activeWeapon?.diametroMin)
                            const alt   = pv(activeWeapon?.alturaProjetil)
                            const mass  = pv(activeWeapon?.massa)
                            if (isNaN(dMax) || isNaN(dMin)) return null
                            const diam  = (dMax + dMin) / 2
                            const media = diam.toFixed(2).replace(".", ",")

                            type Cal = { nome: string; nominal: string; mm: string; dMin: number; dMax: number; aMin: number; aMax: number; mMin: number; mMax: number }
                            const db: Cal[] = [
                              { nome: ".22 LR",               nominal: ".22 LR",                    mm:"5,59 mm", dMin:5.40, dMax:5.80, aMin:7,  aMax:12, mMin:2.0,  mMax:3.5  },
                              { nome: ".25 ACP / 6,35mm",     nominal: ".25 ACP / 6,35mm Browning", mm:"6,35 mm", dMin:6.00, dMax:6.60, aMin:8,  aMax:12, mMin:3.0,  mMax:4.0  },
                              { nome: ".32 ACP / 7,65mm",     nominal: ".32 ACP / 7,65mm Browning", mm:"7,65 mm", dMin:7.45, dMax:7.85, aMin:9,  aMax:13, mMin:4.0,  mMax:5.5  },
                              { nome: ".32 S&W Long",         nominal: ".32 S&W Long",              mm:"7,97 mm", dMin:7.85, dMax:8.10, aMin:11, aMax:16, mMin:5.0,  mMax:7.0  },
                              { nome: ".380 ACP / 9mm Kurz",  nominal: ".380 ACP / 9mm Curto",      mm:"9,02 mm", dMin:8.70, dMax:9.10, aMin:8,  aMax:11, mMin:5.0,  mMax:7.5  },
                              { nome: "9mm Luger / 9×19mm",   nominal: "9mm Luger",                 mm:"9,02 mm", dMin:8.80, dMax:9.20, aMin:11, aMax:15, mMin:6.5,  mMax:9.5  },
                              { nome: ".38 SPL",              nominal: ".38 SPL",                   mm:"9,07 mm", dMin:9.00, dMax:9.20, aMin:14, aMax:18, mMin:7.5,  mMax:12.0 },
                              { nome: ".357 Magnum",          nominal: ".357 Magnum",               mm:"9,07 mm", dMin:9.00, dMax:9.20, aMin:15, aMax:22, mMin:8.0,  mMax:13.5 },
                              { nome: ".40 S&W",              nominal: ".40 S&W",                   mm:"10,17 mm",dMin:9.90, dMax:10.40, aMin:12, aMax:16, mMin:9.5, mMax:13.5 },
                              { nome: "10mm Auto",            nominal: "10mm Auto",                 mm:"10,17 mm",dMin:9.90, dMax:10.40, aMin:14, aMax:18, mMin:10.0,mMax:14.0 },
                              { nome: ".44 SPL",              nominal: ".44 S&W Special",           mm:"10,92 mm",dMin:10.70, dMax:11.10, aMin:16, aMax:21, mMin:12.0,mMax:17.0},
                              { nome: ".44 Magnum",           nominal: ".44 Magnum",                mm:"10,92 mm",dMin:10.70, dMax:11.10, aMin:18, aMax:26, mMin:13.0,mMax:20.0},
                              { nome: ".45 ACP",              nominal: ".45 ACP",                   mm:"11,43 mm",dMin:11.20, dMax:11.70, aMin:13, aMax:17, mMin:12.0,mMax:17.0},
                              { nome: ".45 Colt",             nominal: ".45 Colt / Long Colt",      mm:"11,43 mm",dMin:11.20, dMax:11.70, aMin:17, aMax:24, mMin:14.0,mMax:20.0},
                            ]

                            const deformado = !!(activeWeapon?.deformacaoPresente || activeWeapon?.fragmentado)

                            const scoreNormal = (cal: Cal) => {
                              const dScore = diam >= cal.dMin && diam <= cal.dMax ? 1
                                : 1 - Math.min(1, Math.min(Math.abs(diam - cal.dMin), Math.abs(diam - cal.dMax)) / 0.5)
                              if (dScore <= 0) return -1
                              let total = dScore * 0.5, weight = 0.5
                              if (!isNaN(alt) && alt > 0) {
                                const a = alt >= cal.aMin && alt <= cal.aMax ? 1
                                  : 1 - Math.min(1, Math.min(Math.abs(alt - cal.aMin), Math.abs(alt - cal.aMax)) / 3)
                                total += a * 0.3; weight += 0.3
                              }
                              if (!isNaN(mass) && mass > 0) {
                                const gap = Math.min(Math.abs(mass - cal.mMin), Math.abs(mass - cal.mMax))
                                const m = mass >= cal.mMin && mass <= cal.mMax ? 1 : 1 - Math.min(1, gap / 1.0)
                                if (m <= 0) return -1
                                total += m * 0.3; weight += 0.3
                              }
                              return total / weight
                            }

                            // Modo deformado: considera que massa medida <= massa original
                            // Massa pode estar abaixo do mínimo (perdeu massa); exclui apenas se acima do máximo
                            const scoreDeformado = (cal: Cal) => {
                              // Diâmetro: tolerância mais ampla (deformação altera diâmetro)
                              const dScore = diam >= cal.dMin && diam <= cal.dMax ? 1
                                : 1 - Math.min(1, Math.min(Math.abs(diam - cal.dMin), Math.abs(diam - cal.dMax)) / 1.2)
                              if (dScore <= 0) return -1
                              let total = dScore * 0.6, weight = 0.6
                              if (!isNaN(mass) && mass > 0) {
                                // Se massa > max do calibre → impossível (projétil não ganhou massa)
                                if (mass > cal.mMax + 0.5) return -1
                                // Se massa <= max → compatível (pode ter perdido massa)
                                const m = mass >= cal.mMin ? 1
                                  : 1 - Math.min(0.4, (cal.mMin - mass) / cal.mMin) // pequena penalidade por perda
                                total += m * 0.4; weight += 0.4
                              }
                              return total / weight
                            }

                            const ranked = db
                              .map(c => ({ ...c, score: deformado ? scoreDeformado(c) : scoreNormal(c) }))
                              .filter(c => c.score > (deformado ? 0.35 : 0.45))
                              .sort((a, b) => b.score - a.score)
                              .slice(0, deformado ? 3 : 1)

                            const top = ranked[0]
                            return (
                              <div className="mt-3 space-y-2">
                                <div className="rounded-xl border border-[#b89a58]/40 bg-[#f0e8d4] px-4 py-3">
                                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Calibre real (média)</div>
                                  <div className="text-lg font-black text-[#1d2433]">{media} mm</div>
                                </div>
                                {top && !deformado && (
                                  <div className="rounded-xl border border-[#7d9b6a]/40 bg-[#eef4e8] px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5a7a48]">Família do calibre</div>
                                    <div className="text-base font-black text-[#1d2433]">{top.mm}</div>
                                    <div className="text-[11px] text-[#5a7a48]">{top.nome}</div>
                                  </div>
                                )}
                                {top && !deformado && (
                                  <div className="rounded-xl border border-[#4a6fa5]/30 bg-[#eaf0f8] px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a5a80]">Provável calibre nominal</div>
                                    <div className="text-base font-black text-[#1d2433]">{top.nominal}</div>
                                  </div>
                                )}
                                {deformado && ranked.length > 0 && (
                                  <div className="rounded-xl border border-[#c4913a]/40 bg-[#fdf3e3] px-4 py-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a5e20]">
                                      Possíveis calibres — perda de massa considerada
                                    </div>
                                    <div className="mt-1.5 space-y-1">
                                      {ranked.map((c, i) => (
                                        <div key={c.nome} className={`flex items-center justify-between rounded-lg px-3 py-1.5 ${i === 0 ? "bg-[#f5e5c8]" : "bg-[#fbf0dc]"}`}>
                                          <div>
                                            <div className="text-[13px] font-black text-[#1d2433]">{c.nominal}</div>
                                            <div className="text-[10px] text-[#8a6030]">{c.mm} · {c.nome}</div>
                                          </div>
                                          <div className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black text-[#8a5e20] bg-[#f0d9a8]">
                                            {Math.round(c.score * 100)}%
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="mt-2 text-[10px] text-[#a07040]">
                                      {activeWeapon?.fragmentado ? "Projétil fragmentado" : "Deformação presente"} — calibre nominal requer confirmação
                                    </div>
                                  </div>
                                )}
                                {!top && (
                                  <div className="rounded-xl border border-[#b89a58]/25 bg-[#f5f0e8] px-4 py-2.5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Provável calibre nominal</div>
                                    <div className="text-base font-black text-[#1d2433]">Indeterminado</div>
                                    <div className="mt-0.5 text-[11px] text-[#8d7854]">
                                      {deformado
                                        ? activeWeapon?.fragmentado
                                          ? "Projétil fragmentado — insuficiente para determinação"
                                          : "Deformação severa — insuficiente para determinação"
                                        : `Nenhum calibre identificado para ${media} mm`}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </>)}
                        {/* Calibre real direto — só para ÍNTEGRO */}
                        {activeWeapon?.estadoProjetil === "ÍNTEGRO" && (
                          <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Calibre real (mm)</label>
                            <input value={String(activeWeapon?.diametro ?? "")} onChange={handleWeaponField("diametro")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 9,02" />
                          </div>
                        )}
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Massa (g)</label>
                          <input
                            value={String(activeWeapon?.massa ?? "")}
                            onChange={handleWeaponField("massa" as keyof Omit<WeaponEntry,"type">)}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: 7,162"
                          />
                          {(() => {
                            const g = parseFloat(String(activeWeapon?.massa ?? "").replace(",", ".").replace(/[^\d.]/g, ""))
                            if (isNaN(g) || g <= 0) return null
                            const gr = (g * 15.4324).toFixed(2).replace(".", ",")
                            const gFmt = g.toFixed(3).replace(".", ",")
                            return (
                              <div className="mt-2 rounded-xl border border-[#b89a58]/40 bg-[#f0e8d4] px-4 py-3">
                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Massa (g / gr)</div>
                                <div className="text-lg font-black text-[#1d2433]">{gFmt} g &nbsp;/&nbsp; {gr} gr</div>
                              </div>
                            )
                          })()}
                        </div>
                        {/* Altura — só para DEFLAGRADO */}
                        {activeWeapon?.estadoProjetil !== "ÍNTEGRO" && (
                          <div className="mt-4">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Altura (mm)</label>
                            <input
                              value={String(activeWeapon?.alturaProjetil ?? "")}
                              onChange={handleWeaponField("alturaProjetil" as keyof Omit<WeaponEntry,"type">)}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 14,20"
                            />
                          </div>
                        )}
                      </CollapsibleSection>
                    </div>
                  )}

                  {/* ── PÓLVORA ── */}
                  {activeWeapon?.type === "PÓLVORA" && (
                    <div className="space-y-4">

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Identificação</label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: Hodgdon H4895, IMR 4064…" />
                        </div>
                      </div>

                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Tipo de pólvora */}
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de pólvora<HelpBtn title="Tipo de pólvora" text="Pólvora negra: mistura de carvão, enxofre e nitrato — mais antiga, produz fumaça densa. Sem fumaça base simples: nitrocelulose, usada em munições modernas. Base dupla: nitrocelulose + nitroglicerina, maior energia. Propelente esférico: grânulos esféricos de queima uniforme." /></label>
                          <button type="button" onClick={() => setTipoPolvoraPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.tipoPolvora ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.tipoPolvora || "Selecionar tipo…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Estado físico */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Estado físico / granulometria</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar estado físico…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Cor */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Cor</label>
                          <input value={activeWeapon?.cor ?? ""} onChange={handleWeaponField("cor" as keyof Omit<WeaponEntry,"type">)}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: Cinza, Preta, Branca, Amarela…" />
                        </div>
                        {/* Massa e Quantidade */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Massa (g)</label>
                            <input value={String(activeWeapon?.massa ?? "")} onChange={handleWeaponField("massa" as keyof Omit<WeaponEntry,"type">)}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 2,500" />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Quantidade</label>
                            <input value={String(activeWeapon?.quantidade ?? "")} onChange={handleWeaponField("quantidade")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 1 frasco" />
                          </div>
                        </div>
                      </CollapsibleSection>

                      <CollapsibleCard title="Estado de conservação">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["oxidacaoPresente", "Oxidação / umidade presente"],
                            ["manchas",          "Contaminação ou manchas"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        {Boolean(activeWeapon?.manchas) && (
                          <div className="mt-3">
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Observações</label>
                            <input value={activeWeapon?.manchasObs ?? ""} onChange={handleWeaponField("manchasObs")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Descreva as contaminações…" />
                          </div>
                        )}
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── ESPOLETA ── */}
                  {activeWeapon?.type === "ESPOLETA" && (
                    <div className="space-y-4">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Identificação</label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: CCI 400, Federal 100…" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Fabricante</label>
                          <input value={activeWeapon?.brand ?? ""} onChange={handleWeaponField("brand")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: CBC, CCI, Federal, Remington…" />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">País de fabricação</label>
                          <button type="button" onClick={() => setPaisPickerOpen(true)}
                            className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[16px] ${activeWeapon?.paisFabricacao ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.paisFabricacao || "Selecionar país…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </div>

                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Tipo de espoleta */}
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de espoleta<HelpBtn title="Tipo de espoleta" text="Boxer: espoleta central com 1 orifício de chama — padrão americano, permite recarga. Berdan: central com 2 orifícios — padrão europeu, dificulta recarga. Rimfire: espoleta distribuída no anel periférico do estojo, comum em calibres .22." /></label>
                          <button type="button" onClick={() => setTipoEspoletaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.tipoEspoleta ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.tipoEspoleta || "Selecionar tipo…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Material */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Calibre e Quantidade */}
                        <div className="space-y-3">
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Calibre compatível</label>
                            <button type="button" onClick={() => setCalibrePickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.caliber ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.caliber || "Selecionar calibre…"}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Quantidade</label>
                            <input value={String(activeWeapon?.quantidade ?? "")} onChange={handleWeaponField("quantidade")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 5" />
                          </div>
                        </div>
                      </CollapsibleSection>

                      <CollapsibleCard title="Marcações e estado">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["completo",           "Espoleta íntegra"],
                            ["marcacaoPercussor",  "Marcação de percussor"],
                            ["deformacaoPresente", "Deformação presente"],
                            ["oxidacaoPresente",   "Oxidação presente"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── CARTUCHO ── */}
                  {activeWeapon?.type === "CARTUCHO" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Material do estojo — picker */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material do estojo</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Formato do estojo */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Formato do estojo</label>
                          <button type="button" onClick={() => setFormatoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.formato ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.formato || "Selecionar formato…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Inscrições (headstamp) */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Inscrições (headstamp)</label>
                          <input
                            value={activeWeapon?.inscricaoFabricante ?? ""}
                            onChange={handleWeaponField("inscricaoFabricante")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: CBC .38 SPL, RP 9mm LUGER…"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ...((activeWeapon?.estadoCartucho === "ÍNTEGRO" || !!activeWeapon?.quantidade) ? [["quantidade", "Quantidade", "Ex.: 12"]] : []),
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["completo", "Cartucho íntegro / completo"],
                            ["amassado", "Amassado"],
                            ["oxidacaoPresente","Oxidação presente"],
                            ["aptoDisparo","Apto a disparo"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Deformações acidentais</label>
                          <button type="button" onClick={() => setDeformacoesPickerOpen(true)}
                            className="flex min-h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-left transition focus:border-[#9e7f45]">
                            <span className={`text-[14px] leading-snug ${activeWeapon?.deformacoesAcidentais ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.deformacoesAcidentais || "Selecionar deformações…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── GARRUCHA ── */}
                  {activeWeapon?.type === "GARRUCHA" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="grid gap-5">
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Número de canos</label>
                            <div className="grid grid-cols-3 gap-2">
                              {["1","2","Indeterminado"].map(v => (
                                <button key={v} type="button"
                                  onClick={() => setWeaponDirect("numCanos", v)}
                                  className={`rounded-xl border-2 py-3 text-[13px] font-black uppercase tracking-wide transition active:scale-[.97] ${activeWeapon?.numCanos === v ? "border-[#9e7f45] bg-[#12213d] text-[#f0d08a]" : "border-[#d3c4a8] bg-white text-[#26221b]"}`}>
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Comprimento do cano (cm)</label>
                            <input value={activeWeapon?.compCano ?? ""} onChange={handleWeaponField("compCano")}
                              className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                              placeholder="Ex.: 7,5" />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Comprimento total (cm)</label>
                            <input value={activeWeapon?.compTotal ?? ""} onChange={handleWeaponField("compTotal")}
                              className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                              placeholder="Ex.: 15,0" />
                          </div>
                        </div>
                      </CollapsibleSection>

                      <CollapsibleSection title="Mecanismo de funcionamento" defaultOpen={true}>
                        <div className="space-y-3">
                          {[
                            { key: "caoFuncional",     label: "Cão funcional" },
                            { key: "gatilhoFuncional", label: "Gatilho funcional" },
                            { key: "seguranca",        label: "Segurança presente e funcional" },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center justify-between rounded-xl border border-[#e5d9c3] bg-white px-4 py-3">
                              <span className="text-[15px] font-medium text-[#26221b]">{label}</span>
                              <input type="checkbox" checked={(activeWeapon as any)?.[key] ?? false}
                                onChange={e => setWeaponDirect(key as any, e.target.checked)}
                                className="h-5 w-5 accent-[#9e7f45]" />
                            </label>
                          ))}
                        </div>
                      </CollapsibleSection>

                      <CollapsibleSection title="Estado de conservação" defaultOpen={false}>
                        <div className="space-y-3">
                          {[
                            { key: "ferrugem",       label: "Ferrugem",         obsKey: "ferrugemObs" },
                            { key: "desgaste",       label: "Desgaste",         obsKey: "desgasteObs" },
                            { key: "danoEstruturais",label: "Danos estruturais", obsKey: "danoEstruturaisObs" },
                            { key: "pecasFaltantes", label: "Peças faltantes",   obsKey: "pecasFaltantesObs" },
                          ].map(({ key, label, obsKey }) => (
                            <div key={key}>
                              <label className="flex items-center justify-between rounded-xl border border-[#e5d9c3] bg-white px-4 py-3">
                                <span className="text-[15px] font-medium text-[#26221b]">{label}</span>
                                <input type="checkbox" checked={(activeWeapon as any)?.[key] ?? false}
                                  onChange={e => setWeaponDirect(key as any, e.target.checked)}
                                  className="h-5 w-5 accent-[#9e7f45]" />
                              </label>
                              {(activeWeapon as any)?.[key] && (
                                <input value={(activeWeapon as any)?.[obsKey] ?? ""} onChange={handleWeaponField(obsKey as any)}
                                  className="mt-2 h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] shadow-sm"
                                  placeholder="Observações…" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>

                      <CollapsibleSection title="Aptidão para disparo" defaultOpen={true}>
                        <div className="space-y-3">
                          {[
                            { key: "aptoDisparo",      label: "Apta para disparo" },
                            { key: "testePercussao",   label: "Percussão funcional no teste" },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center justify-between rounded-xl border border-[#e5d9c3] bg-white px-4 py-3">
                              <span className="text-[15px] font-medium text-[#26221b]">{label}</span>
                              <input type="checkbox" checked={(activeWeapon as any)?.[key] ?? false}
                                onChange={e => setWeaponDirect(key as any, e.target.checked)}
                                className="h-5 w-5 accent-[#9e7f45]" />
                            </label>
                          ))}
                        </div>
                      </CollapsibleSection>
                    </div>
                  )}

                  {/* ── ARMA DE CHOQUE ── */}
                  {activeWeapon?.type === "ARMA DE CHOQUE" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características" defaultOpen={true}>
                        <div className="grid gap-5">
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo / sistema</label>
                            <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                              className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[16px] ${activeWeapon?.sistemaAcionamento ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                {activeWeapon?.sistemaAcionamento || "Selecionar tipo…"}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">País de fabricação</label>
                            <button type="button" onClick={() => setPaisPickerOpen(true)}
                              className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left shadow-sm transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[16px] ${activeWeapon?.paisFabricacao ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                {activeWeapon?.paisFabricacao || "Selecionar país…"}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                        </div>
                      </CollapsibleSection>

                      <CollapsibleSection title="Funcionamento" defaultOpen={true}>
                        <div className="space-y-3">
                          {[
                            { key: "aptoDisparo",      label: "Dispositivo funcional (produz choque)" },
                            { key: "gatilhoFuncional", label: "Gatilho / acionador funcional" },
                            { key: "seguranca",        label: "Trava de segurança presente e funcional" },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center justify-between rounded-xl border border-[#e5d9c3] bg-white px-4 py-3">
                              <span className="text-[15px] font-medium text-[#26221b]">{label}</span>
                              <input type="checkbox" checked={(activeWeapon as any)?.[key] ?? false}
                                onChange={e => setWeaponDirect(key as any, e.target.checked)}
                                className="h-5 w-5 accent-[#9e7f45]" />
                            </label>
                          ))}
                        </div>
                      </CollapsibleSection>

                      <CollapsibleSection title="Estado de conservação" defaultOpen={false}>
                        <div className="space-y-3">
                          {[
                            { key: "danoEstruturais", label: "Danos estruturais", obsKey: "danoEstruturaisObs" },
                            { key: "pecasFaltantes",  label: "Peças / componentes faltantes", obsKey: "pecasFaltantesObs" },
                          ].map(({ key, label, obsKey }) => (
                            <div key={key}>
                              <label className="flex items-center justify-between rounded-xl border border-[#e5d9c3] bg-white px-4 py-3">
                                <span className="text-[15px] font-medium text-[#26221b]">{label}</span>
                                <input type="checkbox" checked={(activeWeapon as any)?.[key] ?? false}
                                  onChange={e => setWeaponDirect(key as any, e.target.checked)}
                                  className="h-5 w-5 accent-[#9e7f45]" />
                              </label>
                              {(activeWeapon as any)?.[key] && (
                                <input value={(activeWeapon as any)?.[obsKey] ?? ""} onChange={handleWeaponField(obsKey as any)}
                                  className="mt-2 h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] shadow-sm"
                                  placeholder="Observações…" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                    </div>
                  )}

                  {/* ── FACA ── */}
                  {activeWeapon?.type === "FACA" && (
                    <div className="space-y-4">

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Identificação</label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                            placeholder="Ex.: Tramontina, Gerber…" />
                        </div>
                      </div>

                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        {/* Material da lâmina */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da lâmina</label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Tipo de lâmina */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de lâmina</label>
                          <button type="button" onClick={() => setTipoLaminaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.tipoLamina ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.tipoLamina || "Selecionar tipo…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Tipo de gume */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de gume</label>
                          <button type="button" onClick={() => setTipoGumePickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.tipoGume ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.tipoGume || "Selecionar tipo…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Acabamento */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Acabamento</label>
                          <button type="button" onClick={() => setAcabamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.acabamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.acabamento || "Selecionar acabamento…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        {/* Comprimentos */}
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compLamina", "Comprimento da lâmina", "Ex.: 120 mm"],
                            ["compTotal",  "Comprimento total",     "Ex.: 240 mm"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",      "ferrugemObs",      "Ferrugem presente"],
                            ["desgaste",      "desgasteObs",      "Desgaste na lâmina"],
                            ["manchas",       "manchasObs",       "Manchas / resíduos"],
                            ["danoEstruturais","danoEstruturaisObs","Danos estruturais"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Exame de corte">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["laminaIntegra",  "Lâmina íntegra"],
                            ["gumeFuncional",  "Gume funcional / afiado"],
                            ["caboDanificado", "Cabo danificado"],
                            ["aptaUso",        "Apta ao uso"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── ARMA DE PRESSÃO ── */}
                  {activeWeapon?.type === "ARMA DE PRESSÃO" && (
                    <div className="space-y-4" style={{ marginTop: '-0.625rem' }}>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Identificação
                            <HelpBtn title="Identificação" text="Designação comercial ou referência da arma de pressão. Inclua marca e modelo quando conhecidos. Ex.: Rossi M1000, Crosman 1077, Gamo Whisper." />
                          </label>
                          <input value={activeWeapon?.model ?? ""} onChange={handleWeaponField("model")}
                            className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                            placeholder="Ex.: Rossi 1000, Crosman 1077…" />
                        </div>
                        <div>
                          <label className={`mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] ${activeWeapon?.adaptadaArmaFogo === null ? "text-[#b0a08a]" : "text-[#6b5838]"}`}>
                            Calibre
                            <HelpBtn title="Calibre" text="Diâmetro nominal do projétil. Armas de pressão comuns utilizam 4,5 mm (.177) ou 5,5 mm (.22). Armas adaptadas para fogo real podem utilizar calibres de pistola ou revólver." />
                          </label>
                          <button type="button"
                            disabled={activeWeapon?.adaptadaArmaFogo === null}
                            onClick={() => setCalibreArmaPressaoPickerOpen(true)}
                            className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left transition ${activeWeapon?.adaptadaArmaFogo === null ? "cursor-not-allowed border-[#e0d8cc] bg-[#f5f2ed] opacity-50" : "border-[#cdbf9e] bg-[#fbf8f2] focus:border-[#9e7f45]"}`}>
                            <span className={`truncate text-[15px] ${activeWeapon?.caliber ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.adaptadaArmaFogo === null ? "Responda se foi adaptada para arma de fogo" : activeWeapon?.caliber || "Selecionar calibre…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                      </div>
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Sistema de acionamento
                            <HelpBtn title="Sistema de acionamento" text="Mecanismo que propele o projétil. Mola/pistão: mola comprimida libera pistão de ar. CO₂: cartucho de gás pressurizado. PCP: reservatório de ar pré-carregado externamente. Bomba manual: pressão acumulada por bombeamento." />
                          </label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Material
                            <HelpBtn title="Material" text="Material predominante da estrutura da arma. Ex.: aço, alumínio, polímero, zamak (liga de zinco). Relevante para determinar resistência e valor pericial." />
                          </label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {([
                            ["compCano",  "Comprimento do cano",  "Ex.: 200 mm", "Medida do cano desde a câmara até a boca. Influencia a velocidade do projétil e a precisão do disparo."],
                            ["compTotal", "Comprimento total",    "Ex.: 450 mm", "Medida total da arma da culatra à boca do cano, incluindo coronha quando fixa."],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string, string][]).map(([field, lbl, ph, help]) => (
                            <div key={field}>
                              <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                                {lbl}
                                <HelpBtn title={lbl} text={help} />
                              </label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",       "ferrugemObs",       "Ferrugem presente"],
                            ["desgaste",       "desgasteObs",       "Desgaste visível"],
                            ["danoEstruturais","danoEstruturaisObs","Danos estruturais"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>
                      <CollapsibleCard title="Funcionalidade">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["gatilhoFuncional", "Gatilho funcional"],
                            ["seguranca",        "Segurança funcional"],
                            ["aptaUso",          "Apta ao uso / disparo"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── ARMA DE ANTECARGA ── */}
                  {activeWeapon?.type === "ARMA DE ANTECARGA" && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                          Calibre (mm)
                          <HelpBtn title="Calibre" text="Diâmetro interno do cano em milímetros. Armas de antecarga utilizam calibres expressos em mm ou pol. (ex.: 9,14 mm = .36 cal; 11,17 mm = .44 cal)." />
                        </label>
                        <button type="button" onClick={() => setCalibreAntecargaPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.caliber ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                            {activeWeapon?.caliber || "Selecionar calibre…"}
                          </span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">País de fabricação</label>
                        <button type="button" onClick={() => setPaisPickerOpen(true)}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                          <span className={`truncate text-[15px] ${activeWeapon?.paisFabricacao ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                            {activeWeapon?.paisFabricacao || "Selecionar país…"}
                          </span>
                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                        </button>
                      </div>
                      <div className="rounded-2xl border border-[#d3c4a8] bg-white p-4 shadow-sm">
                        <label className="mb-3 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo de produção</label>
                        <div className="flex gap-2">
                          {(["INDUSTRIAL", "ARTESANAL"]).map(tipo => (
                            <button
                              key={tipo}
                              type="button"
                              onClick={() => { setWeaponDirect("tipoProd", tipo); if (tipo === "ARTESANAL") setWeaponDirect("serialEstado", "") }}
                              className={`flex-1 rounded-xl border-2 py-3 text-sm font-black tracking-[0.12em] transition active:scale-[.97] ${
                                activeWeapon?.tipoProd === tipo
                                  ? "border-[#9e7f45] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[#f0d08a] shadow-md"
                                  : "border-[#cdbf9e] bg-[#fbf8f2] text-[#6b5838]"
                              }`}
                            >
                              {tipo}
                            </button>
                          ))}
                        </div>

                        {/* Bloco de número de série — só para INDUSTRIAL */}
                        {activeWeapon?.tipoProd === "INDUSTRIAL" && (
                          <div className="mt-4 border-t border-[#e8dfc8] pt-4">
                            <label className="mb-3 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                              Número de série — estado
                              <HelpBtn title="Número de série" text="Indica a condição em que o número de série se encontra na arma. LEGÍVEL: completamente visível. PARCIAL: parte dos algarismos visível. SUPRIMIDO: intencionalmente removido ou apagado. NÃO APARENTE: não localizado no exame visual." />
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {(["LEGÍVEL", "PARCIAL", "SUPRIMIDO", "NÃO APARENTE"]).map(est => (
                                <button
                                  key={est}
                                  type="button"
                                  onClick={() => setWeaponDirect("serialEstado", est)}
                                  className={`rounded-xl border-2 py-2.5 text-xs font-black tracking-[0.08em] transition active:scale-[.97] ${
                                    activeWeapon?.serialEstado === est
                                      ? "border-[#9e7f45] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[#f0d08a]"
                                      : "border-[#cdbf9e] bg-[#fbf8f2] text-[#6b5838]"
                                  }`}
                                >
                                  {est}
                                </button>
                              ))}
                            </div>

                            {/* Input do número — só para LEGÍVEL ou PARCIAL */}
                            {(activeWeapon?.serialEstado === "LEGÍVEL" || activeWeapon?.serialEstado === "PARCIAL") && (
                              <div className="mt-3">
                                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                                  Número de série
                                </label>
                                <input
                                  value={activeWeapon?.serial ?? ""}
                                  onChange={handleWeaponField("serial")}
                                  className="h-14 w-full rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
                                  placeholder="Ex.: ABC-123456"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <CollapsibleSection title="Características físicas" defaultOpen={true}>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Sistema de ignição
                            <HelpBtn title="Sistema de ignição" text="Mecanismo usado para deflagrar a carga propulsora. Pederneira (flintlock): sílex golpeia frisa gerando faísca. Percussão: cão golpeia espoleta de fulminato. Mecha: corda incandescente aciona a carga." />
                          </label>
                          <button type="button" onClick={() => setSistemaAcionamentoPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.sistemaAcionamento ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.sistemaAcionamento || "Selecionar sistema…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 flex items-center text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                            Material do cano
                            <HelpBtn title="Material do cano" text="Material de que é feito o cano da arma. Ex.: aço, ferro forjado, bronze." />
                          </label>
                          <button type="button" onClick={() => setMaterialPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                              {activeWeapon?.material || "Selecionar material…"}
                            </span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material da coronha</label>
                          <button type="button" onClick={() => setMaterialCoronhaPickerOpen(true)}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                            <span className={`truncate text-[15px] ${activeWeapon?.materialCoroha ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>{activeWeapon?.materialCoroha || "Selecionar material…"}</span>
                            <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {([
                            ["compCano",  "Comprimento do cano", "Ex.: 190 mm"],
                            ["compTotal", "Comprimento total",   "Ex.: 380 mm"],
                          ] as [keyof Omit<WeaponEntry,"type">, string, string][]).map(([field, lbl, ph]) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{lbl}</label>
                              <input value={String(activeWeapon?.[field] ?? "")} onChange={handleWeaponField(field)}
                                className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                                placeholder={ph} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Estado de conservação">
                        <div className="space-y-3">
                          {([
                            ["ferrugem",       "ferrugemObs",       "Ferrugem / oxidação presente"],
                            ["desgaste",       "desgasteObs",       "Desgaste visível"],
                            ["danoEstruturais","danoEstruturaisObs","Danos estruturais"],
                          ] as [keyof Omit<WeaponEntry,"type">, keyof Omit<WeaponEntry,"type">, string][]).map(([key, obsKey, label]) => (
                            <div key={key}>
                              <label className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                                <input type="checkbox" checked={Boolean(activeWeapon?.[key] ?? false)} onChange={handleWeaponField(key)}
                                  className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                                {label}
                              </label>
                              {activeWeapon?.[key] && (
                                <textarea value={String(activeWeapon?.[obsKey] ?? "")} onChange={handleWeaponField(obsKey)}
                                  placeholder={`Descreva: ${label.toLowerCase()}`}
                                  className="mt-2 min-h-[72px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 py-2 text-[14px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Mecanismo de funcionamento">
                        <div className="space-y-2">
                          {([
                            ["gatilhoFuncional",  "Gatilho funcional"],
                            ["ignicaoFuncional",  "Mecanismo de ignição funcional"],
                            ["varetaPresente",    "Vareta de carga presente"],
                            ["canalDesobstruido", "Canal de ignição (ouvido) desobstruído"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean((activeWeapon as any)?.[key] ?? true)
                            const isNao = !isNa && !Boolean((activeWeapon as any)?.[key] ?? false)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>
                                  {label}
                                </span>
                                <div className="flex shrink-0 gap-1.5">
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, true);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isSim ? "bg-[#7d6334] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>SIM</button>
                                  <button type="button"
                                    onClick={() => {
                                      setWeaponDirect(key, false);
                                      if (isNa) handleWeaponNaToggle(key);
                                    }}
                                    className={cn("h-10 min-w-[52px] rounded-xl px-3 text-xs font-black uppercase tracking-wide transition active:scale-95",
                                      isNao ? "bg-[#b83232] text-white shadow-sm" : "border border-[#d3c4a8] bg-white text-[#9e7f45]"
                                    )}>NÃO</button>
                                  <button type="button"
                                    onClick={() => handleWeaponNaToggle(key)}
                                    className={cn("h-10 min-w-[44px] rounded-xl px-2 text-[10px] font-black uppercase tracking-wide transition active:scale-95",
                                      isNa ? "bg-[#b89a58] text-white shadow-sm" : "border border-[#e8dfc8] bg-white text-[#c8a96e]"
                                    )}>N/A</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Exame de disparo">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {([
                            ["aptoDisparo",    "Apta para disparo"],
                            ["testePercussao", "Teste de ignição / percussão"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-3 text-[15px] font-medium text-[#393025]">
                              <input type="checkbox" checked={Boolean((activeWeapon as any)?.[key] ?? true)} onChange={handleWeaponField(key)}
                                className="h-4 w-4 rounded border-[#a78a4d] accent-[#7d6334]" />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-[#ede3ce] pt-4">
                          <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Munições utilizadas no exame</label>
                          <div className="space-y-2">
                            {( [
                              ["TODAS",      "Exame feito com todas as munições que acompanham o material"],
                              ["AMOSTRAGEM", "Com uma amostragem das munições que acompanham o material"],
                              ["MISTA",      "Com as munições que acompanham o material e utilização de munições próprias cedidas pela unidade"],
                              ["PROPRIA",    "Apenas com munições próprias cedidas pela unidade"],
                            ] as const).map(([val, label]) => {
                              const sel = (activeWeapon as any)?.tipoMunicaoExame === val
                              return (
                                <button key={val} type="button"
                                  onClick={() => setWeaponDirect("tipoMunicaoExame" as any, sel ? "" : val)}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition active:scale-[0.99]",
                                    sel ? "border-[#7d6334] bg-[#7d6334]/10" : "border-[#cdbf9e] bg-white"
                                  )}>
                                  <span className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                                    sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"
                                  )}>
                                    {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                                  </span>
                                  <span className={`text-[12px] font-bold leading-tight ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{label}</span>
                                </button>
                              )
                            })}
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Calibre</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.tipoMunicaoDisparo ?? ""); setTipoMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`truncate text-[14px] ${activeWeapon?.tipoMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.tipoMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Qtd. utilizada</label>
                              <button type="button" onClick={() => { setTipoMunicaoCustom(activeWeapon?.qtdMunicaoDisparo ?? ""); setQtdMunicaoPickerOpen(true) }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-3 text-left transition active:bg-[#f0e8d0]">
                                <span className={`text-[14px] ${activeWeapon?.qtdMunicaoDisparo ? "font-medium text-[#26221b]" : "text-[#a09070]"}`}>
                                  {activeWeapon?.qtdMunicaoDisparo || "Selecionar…"}
                                </span>
                                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── CARREGADOR (peça independente) ── */}
                  {activeWeapon?.type === "CARREGADOR" && (
                    <div className="space-y-4">
                      <CollapsibleSection title="Características" defaultOpen={true}>
                        <div className="space-y-3">
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Capacidade</label>
                            <input value={String(activeWeapon?.capacidadeCarregador ?? "")} onChange={handleWeaponField("capacidadeCarregador")}
                              className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                              placeholder="Ex.: 17 cartuchos" />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Tipo</label>
                            <button type="button" onClick={() => setCarregadorPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.tipoCarregador?.length ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.tipoCarregador?.length ? activeWeapon.tipoCarregador.join(", ") : "Selecionar tipo…"}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Material</label>
                            <button type="button" onClick={() => setMaterialPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.material ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.material || "Selecionar material…"}
                              </span>
                              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[#b89a58]" />
                            </button>
                          </div>
                        </div>
                      </CollapsibleSection>
                      <CollapsibleCard title="Estado / Condição">
                        <div className="space-y-2">
                          {([
                            ["carregadorFuncional", "Carregador funcional (mola/segurador)"],
                            ["ferrugemPresente",    "Presença de ferrugem"],
                            ["danoEstruturais",     "Danos estruturais visíveis"],
                          ] as [keyof Omit<WeaponEntry,"type">, string][]).map(([key, label]) => {
                            const isNa = (activeWeapon?.naFlags ?? []).includes(key)
                            const isSim = !isNa && Boolean((activeWeapon as Record<string,unknown>)?.[key] ?? true)
                            const isNao = !isNa && !Boolean((activeWeapon as Record<string,unknown>)?.[key] ?? true)
                            return (
                              <div key={key} className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[#e8dfc8] bg-[#fdfaf4] px-4 py-3">
                                <span className={`flex-1 text-[15px] font-medium leading-tight ${isNa ? "opacity-40 line-through text-[#393025]" : "text-[#393025]"}`}>{label}</span>
                                <div className="flex shrink-0 gap-1.5">
                                  {(["SIM","NÃO","N/A"] as const).map(opt => {
                                    const active = opt === "N/A" ? isNa : opt === "SIM" ? isSim : isNao
                                    return (
                                      <button key={opt} type="button"
                                        onClick={() => {
                                          if (opt === "N/A") {
                                            handleWeaponNaToggle(key)
                                          } else {
                                            setWeaponDirect(key as keyof Omit<WeaponEntry,"type">, opt === "SIM")
                                            if (isNa) handleWeaponNaToggle(key)
                                          }
                                        }}
                                        className={cn("rounded-lg px-2.5 py-1 text-[11px] font-black tracking-[0.1em] transition",
                                          active ? "bg-[#7d6334] text-white" : "bg-[#e8dfc8] text-[#7a6540]")}>
                                        {opt}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleCard>
                    </div>
                  )}

                  {/* ── Acessórios e Embalagem (opcional) ── */}
                  {(["REVÓLVER", "PISTOLA", "PISTOLETE", "GARRUCHA", "ESPINGARDA", "CARABINA", "FUZIL", "METRALHADORA", "SUBMETRALHADORA", "ARMA DE ANTECARGA"] as WeaponType[]).includes(activeWeapon?.type as WeaponType) && (() => {
                    const hasData = !!(
                      (activeWeapon?.tipoAcessorio?.length ?? 0) > 0 ||
                      activeWeapon?.lacreEntradaAcessorio ||
                      activeWeapon?.lacreSaidaAcessorio ||
                      activeWeapon?.origemAcessorio ||
                      Object.keys(activeWeapon?.materialAcessorio ?? {}).length > 0 ||
                      activeWeapon?.descricaoAcessorio
                    )
                    const clearAcessorios = () => {
                      setAcessoriosEditando(false)
                      setWeaponDirect("tipoAcessorio" as any, [])
                      setWeaponDirect("lacreEntradaAcessorio" as any, "")
                      setWeaponDirect("lacreSaidaAcessorio" as any, "")
                      setWeaponDirect("origemAcessorio" as any, "")
                      setWeaponDirect("materialAcessorio" as any, {} as any)
                      setWeaponDirect("descricaoAcessorio" as any, "")
                    }
                    const temMira = activeWeapon?.tipoAcessorio?.includes("Mira")
                    const temCarregador = activeWeapon?.tipoAcessorio?.includes("Carregador")

                    /* ── Estado 1: card-resumo (salvo, não editando) ── */
                    if (hasData && !acessoriosEditando) return (
                      <div className="overflow-hidden rounded-xl border border-[#ddd0b3] bg-white shadow-sm">
                        <div className="flex items-stretch">
                          <button type="button" onClick={() => setAcessoriosEditando(true)}
                            className="flex flex-1 items-center gap-2.5 px-3 py-2.5 text-left transition active:bg-[#f5efe3]">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[#f0d08a]">
                              <Package className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b89a58]">Acessórios e Embalagem</div>
                              <div className="truncate text-[13px] font-black leading-tight text-[#26221b]">
                                {activeWeapon?.tipoAcessorio?.length
                                  ? activeWeapon.tipoAcessorio.join(", ")
                                  : <span className="font-medium italic text-[#b8a070]">Sem itens selecionados</span>}
                              </div>
                            </div>
                            <Pencil className="h-3.5 w-3.5 shrink-0 text-[#c8a96e]" />
                          </button>
                          <div className="my-2 w-px shrink-0 bg-[#e8dfc8]" />
                          <button type="button" onClick={() => setConfirmDeleteAcessorios(true)}
                            className="flex w-10 shrink-0 items-center justify-center text-[#c87070] transition active:bg-[#fdf0f0]">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="border-t border-[#f0e8d8] bg-[#fdfaf5] px-3 py-1.5">
                          <div className="flex flex-wrap gap-x-3 gap-y-0">
                            {activeWeapon?.lacreEntradaAcessorio && <span className="text-[10px] text-[#9e8255]">Lacre ent.: <span className="font-black text-[#50442f]">{activeWeapon.lacreEntradaAcessorio}</span></span>}
                            {activeWeapon?.lacreSaidaAcessorio  && <span className="text-[10px] text-[#9e8255]">Lacre saí.: <span className="font-black text-[#50442f]">{activeWeapon.lacreSaidaAcessorio}</span></span>}
                            {activeWeapon?.origemAcessorio       && <span className="text-[10px] text-[#9e8255]">Origem: <span className="font-black text-[#50442f]">{activeWeapon.origemAcessorio}</span></span>}
                          </div>
                        </div>
                      </div>
                    )

                    /* ── Estado 2: formulário completo (editando) ── */
                    if (acessoriosEditando) return (
                      <div className="overflow-hidden rounded-2xl border border-[#d5c7aa] bg-[#fbf8f3]">
                        <button
                          type="button"
                          onClick={() => setAcessoriosEditando(false)}
                          className="flex w-full items-center justify-between px-5 py-4 border-b border-[#ede3ce] transition active:bg-[#f0e8d0]"
                        >
                          <span className="text-sm font-black uppercase tracking-[0.14em] text-[#50442f]">Acessórios e Embalagem</span>
                          <ChevronUp className="h-4 w-4 text-[#9e7f45]" />
                        </button>
                        <div className="px-5 pt-5 pb-6 space-y-5">
                          {/* Itens */}
                          <div>
                            <label className="mb-2 flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">
                              Itens / Acessórios
                              <HelpBtn title="Acessórios e Embalagem" text="Registre aqui os itens apreendidos junto com o material: miras sobressalentes, carregadores extras, coldre, capa, maleta, vareta de limpeza, etc. Se houver mira ou carregador adicional, selecione o item e configure o tipo logo abaixo. A embalagem (lacre de entrada e saída) também é registrada nesta seção." />
                            </label>
                            <button type="button" onClick={() => setAcessorioPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.tipoAcessorio?.length ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.tipoAcessorio?.length ? activeWeapon.tipoAcessorio.join(", ") : "Selecionar itens…"}
                              </span>
                              <Plus className="h-4 w-4 text-[#b89a58]" />
                            </button>
                          </div>

                          {/* Sub-campo: Mira */}
                          {temMira && (
                            <div>
                              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Tipos de mira</label>
                              <button type="button" onClick={() => setMiraPickerOpen(true)}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                <span className={`truncate text-[15px] ${activeWeapon?.tipoMira?.length ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                  {activeWeapon?.tipoMira?.length ? activeWeapon.tipoMira.join(", ") : "Selecionar tipos de mira…"}
                                </span>
                                <ChevronRight className="h-4 w-4 text-[#b89a58]" />
                              </button>
                            </div>
                          )}

                          {/* Sub-campo: Carregador */}
                          {temCarregador && (
                            <div className="space-y-3">
                              <div>
                                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Tipo de carregador</label>
                                <button type="button" onClick={() => setCarregadorPickerOpen(true)}
                                  className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                  <span className={`truncate text-[15px] ${activeWeapon?.tipoCarregador?.length ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                    {activeWeapon?.tipoCarregador?.length ? activeWeapon.tipoCarregador.join(", ") : "Selecionar tipo…"}
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-[#b89a58]" />
                                </button>
                              </div>
                              {activeWeapon?.type !== "REVÓLVER" && (
                                <div>
                                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Capacidade</label>
                                  <input value={String(activeWeapon?.capacidadeCarregador ?? "")} onChange={handleWeaponField("capacidadeCarregador")}
                                    className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45]"
                                    placeholder="Ex.: 17 cartuchos" />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Origem */}
                          <div>
                            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Origem</label>
                            <button type="button" onClick={() => setOrigemAcessorioPickerOpen(true)}
                              className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                              <span className={`truncate text-[15px] ${activeWeapon?.origemAcessorio ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                {activeWeapon?.origemAcessorio || "Selecionar…"}
                              </span>
                              <ChevronRight className="h-4 w-4 text-[#b89a58]" />
                            </button>
                          </div>

                          {/* Material por item */}
                          {(activeWeapon?.tipoAcessorio ?? []).map((item) => {
                            const titulo = tituloMaterialAcessorio(item)
                            const valor = (activeWeapon?.materialAcessorio ?? {})[item] ?? ""
                            return (
                              <div key={item}>
                                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">{titulo}</label>
                                <button type="button" onClick={() => { setMaterialAcessorioItem(item); setMaterialAcessorioPickerOpen(true) }}
                                  className="flex h-12 w-full items-center justify-between rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-left transition focus:border-[#9e7f45]">
                                  <span className={`truncate text-[15px] ${valor ? "text-[#26221b] font-medium" : "text-[#a09070]"}`}>
                                    {valor || "Selecionar…"}
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-[#b89a58]" />
                                </button>
                              </div>
                            )
                          })}

                          {/* Descrição */}
                          <div>
                            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Descrição</label>
                            <textarea value={String(activeWeapon?.descricaoAcessorio ?? "")} onChange={handleWeaponField("descricaoAcessorio" as any)}
                              className="min-h-[80px] w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-[15px] outline-none transition focus:border-[#9e7f45]"
                              placeholder="Descreva os acessórios e o estado da embalagem..." />
                          </div>

                          {/* Lacre de Entrada */}
                          <div className="border-t border-[#ede3ce] pt-4">
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Lacre de Entrada</p>
                              <button
                                type="button"
                                onClick={() => {
                                  const ativo = activeWeapon?.lacreEntradaMesmoDaPeca
                                  setWeaponDirect("lacreEntradaMesmoDaPeca" as any, !ativo)
                                  if (!ativo) setWeaponDirect("lacreEntradaAcessorio" as any, activeWeapon?.lacreEntradaPeca ?? lacreNumero)
                                }}
                                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] transition ${
                                  activeWeapon?.lacreEntradaMesmoDaPeca
                                    ? "bg-[#d4a843] text-white"
                                    : "bg-[#f0e8d5] text-[#8d7854] hover:bg-[#e8d9b8]"
                                }`}
                              >
                                <Link2 className="h-3 w-3" />
                                Mesmo lacre da peça
                              </button>
                            </div>
                            <input
                              value={String(activeWeapon?.lacreEntradaAcessorio ?? "")}
                              onChange={handleWeaponField("lacreEntradaAcessorio" as any)}
                              disabled={!!activeWeapon?.lacreEntradaMesmoDaPeca}
                              className="mb-4 h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] disabled:opacity-50"
                              placeholder="Nº do lacre de entrada" />
                            {!activeWeapon?.lacreEntradaMesmoDaPeca && (
                              <div className="grid grid-cols-2 gap-3">
                                {([
                                  { key: "emb_ent_f", label: "Lacre Ent. (Frente)" },
                                  { key: "emb_ent_v", label: "Lacre Ent. (Verso)" },
                                ] as const).map((p) => {
                                  const photoKey = `acc_${p.key}_${effectivePhotoIdx}`
                                  return (
                                    <PhotoSlot key={p.key} slotKey={photoKey} label={p.label}
                                      photoUrl={photoUrls.get(photoKey)}
                                      onCapture={handlePhotoCapture} onRemove={handlePhotoRemove}
                                      onView={(url) => setViewerPhoto(url)} />
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Fotos do material */}
                          <div className="border-t border-[#ede3ce] pt-4">
                            <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Fotos do material</label>
                            <div className="grid grid-cols-2 gap-3">
                              {([
                                { key: "mat_ant",  label: "Mat. Anterior" },
                                { key: "mat_post", label: "Mat. Posterior" },
                              ] as const).map((p) => {
                                const photoKey = `acc_${p.key}_${effectivePhotoIdx}`
                                return (
                                  <PhotoSlot key={p.key} slotKey={photoKey} label={p.label}
                                    photoUrl={photoUrls.get(photoKey)}
                                    onCapture={handlePhotoCapture} onRemove={handlePhotoRemove}
                                    onView={(url) => setViewerPhoto(url)} />
                                )
                              })}
                            </div>
                          </div>

                          {/* Lacre de Saída */}
                          <div className="border-t border-[#ede3ce] pt-4">
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">Lacre de Saída</p>
                              <button
                                type="button"
                                onClick={() => {
                                  const ativo = activeWeapon?.lacreSaidaMesmoDaPeca
                                  setWeaponDirect("lacreSaidaMesmoDaPeca" as any, !ativo)
                                  if (!ativo) setWeaponDirect("lacreSaidaAcessorio" as any, activeWeapon?.lacreSaidaPeca ?? lacreSaidaNumero)
                                }}
                                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] transition ${
                                  activeWeapon?.lacreSaidaMesmoDaPeca
                                    ? "bg-[#d4a843] text-white"
                                    : "bg-[#f0e8d5] text-[#8d7854] hover:bg-[#e8d9b8]"
                                }`}
                              >
                                <Link2 className="h-3 w-3" />
                                Mesmo lacre da peça
                              </button>
                            </div>
                            <input
                              value={String(activeWeapon?.lacreSaidaAcessorio ?? "")}
                              onChange={handleWeaponField("lacreSaidaAcessorio" as any)}
                              disabled={!!activeWeapon?.lacreSaidaMesmoDaPeca}
                              className="mb-4 h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] disabled:opacity-50"
                              placeholder="Nº do lacre de saída" />
                            {!activeWeapon?.lacreSaidaMesmoDaPeca && (
                              <div className="grid grid-cols-2 gap-3">
                                {([
                                  { key: "emb_sai_f", label: "Lacre Saí. (Frente)" },
                                  { key: "emb_sai_v", label: "Lacre Saí. (Verso)" },
                                ] as const).map((p) => {
                                  const photoKey = `acc_${p.key}_${effectivePhotoIdx}`
                                  return (
                                    <PhotoSlot key={p.key} slotKey={photoKey} label={p.label}
                                      photoUrl={photoUrls.get(photoKey)}
                                      onCapture={handlePhotoCapture} onRemove={handlePhotoRemove}
                                      onView={(url) => setViewerPhoto(url)} />
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Botões Cancelar / Salvar */}
                          <div className="grid grid-cols-2 gap-3 border-t border-[#ede3ce] pt-4">
                            <button type="button"
                              onClick={() => { if (!hasData) clearAcessorios(); else setAcessoriosEditando(false) }}
                              className="rounded-2xl border border-[#a8894c] bg-[#efe1b5] py-3.5 text-sm font-black tracking-[0.14em] text-[#4b3b21] transition active:brightness-95">
                              CANCELAR
                            </button>
                            <button type="button" onClick={() => setAcessoriosEditando(false)}
                              className="rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-3.5 text-sm font-black tracking-[0.16em] text-[#f0d08a] shadow-[0_8px_20px_rgba(0,0,0,.25)] transition active:brightness-110">
                              SALVAR
                            </button>
                          </div>
                        </div>
                      </div>
                    )

                    /* ── Estado 3: botão "+ Adicionar" ── */
                    return (
                      <button type="button" onClick={() => setAcessoriosEditando(true)}
                        className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-[#cdbf9e] bg-[#fbf8f2] px-5 py-4 transition active:bg-[#ece6da]">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8dfc8]">
                          <Plus className="h-5 w-5 text-[#8d7854]" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#50442f]">Acessórios e Embalagem</p>
                          <p className="text-[11px] text-[#8d7854]">Opcional — toque para adicionar</p>
                        </div>
                      </button>
                    )
                  })()}
        {/* ── Picker: Tipo de munição ── */}
        <AnimatePresence>
          {tipoMunicaoPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setTipoMunicaoPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6"
                initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}>
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4">
                    <div className="text-base font-black text-[#f0d08a]">Calibre da munição</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione ou digite abaixo</div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {[".22 LR",".22 WMR",".25 ACP",".32 ACP (7,65mm)",".32 S&W Long",".32 H&R Magnum",".38 SPL",".38 SPL +P",".357 Magnum",".38 Super Auto",".380 ACP","9mm Luger","9mm Makarov",".357 SIG",".40 S&W","10mm Auto",".44 SPL",".44 Magnum",".45 ACP",".45 Colt","5,7×28mm","12 Ga","16 Ga","20 Ga","28 Ga",".410","5,56×45mm NATO",".223 Rem","7,62×39mm","7,62×51mm NATO",".308 Win","7,62×54R","5,45×39mm",".30-30 Win",".30 Carbine",".30-06","6,5mm Creedmoor",".338 Lapua",".50 BMG","Outro"].map(opt => {
                      const sel = activeWeapon?.tipoMunicaoDisparo === opt
                      return (
                        <button key={opt} type="button"
                          onClick={() => { setWeaponDirect("tipoMunicaoDisparo", opt); setTipoMunicaoPickerOpen(false) }}
                          className={`flex w-full items-center gap-3 border-b border-[#ede3ce] px-5 py-3.5 text-left transition active:bg-[#f0e8d0] ${sel ? "bg-[#f0e8d0]" : "bg-white"}`}>
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e]"}`}>
                            {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                          </span>
                          <span className={`text-[14px] font-bold ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{opt}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="p-4 space-y-3">
                    <input value={tipoMunicaoCustom} onChange={e => setTipoMunicaoCustom(e.target.value)}
                      placeholder="Outro calibre (ex.: .454 Casull, 6,8 SPC…)"
                      className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-white px-3 text-[14px] outline-none focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setTipoMunicaoPickerOpen(false)}
                        className="rounded-xl border border-[#d3c4a8] bg-[#ece6da] py-3 text-sm font-bold text-[#6b5838]">Cancelar</button>
                      <button type="button" onClick={() => { if (tipoMunicaoCustom.trim()) setWeaponDirect("tipoMunicaoDisparo", tipoMunicaoCustom.trim()); setTipoMunicaoPickerOpen(false) }}
                        className="rounded-xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-3 text-sm font-black text-[#f0d08a]">Confirmar</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Trocar tipo de peça ── */}
        <AnimatePresence>
          {changePieceTypeOpen && (
            <>
              <motion.div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setChangePieceTypeOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[120] flex items-end justify-center p-4"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}>
                <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4">
                    <div className="text-base font-black text-[#f0d08a]">Tipo de peça</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione o novo tipo</div>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                    {([
                      { label: "Armas de fogo",           types: ["REVÓLVER","PISTOLA","PISTOLETE","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","SUBMETRALHADORA","ARMA DE ANTECARGA"] },
                      { label: "Munição e componentes",   types: ["PROJÉTIL","CARTUCHO","ESTOJO","ESPOLETA","PÓLVORA","CARREGADOR"] },
                      { label: "Outras armas",            types: ["FACA","ARMA DE PRESSÃO","ARMA DE CHOQUE"] },
                    ] as { label: string; types: WeaponType[] }[]).map(group => (
                      <div key={group.label}>
                        <div className="mb-1 px-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9e8255]">{group.label}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {group.types.map(t => (
                            <button key={t} type="button"
                              onClick={() => {
                                const cur = weapons[activeWeaponIdx]
                                const next = makeWeaponEntry(t)
                                // Preserva campos comuns
                                next.idPeca        = cur?.idPeca        ?? ""
                                next.identificacao = cur?.identificacao ?? ""
                                next.brand         = cur?.brand         ?? ""
                                next.model         = cur?.model         ?? ""
                                next.caliber       = cur?.caliber       ?? ""
                                next.serial        = cur?.serial        ?? ""
                                next.quantidade    = cur?.quantidade    ?? ""
                                next.dataEntradaPeca   = cur?.dataEntradaPeca   ?? ""
                                next.dataLiberacaoPeca = cur?.dataLiberacaoPeca ?? ""
                                next.unidadeMedida     = cur?.unidadeMedida     ?? ""
                                next.consumidaExame    = cur?.consumidaExame    ?? ""
                                next.observacaoPeca    = cur?.observacaoPeca    ?? ""
                                const updated = [...weapons]
                                updated[activeWeaponIdx] = next
                                setWeapons(updated)
                                setWeaponType(t)
                                setChangePieceTypeOpen(false)
                              }}
                              className={`rounded-xl border-2 py-2.5 text-[11px] font-black uppercase tracking-[0.06em] transition active:scale-[.96] ${
                                weaponType === t
                                  ? "border-[#9e7f45] bg-[#12213d] text-[#f0d08a]"
                                  : "border-[#d3c4a8] bg-white text-[#26221b]"
                              }`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 pt-0">
                    <button type="button" onClick={() => setChangePieceTypeOpen(false)}
                      className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838] active:brightness-95">
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Quantidade utilizada ── */}
        <AnimatePresence>
          {qtdMunicaoPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setQtdMunicaoPickerOpen(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6"
                initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}>
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4">
                    <div className="text-base font-black text-[#f0d08a]">Quantidade utilizada</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione ou digite abaixo</div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {["1","2","3","4","5","6","7","8","9","10","12"].map(n => {
                      const sel = activeWeapon?.qtdMunicaoDisparo === n
                      return (
                        <button key={n} type="button"
                          onClick={() => { setWeaponDirect("qtdMunicaoDisparo", n); setQtdMunicaoPickerOpen(false) }}
                          className={`flex w-full items-center gap-3 border-b border-[#ede3ce] px-5 py-3.5 text-left transition active:bg-[#f0e8d0] ${sel ? "bg-[#f0e8d0]" : "bg-white"}`}>
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e]"}`}>
                            {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                          </span>
                          <span className={`text-[14px] font-bold ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{n}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="p-4 space-y-3">
                    <input value={tipoMunicaoCustom} onChange={e => setTipoMunicaoCustom(e.target.value)}
                      inputMode="numeric"
                      placeholder="Outra quantidade (ex.: 15)"
                      className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-white px-3 text-[14px] outline-none focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setQtdMunicaoPickerOpen(false)}
                        className="rounded-xl border border-[#d3c4a8] bg-[#ece6da] py-3 text-sm font-bold text-[#6b5838]">Cancelar</button>
                      <button type="button" onClick={() => { if (tipoMunicaoCustom.trim()) setWeaponDirect("qtdMunicaoDisparo", tipoMunicaoCustom.trim()); setTipoMunicaoCustom(""); setQtdMunicaoPickerOpen(false) }}
                        className="rounded-xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-3 text-sm font-black text-[#f0d08a]">Confirmar</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Acessórios ── */}
        <AnimatePresence>
          {acessorioPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setAcessorioPickerOpen(false)} />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4 border-b border-[#e5d9c3]">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Selecionar Acessórios</span>
                    <button type="button" onClick={() => setAcessorioPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                  {((): string[] => {
                    const base = ["Mira", "Coldre", "Capa", "Maletas", "Varetas", "Recipientes", "Balança", "Caixas"]
                    const t = activeWeapon?.type
                    if (t === "ARMA DE ANTECARGA") return base
                    if (t === "REVÓLVER" || t === "GARRUCHA") return ["Mira", "Carregador", ...base.filter(i => i !== "Mira")]
                    if (t === "PISTOLA" || t === "PISTOLETE" || t === "CARABINA") return ["Mira", "Carregador", ...base.filter(i => i !== "Mira")]
                    if (t === "ESPINGARDA") return ["Mira", "Carregador", "Cano Sobressalente", ...base.filter(i => i !== "Mira")]
                    if (t === "FUZIL") return ["Mira", "Carregador", "Bipé", ...base.filter(i => i !== "Mira")]
                    if (t === "METRALHADORA") return ["Mira", "Carregador", "Bipé", "Cinto de munição", ...base.filter(i => i !== "Mira")]
                    if (t === "SUBMETRALHADORA") return ["Mira", "Carregador", "Supressor", "Coronha", ...base.filter(i => i !== "Mira")]
                    if (t === "ARMA DE CHOQUE") return ["Carregador / Bateria", "Ponteiras / Dardos", ...base.filter(i => i !== "Mira")]
                    return base
                  })().map((acc) => {
                    const selected = (activeWeapon as any)?.tipoAcessorio?.includes(acc);
                    return (
                      <button key={acc} type="button"
                        onClick={() => {
                          const current = (activeWeapon as any)?.tipoAcessorio || [];
                          const next = selected ? current.filter((x: string) => x !== acc) : [...current, acc];
                          setWeaponDirect("tipoAcessorio" as any, next);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-4 transition ${selected ? "bg-[#7d6334] text-white" : "text-[#7a6540] hover:bg-[#efe1b5]"}`}>
                        <span className="text-sm font-bold uppercase tracking-wide">{acc}</span>
                        {selected && <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]" />}
                      </button>
                    )
                  })}
                </div>
                <div className="p-4 border-t border-[#e5d9c3]">
                  <button type="button" onClick={() => setAcessorioPickerOpen(false)}
                    className="w-full rounded-2xl bg-[#7d6334] py-4 text-sm font-black text-white">CONCLUIR</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Origem Acessório ── */}
        <AnimatePresence>
          {origemAcessorioPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setOrigemAcessorioPickerOpen(false)} />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4 border-b border-[#e5d9c3]">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Origem da Embalagem</span>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                  {["Delegacia de Polícia", "Local de Crime", "Instituto Médico Legal", "Outra Unidade", "Indeterminado"].map((opt) => {
                    const selected = activeWeapon?.origemAcessorio === opt;
                    return (
                      <button key={opt} type="button"
                        onClick={() => { setWeaponDirect("origemAcessorio" as any, opt); setOrigemAcessorioPickerOpen(false); }}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-4 transition ${selected ? "bg-[#7d6334] text-white" : "text-[#7a6540] hover:bg-[#efe1b5]"}`}>
                        <span className="text-sm font-bold uppercase tracking-wide">{opt}</span>
                        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </button>
                    )
                  })}
                </div>
                <div className="p-4">
                  <button type="button" onClick={() => setOrigemAcessorioPickerOpen(false)}
                    className="w-full rounded-2xl bg-[#efe1b5] py-4 text-sm font-black text-[#6b5838]">CANCELAR</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Material Acessório ── */}
        <AnimatePresence>
          {materialAcessorioPickerOpen && materialAcessorioItem && (() => {
            const materiaisPorItem: Record<string, string[]> = {
              "Varetas":           ["Alumínio", "Aço inoxidável", "Plástico", "Madeira", "Fibra de carbono"],
              "Recipientes":       ["Plástico (Frasco)", "Vidro", "Metal", "Alumínio", "Borracha"],
              "Balança":           ["Plástico", "Aço inoxidável", "Alumínio"],
              "Caixas":            ["Papelão", "Madeira", "Plástico rígido", "Metal", "MDF"],
              "Maletas":           ["Plástico ABS", "Alumínio", "Couro sintético", "Lona", "Polipropileno"],
              "Capa":              ["Couro", "Couro sintético", "Nylon", "Tecido", "Vinil"],
              "Coldre":            ["Couro", "Polímero", "Nylon", "Canvas", "Kydex"],
              "Mira":              ["Metal", "Alumínio", "Polímero", "Fibra de carbono"],
              "Carregador":        ["Polímero", "Aço", "Alumínio", "Liga de alumínio"],
              "Cano Sobressalente":["Aço", "Aço inoxidável", "Alumínio", "Inox escovado"],
              "Bipé":              ["Aço", "Alumínio", "Polímero", "Liga de alumínio"],
              "Cinto de munição":  ["Lona", "Couro", "Nylon", "Metal"],
            }
            const opcoes: string[] = [...(materiaisPorItem[materialAcessorioItem] ?? ["Plástico", "Metal", "Madeira", "Outro"])]
            if (!opcoes.includes("Outro")) opcoes.push("Outro")
            const valorAtual = (activeWeapon?.materialAcessorio ?? {})[materialAcessorioItem] ?? ""
            const titulo = tituloMaterialAcessorio(materialAcessorioItem)
            return (
              <>
                <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setMaterialAcessorioPickerOpen(false)} />
                <motion.div
                  className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 280 }}
                >
                  <div className="shrink-0 px-5 pb-3 pt-4 border-b border-[#e5d9c3]">
                    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">{titulo}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    {opcoes.map((opt) => {
                      const selected = valorAtual === opt
                      return (
                        <button key={opt} type="button"
                          onClick={() => {
                            const prev = activeWeapon?.materialAcessorio ?? {}
                            setWeaponDirect("materialAcessorio" as any, { ...prev, [materialAcessorioItem]: opt } as any)
                            setMaterialAcessorioPickerOpen(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-4 transition ${selected ? "bg-[#7d6334] text-white" : "text-[#7a6540] hover:bg-[#efe1b5]"}`}>
                          <span className="text-sm font-bold uppercase tracking-wide">{opt}</span>
                          {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </button>
                      )
                    })}
                  </div>
                  <div className="p-4">
                    <button type="button" onClick={() => setMaterialAcessorioPickerOpen(false)}
                      className="w-full rounded-2xl bg-[#efe1b5] py-4 text-sm font-black text-[#6b5838]">CANCELAR</button>
                  </div>
                </motion.div>
              </>
            )
          })()}
        </AnimatePresence>


                  {/* ── Imagens ── */}
                  <div>
                    <div className="mb-4 border-b border-[#d3c3a4] pb-2 text-lg font-black uppercase tracking-[0.16em] text-[#50442f]">
                      Imagens
                    </div>
                    {(() => {
                      const piecePhotos = Array.from(photoUrls.entries()).filter(([k]) => k.startsWith(`piece-${effectivePhotoIdx}-`))
                      const lacrePhotos = Array.from(photoUrls.entries()).filter(([k]) => k.startsWith("lacre-"))
                      return (
                        <div className="overflow-hidden rounded-2xl border-2 border-[#d3c4a8] bg-[#fbf8f3] shadow-sm">
                          {/* Área principal — abre tela de fotos da peça */}
                          <button
                            type="button"
                            onClick={() => setPhotosOpen(true)}
                            className="w-full text-left active:bg-[#ece6da]"
                          >
                            {piecePhotos.length > 0 ? (
                              <>
                                <div className="flex gap-2 overflow-x-auto p-3 pb-2">
                                  {piecePhotos.map(([k, url]) => (
                                    <img key={k} src={url} alt="" className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover" />
                                  ))}
                                </div>
                                <div className="flex items-center justify-between border-t border-[#e8dfc8] px-4 py-3">
                                  <span className="text-xs font-bold text-[#6b5838]">
                                    {piecePhotos.length} foto{piecePhotos.length > 1 ? "s" : ""} da peça
                                  </span>
                                  <div className="flex items-center gap-1 text-[#b89a58]">
                                    <span className="text-xs font-bold">Gerenciar</span>
                                    <ChevronRight className="h-4 w-4" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center gap-4 px-5 py-5">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                                  <Camera className="h-7 w-7 text-[#8d7854]" />
                                </div>
                                <div className="text-left">
                                  <div className="text-sm font-black uppercase tracking-[0.12em] text-[#50442f]">Adicionar fotos</div>
                                  <div className="mt-0.5 text-xs text-[#8d7854]">Fotografias da peça periciada</div>
                                </div>
                                <ChevronRight className="ml-auto h-5 w-5 text-[#b89a58]" />
                              </div>
                            )}
                          </button>

                          {/* Rodapé — fotos de lacre com rótulos */}
                          {lacrePhotos.length > 0 && (
                            <div className="flex items-center gap-3 border-t border-[#e8dfc8] bg-[#fdfaf5] px-4 py-2.5">
                              {lacrePhotos.map(([k, url]) => (
                                <button key={k} type="button" onClick={() => setViewerPhoto(url)} className="flex shrink-0 flex-col items-center gap-1">
                                  <img src={url} alt="lacre" className="h-9 w-9 rounded-lg border border-[#c8b47e] object-cover shadow-sm" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[#8d7854]">
                                    {k.startsWith("lacre-entrada-form") ? "Lacre E." : "Lacre S."}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>


                  {/* ── Lacre de Saída ── */}
                  <LacreInput
                    label="Lacre de Saída"
                    slotKey="lacre-saida-form"
                    value={activeWeapon?.lacreSaidaPeca ?? lacreSaidaNumero}
                    onChange={v => { setLacreSaidaNumero(v); setWeaponDirect("lacreSaidaPeca" as any, v) }}
                    allPhotoUrls={photoUrls}
                    onCapture={handlePhotoCapture}
                    onRemove={handlePhotoRemove}
                    onView={setViewerPhoto}
                    placeholder="Nº do lacre de saída"
                  />

                  {/* ── Data de Liberação ── */}
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                      Data de Liberação
                    </label>
                    <input
                      type="text"
                      value={activeWeapon?.dataLiberacaoPeca ?? ""}
                      onChange={handleWeaponField("dataLiberacaoPeca" as any)}
                      className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                      placeholder="DD/MM/AAAA"
                    />
                  </div>

                  {/* ── Observação da Peça ── */}
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">
                      Observação
                    </label>
                    <textarea
                      value={activeWeapon?.observacaoPeca ?? ""}
                      onChange={handleWeaponField("observacaoPeca" as any)}
                      rows={3}
                      className="w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 py-3 text-[15px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 resize-none"
                      placeholder="Observações sobre a peça…"
                    />
                  </div>

                  {/* ── Destinação da peça ── */}
                  <div className="rounded-2xl border border-[#d3c3a4] bg-[#fdf8f0] p-4">
                    <label className="mb-3 block text-sm font-black uppercase tracking-[0.14em] text-[#6b5838]">
                      Destinação da peça
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["LIBERADO", "CONSUMIDO"] as const).map(dest => (
                        <button
                          key={dest}
                          type="button"
                          onClick={() => setWeaponDirect("destinacao", activeWeapon?.destinacao === dest ? "" : dest)}
                          className={`rounded-xl border-2 py-3 text-sm font-black tracking-[0.12em] transition active:scale-[.97] ${
                            activeWeapon?.destinacao === dest
                              ? dest === "LIBERADO"
                                ? "border-[#4a9e6a] bg-[linear-gradient(180deg,#1a3d2a_0%,#0f2a1c_100%)] text-[#7de0a8]"
                                : "border-[#c05050] bg-[linear-gradient(180deg,#3d1a1a_0%,#2a0f0f_100%)] text-[#f0a0a0]"
                              : "border-[#cdbf9e] bg-[#fbf8f2] text-[#6b5838]"
                          }`}
                        >
                          {dest}
                        </button>
                      ))}
                    </div>
                  </div>

                  </div>{/* end space-y-6 body */}

                  {/* ── Footer ── */}
                  <div className="grid grid-cols-2 gap-3 border-t border-[#d3c3a4] pt-5 pb-20">
                    <button
                      type="button"
                      onClick={() => { resetPieceForm() }}
                      className="rounded-2xl border border-[#a8894c] bg-[#efe1b5] py-4 text-sm font-black tracking-[0.14em] text-[#4b3b21] transition hover:brightness-95"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="button"
                      onClick={savePiece}
                      className="rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-4 text-sm font-black tracking-[0.16em] text-[#f0d08a] shadow-[0_12px_24px_rgba(0,0,0,.28)] transition hover:brightness-110"
                    >
                      {editingPieceIdx !== null ? "ATUALIZAR PEÇA" : "SALVAR PEÇA"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* ── Picker: Qtd. Projéteis (coleta) ── */}
        <AnimatePresence>
          {coletaQtdProjeteisPicker && (
            <>
              <motion.div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setColetaQtdProjeteisPicker(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6"
                initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}>
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4">
                    <div className="text-base font-black text-[#f0d08a]">Qtd. projéteis coletados</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione ou digite abaixo</div>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {["1","2","3","4","5","6","7","8","9","10","12","15","20"].map(n => {
                      const sel = (coletaActivePieceIdx !== null ? savedPieces[coletaActivePieceIdx]?.coletaQtdProjeteis : "") === n
                      return (
                        <button key={n} type="button"
                          onClick={() => { if (coletaActivePieceIdx !== null) updateColeta(coletaActivePieceIdx, "coletaQtdProjeteis", n); setColetaQtdProjeteisPicker(false) }}
                          className={`flex w-full items-center gap-3 border-b border-[#ede3ce] px-5 py-3.5 text-left transition active:bg-[#f0e8d0] ${sel ? "bg-[#f0e8d0]" : "bg-white"}`}>
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e]"}`}>
                            {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                          </span>
                          <span className={`text-[14px] font-bold ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{n}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="p-4 space-y-3">
                    <input value={tipoMunicaoCustom} onChange={e => setTipoMunicaoCustom(e.target.value)}
                      inputMode="numeric" placeholder="Outra quantidade"
                      className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-white px-3 text-[14px] outline-none focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setColetaQtdProjeteisPicker(false)}
                        className="rounded-xl border border-[#d3c4a8] bg-[#ece6da] py-3 text-sm font-bold text-[#6b5838]">Cancelar</button>
                      <button type="button" onClick={() => { if (tipoMunicaoCustom.trim() && coletaActivePieceIdx !== null) updateColeta(coletaActivePieceIdx, "coletaQtdProjeteis", tipoMunicaoCustom.trim()); setTipoMunicaoCustom(""); setColetaQtdProjeteisPicker(false) }}
                        className="rounded-xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-3 text-sm font-black text-[#f0d08a]">Confirmar</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Qtd. Estojos (coleta) ── */}
        <AnimatePresence>
          {coletaQtdEstojosPicker && (
            <>
              <motion.div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setColetaQtdEstojosPicker(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6"
                initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}>
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4">
                    <div className="text-base font-black text-[#f0d08a]">Qtd. estojos coletados</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione ou digite abaixo</div>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {["1","2","3","4","5","6","7","8","9","10","12","15","20"].map(n => {
                      const sel = (coletaActivePieceIdx !== null ? savedPieces[coletaActivePieceIdx]?.coletaQtdEstojos : "") === n
                      return (
                        <button key={n} type="button"
                          onClick={() => { if (coletaActivePieceIdx !== null) updateColeta(coletaActivePieceIdx, "coletaQtdEstojos", n); setColetaQtdEstojosPicker(false) }}
                          className={`flex w-full items-center gap-3 border-b border-[#ede3ce] px-5 py-3.5 text-left transition active:bg-[#f0e8d0] ${sel ? "bg-[#f0e8d0]" : "bg-white"}`}>
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e]"}`}>
                            {sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}
                          </span>
                          <span className={`text-[14px] font-bold ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{n}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="p-4 space-y-3">
                    <input value={tipoMunicaoCustom} onChange={e => setTipoMunicaoCustom(e.target.value)}
                      inputMode="numeric" placeholder="Outra quantidade"
                      className="h-12 w-full rounded-xl border border-[#cdbf9e] bg-white px-3 text-[14px] outline-none focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35" />
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setColetaQtdEstojosPicker(false)}
                        className="rounded-xl border border-[#d3c4a8] bg-[#ece6da] py-3 text-sm font-bold text-[#6b5838]">Cancelar</button>
                      <button type="button" onClick={() => { if (tipoMunicaoCustom.trim() && coletaActivePieceIdx !== null) updateColeta(coletaActivePieceIdx, "coletaQtdEstojos", tipoMunicaoCustom.trim()); setTipoMunicaoCustom(""); setColetaQtdEstojosPicker(false) }}
                        className="rounded-xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-3 text-sm font-black text-[#f0d08a]">Confirmar</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Tipo do projétil (coleta) ── */}
        <AnimatePresence>
          {coletaTipoProjetilPicker && (
            <>
              <motion.div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setColetaTipoProjetilPicker(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6" initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 320 }}>
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4"><div className="text-base font-black text-[#f0d08a]">Tipo do projétil</div><div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione uma opção</div></div>
                  <div className="overflow-y-auto">
                    {["FMJ","HP","LRN","SP","BTHP","Slug","Outra"].map(opt => { const sel = coletaActivePieceIdx !== null && savedPieces[coletaActivePieceIdx]?.coletaTipoProjetil === opt; return (
                      <button key={opt} type="button" onClick={() => { if (coletaActivePieceIdx !== null) updateColeta(coletaActivePieceIdx, "coletaTipoProjetil", sel ? "" : opt); setColetaTipoProjetilPicker(false) }}
                        className={`flex w-full items-center gap-3 border-b border-[#ede3ce] px-5 py-3.5 text-left transition active:bg-[#f0e8d0] ${sel ? "bg-[#f0e8d0]" : "bg-white"}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e]"}`}>{sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}</span>
                        <span className={`text-[14px] font-bold ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{opt}</span>
                      </button>
                    )})}
                  </div>
                  <div className="p-4"><button type="button" onClick={() => setColetaTipoProjetilPicker(false)} className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Cancelar</button></div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Material do projétil (coleta) ── */}
        <AnimatePresence>
          {coletaMaterialProjetilPicker && (
            <>
              <motion.div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setColetaMaterialProjetilPicker(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6" initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 320 }}>
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4"><div className="text-base font-black text-[#f0d08a]">Material do projétil</div><div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione uma opção</div></div>
                  <div className="overflow-y-auto">
                    {["Chumbo","Cobre (FMJ)","Liga de chumbo","Aço"].map(opt => { const sel = coletaActivePieceIdx !== null && savedPieces[coletaActivePieceIdx]?.coletaMaterialProjetil === opt; return (
                      <button key={opt} type="button" onClick={() => { if (coletaActivePieceIdx !== null) updateColeta(coletaActivePieceIdx, "coletaMaterialProjetil", sel ? "" : opt); setColetaMaterialProjetilPicker(false) }}
                        className={`flex w-full items-center gap-3 border-b border-[#ede3ce] px-5 py-3.5 text-left transition active:bg-[#f0e8d0] ${sel ? "bg-[#f0e8d0]" : "bg-white"}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e]"}`}>{sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}</span>
                        <span className={`text-[14px] font-bold ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{opt}</span>
                      </button>
                    )})}
                  </div>
                  <div className="p-4"><button type="button" onClick={() => setColetaMaterialProjetilPicker(false)} className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Cancelar</button></div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Tipo do estojo (coleta) ── */}
        <AnimatePresence>
          {coletaTipoEstojoPicker && (
            <>
              <motion.div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setColetaTipoEstojoPicker(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6" initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 320 }}>
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4"><div className="text-base font-black text-[#f0d08a]">Tipo do estojo</div><div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione uma opção</div></div>
                  <div className="overflow-y-auto">
                    {["Cilíndrico","Flangeado","Semi-flangeado","Encaixado"].map(opt => { const sel = coletaActivePieceIdx !== null && savedPieces[coletaActivePieceIdx]?.coletaTipoEstojo === opt; return (
                      <button key={opt} type="button" onClick={() => { if (coletaActivePieceIdx !== null) updateColeta(coletaActivePieceIdx, "coletaTipoEstojo", sel ? "" : opt); setColetaTipoEstojoPicker(false) }}
                        className={`flex w-full items-center gap-3 border-b border-[#ede3ce] px-5 py-3.5 text-left transition active:bg-[#f0e8d0] ${sel ? "bg-[#f0e8d0]" : "bg-white"}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e]"}`}>{sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}</span>
                        <span className={`text-[14px] font-bold ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{opt}</span>
                      </button>
                    )})}
                  </div>
                  <div className="p-4"><button type="button" onClick={() => setColetaTipoEstojoPicker(false)} className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Cancelar</button></div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Material do estojo (coleta) ── */}
        <AnimatePresence>
          {coletaMaterialEstojoPicker && (
            <>
              <motion.div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setColetaMaterialEstojoPicker(false)} />
              <motion.div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6" initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 320 }}>
                <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                  <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4"><div className="text-base font-black text-[#f0d08a]">Material do estojo</div><div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione uma opção</div></div>
                  <div className="overflow-y-auto">
                    {["Latão","Aço","Alumínio","Latão niquelado"].map(opt => { const sel = coletaActivePieceIdx !== null && savedPieces[coletaActivePieceIdx]?.coletaMaterialEstojo === opt; return (
                      <button key={opt} type="button" onClick={() => { if (coletaActivePieceIdx !== null) updateColeta(coletaActivePieceIdx, "coletaMaterialEstojo", sel ? "" : opt); setColetaMaterialEstojoPicker(false) }}
                        className={`flex w-full items-center gap-3 border-b border-[#ede3ce] px-5 py-3.5 text-left transition active:bg-[#f0e8d0] ${sel ? "bg-[#f0e8d0]" : "bg-white"}`}>
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e]"}`}>{sel && <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><circle cx="5" cy="5" r="3" fill="white"/></svg>}</span>
                        <span className={`text-[14px] font-bold ${sel ? "text-[#4b3b21]" : "text-[#26221b]"}`}>{opt}</span>
                      </button>
                    )})}
                  </div>
                  <div className="p-4"><button type="button" onClick={() => setColetaMaterialEstojoPicker(false)} className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">Cancelar</button></div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <PhotosScreen
          photosOpen={photosOpen}
          weaponType={weaponType}
          activeWeapon={activeWeapon}
          photoUrls={photoUrls}
          gdlFotos={gdlFotos}
          currentPhotoIdx={currentPhotoIdx}
          savedPieces={savedPieces}
          photoSyncMap={photoSyncMap}
          onSync={handleSyncPhoto}
          onUnsync={handleUnsyncPhoto}
          onClose={() => setPhotosOpen(false)}
          onCapture={handlePhotoCapture}
          onRemove={handlePhotoRemove}
          onView={setViewerPhoto}
        />

        <WeaponFormProvider value={{
          weapon: activeWeapon ?? makeWeaponEntry("REVÓLVER"),
          handleField: handleWeaponField,
          setDirect: setWeaponDirect,
          naToggle: handleWeaponNaToggle,
          HelpBtn: HelpBtn as (props: { title: string; text: string }) => React.ReactElement,
          fieldHelper,
          clearFieldHelper: () => setFieldHelper(null),
          openMaterialPicker: () => setMaterialPickerOpen(true),
          openAcabamentoPicker: () => setAcabamentoPickerOpen(true),
          openCalibrePicker: () => setCalibrePickerOpen(true),
          openCalibreAntecargaPicker: () => setCalibreAntecargaPickerOpen(true),
          openCalibreArmaPressaoPicker: () => setCalibreArmaPressaoPickerOpen(true),
          openPaisPicker: () => setPaisPickerOpen(true),
          openSistemaAcionamentoPicker: () => setSistemaAcionamentoPickerOpen(true),
          openTipoRaiamentoPicker: () => setTipoRaiamentoPickerOpen(true),
          openMaterialCoronhaPicker: () => setMaterialCoronhaPickerOpen(true),
          openMaterialQuadroPicker: () => setMaterialQuadroPickerOpen(true),
          openSentidoPicker: () => setSentidoPickerOpen(true),
          openDeformacoesPicker: () => setDeformacoesPickerOpen(true),
          openFormatoPicker: () => setFormatoPickerOpen(true),
          openTipoLaminaPicker: () => setTipoLaminaPickerOpen(true),
          openTipoGumePicker: () => setTipoGumePickerOpen(true),
          openTipoPolvoraPicker: () => setTipoPolvoraPickerOpen(true),
          openTipoEspoletaPicker: () => setTipoEspoletaPickerOpen(true),
          openMiraPicker: () => setMiraPickerOpen(true),
          openCarregadorPicker: () => setCarregadorPickerOpen(true),
        }}>
        <AllPickers
          materialPickerOpen={materialPickerOpen}
          formatoPickerOpen={formatoPickerOpen}
          miraPickerOpen={miraPickerOpen}
          carregadorPickerOpen={carregadorPickerOpen}
          sentidoPickerOpen={sentidoPickerOpen}
          deformacoesPickerOpen={deformacoesPickerOpen}
          tipoLaminaPickerOpen={tipoLaminaPickerOpen}
          tipoGumePickerOpen={tipoGumePickerOpen}
          tipoRaiamentoPickerOpen={tipoRaiamentoPickerOpen}
          sistemaAcionamentoPickerOpen={sistemaAcionamentoPickerOpen}
          paisPickerOpen={paisPickerOpen}
          calibrePickerOpen={calibrePickerOpen}
          calibreAntecargaPickerOpen={calibreAntecargaPickerOpen}
          calibreArmaPressaoPickerOpen={calibreArmaPressaoPickerOpen}
          materialCoronhaPickerOpen={materialCoronhaPickerOpen}
          materialQuadroPickerOpen={materialQuadroPickerOpen}
          acabamentoPickerOpen={acabamentoPickerOpen}
          tipoPolvoraPickerOpen={tipoPolvoraPickerOpen}
          tipoEspoletaPickerOpen={tipoEspoletaPickerOpen}
          onClose={(picker) => {
            const setters: Record<string, (v: boolean) => void> = {
              material: setMaterialPickerOpen, formato: setFormatoPickerOpen, mira: setMiraPickerOpen,
              carregador: setCarregadorPickerOpen, sentido: setSentidoPickerOpen,
              deformacoes: setDeformacoesPickerOpen, tipoLamina: setTipoLaminaPickerOpen,
              tipoGume: setTipoGumePickerOpen, tipoRaiamento: setTipoRaiamentoPickerOpen,
              sistemaAcionamento: setSistemaAcionamentoPickerOpen, pais: setPaisPickerOpen,
              calibre: setCalibrePickerOpen, calibreAntecarga: setCalibreAntecargaPickerOpen,
              calibreArmaPressao: setCalibreArmaPressaoPickerOpen,
              materialCoronha: setMaterialCoronhaPickerOpen, materialQuadro: setMaterialQuadroPickerOpen,
              acabamento: setAcabamentoPickerOpen, tipoPolvora: setTipoPolvoraPickerOpen,
              tipoEspoleta: setTipoEspoletaPickerOpen,
            };
            setters[picker]?.(false)
          }}
        />

        {/* ── Picker: Tambor sobressalente (revólver) ── */}
        <AnimatePresence>
          {tamborPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setTamborPickerOpen(false)} />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[80vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Tambor sobressalente</span>
                    <button type="button" onClick={() => setTamborPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-[#8d7854]">Registra tambor extra apreendido. Não altera o calibre nominal da arma.</p>
                  <div className="mt-3">
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Quantidade de tambores</label>
                    <input
                      type="number"
                      min="1"
                      value={activeWeapon?.tamborSobressalenteQtd ?? ""}
                      onChange={handleWeaponField("tamborSobressalenteQtd" as keyof Omit<WeaponEntry,"type">)}
                      className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                      placeholder="Ex.: 1"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {([
                    { l: "Sem tambor sobressalente",      d: "Nenhum tambor adicional apreendido junto com a arma",                                caliber: "" },
                    { l: ".38 SPL",                       d: "Tambor .38 SPL; comum em revólveres .357 Magnum com câmaras menores",                caliber: ".38 SPL" },
                    { l: ".357 Magnum",                   d: "Tambor .357 Magnum; câmaras mais longas, aceita também .38 SPL",                    caliber: ".357 Magnum" },
                    { l: "9 mm Luger (moon clips)",       d: "Tambor adaptado para 9 mm com uso de moon clips; Taurus, S&W e outros",             caliber: "9 mm Luger (9×19mm)" },
                    { l: ".44 SPL",                       d: "Tambor para .44 SPL; câmaras menores que .44 Magnum",                               caliber: ".44 SPL" },
                    { l: ".44 Magnum",                    d: "Tambor .44 Magnum; câmaras maiores para maior pressão",                             caliber: ".44 Magnum" },
                    { l: ".45 ACP (moon clips)",          d: "Tambor .45 ACP com moon clips; comum em revólveres .45 Colt adaptados",             caliber: ".45 ACP" },
                    { l: ".45 Colt",                      d: "Tambor original de revólveres .45; câmaras clássicas",                              caliber: ".45 Colt" },
                    { l: ".22 LR",                        d: "Tambor rimfire .22 LR; usado em revólveres .22 WMR com tambor duplo",               caliber: ".22 LR" },
                    { l: ".22 WMR (.22 Mag)",             d: "Tambor .22 WMR; câmaras ligeiramente maiores que .22 LR",                          caliber: ".22 WMR (.22 Mag)" },
                    { l: ".32 H&R Magnum",                d: "Tambor .32 H&R Magnum; evolução do .32 S&W Long",                                  caliber: ".32 H&R Magnum" },
                    { l: ".32 S&W Long",                  d: "Tambor .32 S&W Long; calibre de revólveres compactos",                             caliber: ".32 S&W Long" },
                    { l: "Indeterminado",                 d: "Calibre do tambor sobressalente não pôde ser determinado",                          caliber: "" },
                  ] as { l: string; d: string; caliber: string }[]).map(({ l, d }, idx, arr) => {
                    const selected = (activeWeapon?.tamborSobressalente || "") === l || (l === "Sem tambor sobressalente" && !activeWeapon?.tamborSobressalente)
                    return (
                      <button key={l} type="button"
                        onClick={() => {
                          setWeaponDirect("tamborSobressalente", l === "Sem tambor sobressalente" ? "" : l)
                          if (l === "Sem tambor sobressalente") setWeaponDirect("tamborSobressalenteQtd", "")
                          setTamborPickerOpen(false)
                        }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-[15px] font-semibold leading-tight ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{l}</div>
                          <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{d}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Picker: Cano sobressalente (espingarda) ── */}
        <AnimatePresence>
          {canoSobresPickerOpen && (
            <>
              <motion.div className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCanoSobresPickerOpen(false)} />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[85vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Cano sobressalente</span>
                    <button type="button" onClick={() => setCanoSobresPickerOpen(false)}
                      className="rounded-xl border border-[#cdbf9e] bg-[#efe1b5] p-1.5 text-[#6b5838]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-[#8d7854]">Registra cano extra apreendido junto com a espingarda. Não altera o calibre nominal da arma.</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={activeWeapon?.canoSobressalenteQtd ?? ""}
                        onChange={handleWeaponField("canoSobressalenteQtd" as keyof Omit<WeaponEntry,"type">)}
                        className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: 1"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Comprimento</label>
                      <input
                        value={activeWeapon?.canoSobressalenteComp ?? ""}
                        onChange={handleWeaponField("canoSobressalenteComp" as keyof Omit<WeaponEntry,"type">)}
                        className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: 660 mm"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Material</label>
                      <input
                        value={activeWeapon?.canoSobressalenteMaterial ?? ""}
                        onChange={handleWeaponField("canoSobressalenteMaterial" as keyof Omit<WeaponEntry,"type">)}
                        className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: Aço"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Acabamento</label>
                      <input
                        value={activeWeapon?.canoSobressalenteAcabamento ?? ""}
                        onChange={handleWeaponField("canoSobressalenteAcabamento" as keyof Omit<WeaponEntry,"type">)}
                        className="h-11 w-full rounded-xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[15px] text-[#26221b] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35"
                        placeholder="Ex.: Brunido"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#8d7854]">Calibre nominal do cano sobressalente</p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {([
                    { l: "Sem cano sobressalente", d: "Nenhum cano adicional apreendido junto com a arma" },
                    { l: "12",                     d: "Calibre 12 (12 gauge) — o mais comum em espingardas" },
                    { l: "16",                     d: "Calibre 16 (16 gauge) — intermediário, menos comum atualmente" },
                    { l: "20",                     d: "Calibre 20 (20 gauge) — opção mais leve e compacta" },
                    { l: "28",                     d: "Calibre 28 (28 gauge) — espingardas leves de caça" },
                    { l: ".410 (36)",               d: "Calibre .410 bore / 36 — o menor calibre de espingarda convencional" },
                    { l: "Indeterminado",           d: "Calibre do cano sobressalente não pôde ser determinado" },
                  ]).map(({ l, d }, idx, arr) => {
                    const selected = (activeWeapon?.canoSobressalente || "") === l || (l === "Sem cano sobressalente" && !activeWeapon?.canoSobressalente)
                    return (
                      <button key={l} type="button"
                        onClick={() => {
                          setWeaponDirect("canoSobressalente", l === "Sem cano sobressalente" ? "" : l)
                          if (l === "Sem cano sobressalente") {
                            setWeaponDirect("canoSobressalenteQtd", "")
                            setWeaponDirect("canoSobressalenteComp", "")
                            setWeaponDirect("canoSobressalenteMaterial", "")
                            setWeaponDirect("canoSobressalenteAcabamento", "")
                          }
                          setCanoSobresPickerOpen(false)
                        }}
                        className={`flex w-full items-center gap-4 py-4 text-left ${idx < arr.length - 1 ? "border-b border-[#e5d9c3]" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-[#7d6334] bg-[#7d6334]" : "border-[#cdbf9e] bg-white"}`}>
                          {selected && <svg viewBox="0 0 12 10" className="h-3 w-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-[15px] font-semibold leading-tight ${selected ? "text-[#4b3b21]" : "text-[#7a6540]"}`}>{l}</div>
                          <div className="mt-0.5 text-[12px] text-[#a08c68] leading-snug">{d}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── GDL: Overlay de atualização ── */}
        <AnimatePresence>
          {atualizandoPecas && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-4 bg-black/60"
            >
              <Loader2 className="h-10 w-10 animate-spin text-[#f0d08a]" />
              <span className="text-sm font-black uppercase tracking-[0.2em] text-[#f0d08a]">
                {atualizandoPecasProgresso.fase || 'Sincronizando GDL…'}
              </span>
              {atualizandoPecasProgresso.total > 1 && (
                <span className="text-xs text-[#dcc17c] tracking-[0.14em]">
                  {atualizandoPecasProgresso.atual} / {atualizandoPecasProgresso.total}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── GDL: Toast de resultado ── */}
        <AnimatePresence>
          {gdlResultado && (
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
              className={`fixed bottom-24 inset-x-4 z-[96] flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl ${
                gdlResultado.ok ? "bg-[#1e3d1e] text-[#a8dba8]" : "bg-[#3d1e1e] text-[#dba8a8]"
              }`}
            >
              {gdlResultado.ok
                ? <CheckCircle2 className="h-5 w-5 shrink-0" />
                : <AlertCircle className="h-5 w-5 shrink-0" />
              }
              <span className="text-[13px] font-black">{gdlResultado.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmDialogs
          confirmDeletePieceIdx={confirmDeletePieceIdx}
          savedPieces={savedPieces}
          onDeletePiece={(idx) => { removeSavedPiece(idx); setConfirmDeletePieceIdx(null) }}
          onCancelDeletePiece={() => setConfirmDeletePieceIdx(null)}
          confirmDeleteMira={confirmDeleteMira}
          onDeleteMira={() => { setWeaponDirect("tipoMira", []); setConfirmDeleteMira(false) }}
          onCancelDeleteMira={() => setConfirmDeleteMira(false)}
          confirmDeleteCarregador={confirmDeleteCarregador}
          onDeleteCarregador={() => { setWeaponDirect("tipoCarregador", []); setConfirmDeleteCarregador(false) }}
          onCancelDeleteCarregador={() => setConfirmDeleteCarregador(false)}
          confirmDeleteAcessorios={confirmDeleteAcessorios}
          onDeleteAcessorios={() => {
            setAcessoriosEditando(false)
            setWeaponDirect("tipoAcessorio" as any, [])
            setWeaponDirect("lacreEntradaAcessorio" as any, "")
            setWeaponDirect("lacreSaidaAcessorio" as any, "")
            setWeaponDirect("origemAcessorio" as any, "")
            setWeaponDirect("materialAcessorio" as any, {} as any)
            setWeaponDirect("descricaoAcessorio" as any, "")
            setConfirmDeleteAcessorios(false)
          }}
          onCancelDeleteAcessorios={() => setConfirmDeleteAcessorios(false)}
        />

        <ProfilePanel
          profileView={profileView}
          setProfileView={setProfileView}
          onLogout={onLogout}
        />

        <LaudoDetailPanel
          laudoId={selectedLaudoId}
          onClose={() => setSelectedLaudoId(null)}
          onRefresh={recarregarLista}
          onEditar={handleEditarLaudo}
        />
        </WeaponFormProvider>

        {/* ── Catálogo — Sheet Fabricante ── */}
        <AnimatePresence>
          {catalogoMarcaPickerOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCatalogoMarcaPickerOpen(false)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[85vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Fabricante</span>
                    <button type="button" onClick={() => setCatalogoMarcaPickerOpen(false)}
                      className="rounded-full bg-[#e8dcc8] p-1.5"><X className="h-4 w-4 text-[#6b5838]" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-6">
                  {catalogoMarcas === undefined ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-[#9e7f45]" />
                    </div>
                  ) : (catalogoMarcas ?? []).length === 0 ? (
                    <p className="py-6 text-center text-[13px] text-[#a09070]">Nenhum fabricante encontrado para este tipo de arma.</p>
                  ) : (
                    (catalogoMarcas as string[]).map((marca: string) => (
                      <button key={marca} type="button"
                        onClick={() => {
                          setWeaponDirect("brand", marca)
                          setCatalogoMarcaSel(marca) // Ainda necessário para o título do picker de modelo
                          setWeaponDirect("model", "") // Limpa o modelo ao trocar de fabricante
                          setCatalogoMarcaPickerOpen(false)
                        }}
                        className={`flex w-full items-center justify-between border-b border-[#e0d0b0] py-3.5 text-left text-[15px] last:border-0 transition ${
                          activeWeapon?.brand === marca ? "font-black text-[#6b5838]" : "font-medium text-[#26221b] hover:text-[#6b5838]"
                        }`}
                      >
                        {marca} 
                        {activeWeapon?.brand === marca
                          ? <CheckCircle2 className="h-4 w-4 text-[#9e7f45]" />
                          : <ChevronRight className="h-4 w-4 text-[#b89a58]" />}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Catálogo — Sheet Modelo ── */}
        <AnimatePresence>
          {catalogoModeloPickerOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCatalogoModeloPickerOpen(false)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[150] flex max-h-[85vh] flex-col rounded-t-3xl border-t border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.35)]"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
              >
                <div className="shrink-0 px-5 pb-3 pt-4">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c5b08a]" />
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Modelo</span>
                      <p className="mt-0.5 text-[11px] text-[#8d7854]">{catalogoMarcaSel}</p>
                    </div>
                    <button type="button" onClick={() => setCatalogoModeloPickerOpen(false)}
                      className="rounded-full bg-[#e8dcc8] p-1.5"><X className="h-4 w-4 text-[#6b5838]" /></button>
                  </div>
                </div> 
                <div className="flex-1 overflow-y-auto px-4 pb-6">
                  {catalogoModelos === undefined ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-[#9e7f45]" />
                    </div>
                  ) : (catalogoModelos ?? []).length === 0 ? (
                    <p className="py-6 text-center text-[13px] text-[#a09070]">Nenhum modelo encontrado.</p>
                  ) : (
                    (catalogoModelos as string[]).map((modelo: string) => (
                      <button key={modelo} type="button"
                        onClick={() => {
                          setWeaponDirect("model", modelo) 
                          setCatalogoModeloSel(modelo)
                          setCatalogoModeloPickerOpen(false)
                        }}
                        className={`flex w-full items-center justify-between border-b border-[#e0d0b0] py-3.5 text-left text-[15px] last:border-0 transition ${
                          activeWeapon?.model === modelo ? "font-black text-[#6b5838]" : "font-medium text-[#26221b] hover:text-[#6b5838]"
                        }`}
                      >
                        {modelo} 
                        {activeWeapon?.model === modelo 
                          ? <CheckCircle2 className="h-4 w-4 text-[#9e7f45]" />
                          : <ChevronRight className="h-4 w-4 text-[#b89a58]" />}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>


        {/* ── Visualizador de Fotos ── */}
        <AnimatePresence>
          {viewerPhoto && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
            >
              <div className="flex items-center justify-between p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Visualização</div>
                <button onClick={() => setViewerPhoto(null)} className="rounded-full bg-white/10 p-2 text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-1 items-center justify-center p-4">
                <img src={viewerPhoto} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" alt="Foto ampliada" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
