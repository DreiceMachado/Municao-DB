import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronLeft, ChevronDown, FileText, Package,
  CheckCircle2, XCircle, Check, X, Camera,
  ArrowRight, Download, Pencil, Send, CircleCheck, SquarePen,
} from "lucide-react"
import { buscarLaudoCompleto, atualizarRepStatus, db } from "../lib/db"
import type { FotoLocal } from "../lib/db"
import type { WeaponEntry, RepStatus } from "../types"

// ── Pipeline helpers ──────────────────────────────────────────────────────────

const REP_STATUS_LABEL: Record<RepStatus, string> = {
  importada:    "Importada",
  editando:     "Em Edição",
  sincronizada: "Pronta",
  no_gdl:       "No GDL",
}

const REP_STATUS_ICON: Record<RepStatus, React.ElementType> = {
  importada:    Download,
  editando:     Pencil,
  sincronizada: CircleCheck,
  no_gdl:       Send,
}

const REP_STATUS_COLORS: Record<RepStatus, { badge: string; btn: string }> = {
  importada:    { badge: "bg-[#3d5a8a]/15 text-[#4e7ab5]",    btn: "border-[#4e7ab5] bg-[#eef3fa] text-[#2d5a95]" },
  editando:     { badge: "bg-[#8a6d2e]/15 text-[#b89240]",    btn: "border-[#b89240] bg-[#fdf5e6] text-[#8a6020]" },
  sincronizada: { badge: "bg-[#2e6b3e]/15 text-[#3d9b55]",    btn: "border-[#3d9b55] bg-[#eaf5ee] text-[#1e6b3a]" },
  no_gdl:       { badge: "bg-[#12213d]/15 text-[#8ea4c0]",    btn: "border-[#8ea4c0] bg-[#edf2f8] text-[#4e7ab5]" },
}

const NEXT_STATUS: Partial<Record<RepStatus, RepStatus>> = {
  importada:    "editando",
  editando:     "sincronizada",
  sincronizada: "no_gdl",
}

const NEXT_STATUS_LABEL: Partial<Record<RepStatus, string>> = {
  importada:    "Começar Edição",
  editando:     "Marcar como Pronta",
  sincronizada: "Marcar como Enviada ao GDL",
}

type LaudoCompleto = Awaited<ReturnType<typeof buscarLaudoCompleto>>

type Props = {
  laudoId: string | null
  onClose: () => void
  onRefresh?: () => void
  onEditar?: (laudoId: string) => void
}

// ── helpers ───────────────────────────────────────────────────────────────────

function str(v: string | undefined | null) { return v?.trim() || null }
function boolUsed(v: boolean | null | undefined) { return v === true || v === false }

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-[#ede3ce] last:border-0">
      <span className="min-w-[130px] shrink-0 text-[11px] font-black uppercase tracking-[0.12em] text-[#9e8c6e]">{label}</span>
      <span className="flex-1 text-sm text-[#26221b] font-medium">{value}</span>
    </div>
  )
}

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#ede3ce] last:border-0">
      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#9e8c6e]">{label}</span>
      {value
        ? <span className="flex items-center gap-1 text-[11px] font-black text-[#1a6b3e]"><Check className="h-3.5 w-3.5" />SIM</span>
        : <span className="flex items-center gap-1 text-[11px] font-black text-[#b03030]"><X className="h-3.5 w-3.5" />NÃO</span>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e8dfc8] bg-[#fdf8f0] overflow-hidden">
      <div className="bg-[#ede3ce] px-4 py-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b5838]">{title}</span>
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  )
}

// ── Galeria de fotos ──────────────────────────────────────────────────────────

function GaleriaFotos({ fotos }: { fotos: FotoLocal[] }) {
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null)

  if (fotos.length === 0) return null

  return (
    <>
      <Section title={`Fotos (${fotos.length})`}>
        <div className="grid grid-cols-2 gap-2 py-2">
          {fotos.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFotoAmpliada(f.imagemBase64)}
              className="group relative overflow-hidden rounded-xl border border-[#e8dfc8] bg-[#f5efe3] aspect-square"
            >
              <img
                src={f.imagemBase64}
                alt={f.slotLabel}
                className="h-full w-full object-cover transition group-active:brightness-90"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                <span className="text-[9px] font-bold text-white/90 uppercase tracking-wide line-clamp-1">
                  {f.slotLabel}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Foto ampliada */}
      <AnimatePresence>
        {fotoAmpliada && (
          <motion.div
            key="foto-ampliada"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setFotoAmpliada(null)}
          >
            <img
              src={fotoAmpliada}
              alt="Foto ampliada"
              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Detalhe de cada tipo de peça ─────────────────────────────────────────────

function PecaDetalhe({ d, fotos }: { d: WeaponEntry; fotos: FotoLocal[] }) {
  const isArmaFogo = ["REVÓLVER","PISTOLA","GARRUCHA","ESPINGARDA","CARABINA","FUZIL","METRALHADORA","ARMA DE ANTECARGA"].includes(d.type)
  const isPistola  = d.type === "PISTOLA"
  const isFuzilMtr = d.type === "FUZIL" || d.type === "METRALHADORA"
  const isProjetil = d.type === "PROJÉTIL"
  const isEstojo   = d.type === "ESTOJO"
  const isCartucho = d.type === "CARTUCHO"
  const isFaca     = d.type === "FACA"
  const isPressao  = d.type === "ARMA DE PRESSÃO"
  const isPolvora  = d.type === "PÓLVORA"
  const isEspoleta = d.type === "ESPOLETA"
  const isCarreg   = d.type === "CARREGADOR"

  return (
    <div className="space-y-3">

      {/* Identificação */}
      <Section title="Identificação">
        {str(d.tipoProd)        && <InfoRow label="Produção"      value={d.tipoProd} />}
        {str(d.brand)           && <InfoRow label="Fabricante"    value={d.brand} />}
        {str(d.model)           && <InfoRow label="Modelo"        value={d.model} />}
        {str(d.caliber)         && <InfoRow label="Calibre"       value={d.caliber} />}
        {str(d.paisFabricacao)  && <InfoRow label="País"          value={d.paisFabricacao} />}
        {str(d.identificacao)   && <InfoRow label="Identificação" value={d.identificacao} />}
        {str(d.origemMunicao)   && <InfoRow label="Origem"        value={d.origemMunicao} />}
        {str(d.quantidade)      && <InfoRow label="Quantidade"    value={d.quantidade} />}
        {(isArmaFogo || isPressao) && str(d.serial) && (
          <>
            <InfoRow label="Nº Série"    value={d.serial} />
            {str(d.serialEstado) && <InfoRow label="Estado série" value={d.serialEstado} />}
          </>
        )}
        {str(d.inscricaoFabricante) && <InfoRow label="Inscrição"    value={d.inscricaoFabricante} />}
        {str(d.origemProjetil)      && <InfoRow label="Origem"        value={d.origemProjetil} />}
        {str(d.origemProjetilRef)   && <InfoRow label="REP ref."      value={d.origemProjetilRef} />}
        {str(d.regiaoColeta)        && <InfoRow label="Região"        value={d.regiaoColeta} />}
      </Section>

      {/* Características Físicas */}
      {(isArmaFogo || isPressao) && (
        <Section title="Características Físicas">
          {str(d.material)             && <InfoRow label="Material"        value={d.material} />}
          {str(d.acabamento)           && <InfoRow label="Acabamento"      value={d.acabamento} />}
          {str(d.compCano)             && <InfoRow label="Comp. cano"      value={`${d.compCano} mm`} />}
          {str(d.compTotal)            && <InfoRow label="Comp. total"     value={`${d.compTotal} mm`} />}
          {str(d.numCamaras)           && <InfoRow label="Nº câmaras"      value={d.numCamaras} />}
          {str(d.numCanos)             && <InfoRow label="Nº canos"        value={d.numCanos} />}
          {str(d.capacidadeCarregador) && <InfoRow label="Cap. carregador" value={d.capacidadeCarregador} />}
          {str(d.sistemaAcionamento)   && <InfoRow label="Acionamento"     value={d.sistemaAcionamento} />}
          {str(d.tipoRaiamento)        && <InfoRow label="Raiamento"       value={d.tipoRaiamento} />}
          {str(d.tamanhoCamara)        && <InfoRow label="Câmara"          value={d.tamanhoCamara} />}
          {str(d.materialQuadro)       && <InfoRow label="Mat. quadro"     value={d.materialQuadro} />}
          {str(d.materialCoroha)       && <InfoRow label="Mat. coronha"    value={d.materialCoroha} />}
          {d.tipoMira?.length > 0      && <InfoRow label="Tipo mira"       value={d.tipoMira.join(", ")} />}
          {d.tipoCarregador?.length > 0 && <InfoRow label="Carregador"     value={d.tipoCarregador.join(", ")} />}
          {isPressao && boolUsed(d.adaptadaArmaFogo) && (
            <BoolRow label="Adaptada arma de fogo" value={d.adaptadaArmaFogo!} />
          )}
        </Section>
      )}

      {/* Mecanismo */}
      {isArmaFogo && (
        <Section title="Mecanismo de Funcionamento">
          {boolUsed(d.acaoSimples)      && <BoolRow label="Ação simples"       value={d.acaoSimples} />}
          {boolUsed(d.acaoDupla)        && <BoolRow label="Ação dupla"         value={d.acaoDupla} />}
          {boolUsed(d.tamborGira)       && <BoolRow label="Tambor gira"        value={d.tamborGira} />}
          {boolUsed(d.indexacaoCorreta) && <BoolRow label="Indexação correta"  value={d.indexacaoCorreta} />}
          {boolUsed(d.caoFuncional)     && <BoolRow label="Cão funcional"      value={d.caoFuncional} />}
          {boolUsed(d.gatilhoFuncional) && <BoolRow label="Gatilho funcional"  value={d.gatilhoFuncional} />}
          {boolUsed(d.seguranca)        && <BoolRow label="Segurança"          value={d.seguranca} />}
          {boolUsed(d.sistemaRepeticao) && <BoolRow label="Sist. repetição"    value={d.sistemaRepeticao} />}
          {isPistola && <>
            {boolUsed(d.carregadorPresente)    && <BoolRow label="Carregador presente"   value={d.carregadorPresente} />}
            {boolUsed(d.carregadorFuncional)   && <BoolRow label="Carregador funcional"  value={d.carregadorFuncional} />}
            {boolUsed(d.ferrolhoFuncional)     && <BoolRow label="Ferrolho funcional"    value={d.ferrolhoFuncional} />}
            {boolUsed(d.percussorFuncional)    && <BoolRow label="Percussor funcional"   value={d.percussorFuncional} />}
            {boolUsed(d.extratorFuncional)     && <BoolRow label="Extrator funcional"    value={d.extratorFuncional} />}
            {boolUsed(d.ejetorFuncional)       && <BoolRow label="Ejetor funcional"      value={d.ejetorFuncional} />}
            {boolUsed(d.retencaoFerrolho)      && <BoolRow label="Retenção ferrolho"     value={d.retencaoFerrolho} />}
            {boolUsed(d.alimentacaoFuncional)  && <BoolRow label="Alimentação funcional" value={d.alimentacaoFuncional} />}
          </>}
          {isFuzilMtr && <>
            {str(d.modoFogo)               && <InfoRow label="Modo de fogo"    value={d.modoFogo} />}
            {boolUsed(d.seletoDisparo)     && <BoolRow label="Seletor disparo"  value={d.seletoDisparo} />}
            {boolUsed(d.modoSemiAuto)      && <BoolRow label="Modo semi-auto"  value={d.modoSemiAuto} />}
            {boolUsed(d.modoAutoFuncional) && <BoolRow label="Auto funcional"  value={d.modoAutoFuncional} />}
            {boolUsed(d.culatelFuncional)  && <BoolRow label="Culatel funcional" value={d.culatelFuncional} />}
          </>}
        </Section>
      )}

      {/* Estado de Conservação */}
      {isArmaFogo && (
        <Section title="Estado de Conservação">
          {boolUsed(d.ferrugem)        && <><BoolRow label="Ferrugem"          value={d.ferrugem} />{d.ferrugem && str(d.ferrugemObs) && <InfoRow label="Obs." value={d.ferrugemObs} />}</>}
          {boolUsed(d.desgaste)        && <><BoolRow label="Desgaste"          value={d.desgaste} />{d.desgaste && str(d.desgasteObs) && <InfoRow label="Obs." value={d.desgasteObs} />}</>}
          {boolUsed(d.danoEstruturais) && <><BoolRow label="Danos estruturais" value={d.danoEstruturais} />{d.danoEstruturais && str(d.danoEstruturaisObs) && <InfoRow label="Obs." value={d.danoEstruturaisObs} />}</>}
          {boolUsed(d.pecasFaltantes)  && <><BoolRow label="Peças faltantes"   value={d.pecasFaltantes} />{d.pecasFaltantes && str(d.pecasFaltantesObs) && <InfoRow label="Obs." value={d.pecasFaltantesObs} />}</>}
          {isPistola && <>
            {boolUsed(d.desgasteMecanico) && <><BoolRow label="Desgaste mecânico" value={d.desgasteMecanico} />{d.desgasteMecanico && str(d.desgasteMecanicoObs) && <InfoRow label="Obs." value={d.desgasteMecanicoObs} />}</>}
            {boolUsed(d.danosAparentes)   && <><BoolRow label="Danos aparentes"   value={d.danosAparentes} />{d.danosAparentes && str(d.danosAparentesObs) && <InfoRow label="Obs." value={d.danosAparentesObs} />}</>}
          </>}
        </Section>
      )}

      {/* Exame de Disparo */}
      {isArmaFogo && (boolUsed(d.aptoDisparo) || str(d.tipoMunicaoDisparo)) && (
        <Section title="Exame de Disparo">
          {boolUsed(d.aptoDisparo)       && <BoolRow label="Apto para disparo"  value={d.aptoDisparo} />}
          {boolUsed(d.funcMunicaoReal)   && <BoolRow label="Func. munição real" value={d.funcMunicaoReal} />}
          {boolUsed(d.testePercussao)    && <BoolRow label="Teste percussão"    value={d.testePercussao} />}
          {boolUsed(d.marcacaoPercussor) && <BoolRow label="Marcação percussor" value={d.marcacaoPercussor} />}
          {isPistola && <>
            {boolUsed(d.extracaoFuncional) && <BoolRow label="Extração funcional" value={d.extracaoFuncional} />}
            {boolUsed(d.ejacaoFuncional)   && <BoolRow label="Ejeção funcional"   value={d.ejacaoFuncional} />}
            {boolUsed(d.ciclagemFuncional) && <BoolRow label="Ciclagem funcional" value={d.ciclagemFuncional} />}
          </>}
          {str(d.tipoMunicaoDisparo) && <InfoRow label="Munição usada"  value={d.tipoMunicaoDisparo} />}
          {str(d.qtdMunicaoDisparo)  && <InfoRow label="Qtd. disparada" value={d.qtdMunicaoDisparo} />}
        </Section>
      )}

      {/* PROJÉTIL */}
      {isProjetil && (
        <Section title="Dados do Projétil">
          {str(d.formato)               && <InfoRow label="Formato"         value={d.formato} />}
          {str(d.diametro)              && <InfoRow label="Diâmetro"        value={`${d.diametro} mm`} />}
          {str(d.diametroMin)           && <InfoRow label="Diâm. mínimo"    value={`${d.diametroMin} mm`} />}
          {str(d.massa)                 && <InfoRow label="Massa"           value={`${d.massa} g`} />}
          {str(d.alturaProjetil)        && <InfoRow label="Altura"          value={`${d.alturaProjetil} mm`} />}
          {str(d.numEstrias)            && <InfoRow label="Nº estrias"      value={d.numEstrias} />}
          {str(d.sentidoEstrias)        && <InfoRow label="Sentido estrias" value={d.sentidoEstrias} />}
          {str(d.deformacoesAcidentais) && <InfoRow label="Deformações"     value={d.deformacoesAcidentais} />}
          {str(d.estadoProjetil)        && <InfoRow label="Estado"          value={d.estadoProjetil} />}
          {boolUsed(d.estriasPresentes)   && <BoolRow label="Estrias presentes"  value={d.estriasPresentes} />}
          {boolUsed(d.deformacaoPresente) && <BoolRow label="Deformação"         value={d.deformacaoPresente} />}
          {boolUsed(d.fragmentado)        && <BoolRow label="Fragmentado"        value={d.fragmentado} />}
          {boolUsed(d.oxidacaoPresente)   && <BoolRow label="Oxidação"           value={d.oxidacaoPresente} />}
          {boolUsed(d.marcacaoExtrator)   && <BoolRow label="Marcação extrator"  value={d.marcacaoExtrator} />}
          {boolUsed(d.marcacaoEjetor)     && <BoolRow label="Marcação ejetor"    value={d.marcacaoEjetor} />}
          {boolUsed(d.marcacaoCamara)     && <BoolRow label="Marcação câmara"    value={d.marcacaoCamara} />}
        </Section>
      )}

      {/* ESTOJO */}
      {isEstojo && (
        <Section title="Dados do Estojo">
          {str(d.formato)               && <InfoRow label="Formato"           value={d.formato} />}
          {str(d.diametro)              && <InfoRow label="Diâmetro"          value={`${d.diametro} mm`} />}
          {str(d.estadoEstojo)          && <InfoRow label="Estado"            value={d.estadoEstojo} />}
          {boolUsed(d.oxidacaoPresente)   && <BoolRow label="Oxidação"           value={d.oxidacaoPresente} />}
          {boolUsed(d.marcacaoPercussor)  && <BoolRow label="Marcação percussor" value={d.marcacaoPercussor} />}
          {boolUsed(d.marcacaoExtrator)   && <BoolRow label="Marcação extrator"  value={d.marcacaoExtrator} />}
          {boolUsed(d.marcacaoEjetor)     && <BoolRow label="Marcação ejetor"    value={d.marcacaoEjetor} />}
          {boolUsed(d.marcacaoCamara)     && <BoolRow label="Marcação câmara"    value={d.marcacaoCamara} />}
        </Section>
      )}

      {/* CARTUCHO */}
      {isCartucho && (
        <Section title="Dados do Cartucho">
          {str(d.estadoCartucho) && <InfoRow label="Estado"   value={d.estadoCartucho} />}
          {boolUsed(d.completo)  && <BoolRow label="Completo" value={d.completo} />}
          {boolUsed(d.amassado)  && <BoolRow label="Amassado" value={d.amassado} />}
        </Section>
      )}

      {/* FACA */}
      {isFaca && (
        <Section title="Dados da Faca">
          {str(d.tipoLamina) && <InfoRow label="Tipo lâmina"  value={d.tipoLamina} />}
          {str(d.compLamina) && <InfoRow label="Comp. lâmina" value={`${d.compLamina} mm`} />}
          {str(d.tipoGume)   && <InfoRow label="Tipo gume"    value={d.tipoGume} />}
          {boolUsed(d.gumeFuncional)  && <BoolRow label="Gume funcional"   value={d.gumeFuncional} />}
          {boolUsed(d.aptaUso)        && <BoolRow label="Apta para uso"    value={d.aptaUso} />}
          {boolUsed(d.laminaIntegra)  && <BoolRow label="Lâmina íntegra"   value={d.laminaIntegra} />}
          {boolUsed(d.caboDanificado) && <BoolRow label="Cabo danificado"  value={d.caboDanificado} />}
          {boolUsed(d.manchas)        && <BoolRow label="Manchas"          value={d.manchas} />}
          {d.manchas && str(d.manchasObs) && <InfoRow label="Obs. manchas" value={d.manchasObs} />}
          {d.institucional !== null && boolUsed(d.institucional) && (
            <BoolRow label="Institucional" value={d.institucional!} />
          )}
        </Section>
      )}

      {/* PÓLVORA */}
      {isPolvora && (
        <Section title="Dados da Pólvora">
          {str(d.tipoPolvora) && <InfoRow label="Tipo"       value={d.tipoPolvora} />}
          {str(d.cor)         && <InfoRow label="Cor"        value={d.cor} />}
          {str(d.massa)       && <InfoRow label="Massa"      value={`${d.massa} g`} />}
          {str(d.quantidade)  && <InfoRow label="Quantidade" value={d.quantidade} />}
        </Section>
      )}

      {/* ESPOLETA */}
      {isEspoleta && (
        <Section title="Dados da Espoleta">
          {str(d.tipoEspoleta)           && <InfoRow label="Tipo"            value={d.tipoEspoleta} />}
          {str(d.quantidade)             && <InfoRow label="Quantidade"      value={d.quantidade} />}
          {boolUsed(d.marcacaoPercussor) && <BoolRow label="Marca percussor" value={d.marcacaoPercussor} />}
        </Section>
      )}

      {/* CARREGADOR */}
      {isCarreg && (
        <Section title="Dados do Carregador">
          {str(d.material)             && <InfoRow label="Material"   value={d.material} />}
          {str(d.capacidadeCarregador) && <InfoRow label="Capacidade" value={d.capacidadeCarregador} />}
          {str(d.quantidade)           && <InfoRow label="Quantidade" value={d.quantidade} />}
        </Section>
      )}

      {/* Acessórios */}
      {(d.tipoAcessorio?.length > 0 || str(d.descricaoAcessorio)) && (
        <Section title="Acessórios e Embalagem">
          {d.tipoAcessorio?.length > 0  && <InfoRow label="Tipo"        value={d.tipoAcessorio.join(", ")} />}
          {str(d.origemAcessorio)        && <InfoRow label="Origem"      value={d.origemAcessorio} />}
          {str(d.lacreEntradaAcessorio)  && <InfoRow label="Lacre ent."  value={d.lacreEntradaAcessorio} />}
          {str(d.lacreSaidaAcessorio)    && <InfoRow label="Lacre saída" value={d.lacreSaidaAcessorio} />}
          {str(d.descricaoAcessorio)     && <InfoRow label="Descrição"   value={d.descricaoAcessorio} />}
        </Section>
      )}

      {/* Coleta de Padrão */}
      {d.coletaSalva && (
        <Section title="Coleta de Padrão">
          {str(d.coletaNumero)           && <InfoRow label="Nº coleta"     value={d.coletaNumero} />}
          {str(d.coletaRepAno)           && <InfoRow label="REP/Ano"       value={d.coletaRepAno} />}
          {str(d.coletaMunicaoTipo)      && <InfoRow label="Munição"       value={d.coletaMunicaoTipo} />}
          {str(d.coletaQtdProjeteis)     && <InfoRow label="Qtd projéteis" value={d.coletaQtdProjeteis} />}
          {str(d.coletaQtdEstojos)       && <InfoRow label="Qtd estojos"   value={d.coletaQtdEstojos} />}
          {str(d.coletaTipoProjetil)     && <InfoRow label="Tipo projétil" value={d.coletaTipoProjetil} />}
          {str(d.coletaMaterialProjetil) && <InfoRow label="Mat. projétil" value={d.coletaMaterialProjetil} />}
          {str(d.coletaTipoEstojo)       && <InfoRow label="Tipo estojo"   value={d.coletaTipoEstojo} />}
          {str(d.coletaMaterialEstojo)   && <InfoRow label="Mat. estojo"   value={d.coletaMaterialEstojo} />}
          {str(d.coletaLacreSaida)       && <InfoRow label="Lacre saída"   value={d.coletaLacreSaida} />}
        </Section>
      )}

      {/* Fotos */}
      <GaleriaFotos fotos={fotos} />

      {/* Destinação */}
      {str(d.destinacao) && (
        <div className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 ${
          d.destinacao === "LIBERADO"
            ? "border-[#4a9e6a] bg-[#e8f5ee]"
            : "border-[#c05050] bg-[#fde8e8]"
        }`}>
          <span className="text-xs font-black uppercase tracking-[0.16em] text-[#50442f]">Destinação</span>
          <span className={`text-sm font-black uppercase tracking-[0.14em] ${
            d.destinacao === "LIBERADO" ? "text-[#1a6b3e]" : "text-[#b03030]"
          }`}>{d.destinacao}</span>
        </div>
      )}
    </div>
  )
}

// ── Card expansível de peça ───────────────────────────────────────────────────

function PecaCard({ arma, index }: {
  arma: NonNullable<LaudoCompleto>["armas"][number]
  index: number
}) {
  const [expandido, setExpandido] = useState(false)
  const d = arma.dados as WeaponEntry

  const resumo = [str(d.brand), str(d.model), str(d.caliber)].filter(Boolean).join(" — ")

  return (
    <div className="rounded-3xl border border-[#d3c4a8] bg-white overflow-hidden shadow-sm">
      {/* Cabeçalho — sempre visível, clicável */}
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="w-full bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-3.5 flex items-center gap-3 active:brightness-110"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0d08a]/15 text-xs font-black text-[#f0d08a]">
          {index + 1}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-black text-[#f0d08a] uppercase tracking-[0.1em]">{d.type}</div>
          {resumo && <div className="text-[10px] text-[#8ea4c0] mt-0.5">{resumo}</div>}
        </div>

        {/* badges resumo */}
        <div className="flex items-center gap-2 shrink-0">
          {arma.fotos.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-[#f0d08a]/15 px-2 py-0.5 text-[9px] font-black text-[#f0d08a]">
              <Camera className="h-3 w-3" />{arma.fotos.length}
            </span>
          )}
          {str(d.destinacao) && (
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
              d.destinacao === "LIBERADO" ? "bg-[#1a6b3e]/30 text-[#7de0a8]" : "bg-[#b03030]/30 text-[#f0a0a0]"
            }`}>{d.destinacao}</span>
          )}
          <ChevronDown className={`h-4 w-4 text-[#f0d08a]/60 transition-transform duration-200 ${expandido ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Conteúdo expansível */}
      <AnimatePresence initial={false}>
        {expandido && (
          <motion.div
            key="peca-conteudo"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <PecaDetalhe d={d} fotos={arma.fotos as FotoLocal[]} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function LaudoDetailPanel({ laudoId, onClose, onRefresh, onEditar }: Props) {
  const open = !!laudoId
  const [dados, setDados] = useState<LaudoCompleto>(null)
  const [carregando, setCarregando] = useState(false)
  // Status da REP importada correspondente (o rascunho aberto não carrega o repStatus).
  const [repStatusFonte, setRepStatusFonte] = useState<RepStatus | undefined>(undefined)

  const recarregar = (id: string) => {
    setCarregando(true)
    buscarLaudoCompleto(id).then(async (d) => {
      setDados(d)
      let status: RepStatus | undefined = d?.laudo.repStatus ?? undefined
      if (d?.laudo && !status && d.laudo.examNumber) {
        // Rascunho: busca a REP importada de mesmo número/ano que tenha estágio.
        const rep = await db.laudos
          .filter(l => l.examNumber === d.laudo.examNumber && l.examYear === d.laudo.examYear && !!l.repStatus)
          .first()
        status = rep?.repStatus
      }
      setRepStatusFonte(status)
      setCarregando(false)
    })
  }

  useEffect(() => {
    if (!laudoId) { setDados(null); return }
    recarregar(laudoId)
  }, [laudoId])

  return (
    <>
      {/* Backdrop desktop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="laudo-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[129] hidden bg-black/40 lg:block"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Painel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="laudo-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[130] flex w-full flex-col bg-[#f5efe3] text-[#26221b] lg:w-[520px] lg:shadow-[-24px_0_64px_rgba(0,0,0,.3)]"
          >
            {/* Header */}
            <div className="shrink-0 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
              <div className="flex items-center gap-3">
                <button type="button" onClick={onClose}
                  className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a]">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-black text-[#f0d08a]">
                    {dados?.laudo.examNumber
                      ? `REP ${dados.laudo.examNumber}/${dados.laudo.examYear}`
                      : "Detalhes do Exame"}
                  </div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#8ea4c0]">
                      {(dados?.laudo.repStatus ?? repStatusFonte)
                        ? REP_STATUS_LABEL[(dados?.laudo.repStatus ?? repStatusFonte)!]
                        : dados?.laudo.status === "finalizado" ? "Finalizado" : "Em execução"}
                    </span>
                    {(dados?.laudo.repStatus ?? repStatusFonte) && (() => {
                      const s = (dados?.laudo.repStatus ?? repStatusFonte)!
                      const Icon = REP_STATUS_ICON[s]
                      return (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${REP_STATUS_COLORS[s].badge}`}>
                          <Icon className="h-3 w-3" />
                          {REP_STATUS_LABEL[s]}
                        </span>
                      )
                    })()}
                  </div>
                </div>
                {onEditar && dados && (
                  <button
                    type="button"
                    onClick={() => onEditar(dados.laudo.localId)}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl border border-[#f0d08a]/40 bg-[#f0d08a]/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#f0d08a] transition hover:bg-[#f0d08a]/20 active:brightness-95"
                  >
                    <SquarePen className="h-3.5 w-3.5" />
                    Editar
                  </button>
                )}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {carregando && (
                <div className="flex items-center justify-center py-16 text-[#8d7854]">
                  <svg className="h-6 w-6 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Carregando...
                </div>
              )}

              {!carregando && dados && (
                <>
                  {/* Dados do Laudo */}
                  <div className="rounded-3xl border border-[#d3c4a8] bg-white overflow-hidden shadow-sm">
                    <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#f0d08a]" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#f0d08a]">Dados do Exame</span>
                      </div>
                      <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                        dados.laudo.status === "finalizado"
                          ? "bg-[#1a6b3e]/30 text-[#7de0a8]"
                          : "bg-[#f0d08a]/15 text-[#f0d08a]"
                      }`}>
                        {(dados.laudo.repStatus ?? repStatusFonte)
                          ? <><CheckCircle2 className="h-3 w-3" /> {REP_STATUS_LABEL[(dados.laudo.repStatus ?? repStatusFonte)!]}</>
                          : dados.laudo.status === "finalizado"
                            ? <><CheckCircle2 className="h-3 w-3" /> Finalizado</>
                            : <><XCircle className="h-3 w-3" /> Em execução</>}
                      </span>
                    </div>
                    <div className="px-5 py-4 space-y-0">
                      <InfoRow label="REP"     value={`${dados.laudo.examNumber || "—"}/${dados.laudo.examYear}`} />
                      <InfoRow label="Perito"  value={dados.laudo.expert || "—"} />
                      <InfoRow label="Unidade" value={dados.laudo.unit || "—"} />
                      <InfoRow label="Data"    value={dados.laudo.date || "—"} />
                      {str(dados.laudo.caseNumber) && <InfoRow label="Boletim" value={dados.laudo.caseNumber!} />}
                    </div>
                    {str(dados.laudo.observacoes) && (
                      <div className="border-t border-[#ede3ce] px-5 py-4">
                        <div className="mb-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#9e8c6e]">Observações</div>
                        <p className="text-sm text-[#40362a] leading-relaxed">{dados.laudo.observacoes}</p>
                      </div>
                    )}
                  </div>

                  {/* Pipeline de estágio */}
                  {(() => {
                    const repStatus = dados.laudo.repStatus ?? repStatusFonte
                    const estagios: RepStatus[] = ["importada", "editando", "sincronizada", "no_gdl"]
                    const idxAtual = repStatus ? estagios.indexOf(repStatus) : -1
                    return (
                      <div className="rounded-3xl border border-[#d3c4a8] bg-white overflow-hidden shadow-sm">
                        <div className="bg-[#ede3ce] px-4 py-2 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b5838]">Estágio da REP</span>
                          {repStatus && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${REP_STATUS_COLORS[repStatus].badge}`}>
                              {REP_STATUS_LABEL[repStatus]}
                            </span>
                          )}
                        </div>
                        {/* Barra de progresso */}
                        <div className="flex px-4 pt-3 pb-1 gap-1">
                          {estagios.map((s, i) => {
                            const Icon = REP_STATUS_ICON[s]
                            const done = i <= idxAtual
                            return (
                              <div key={s} className="flex-1 flex flex-col items-center gap-1">
                                <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${done ? "border-[#3d9b55] bg-[#3d9b55]/10 text-[#3d9b55]" : "border-[#d3c4a8] text-[#c0b090]"}`}>
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span className={`text-center text-[8px] font-black uppercase tracking-[0.1em] leading-tight ${done ? "text-[#3d9b55]" : "text-[#c0b090]"}`}>
                                  {REP_STATUS_LABEL[s]}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        {/* Rastreamento agora é automático — sem botão de avançar estágio. */}
                        {repStatus === "no_gdl" && (
                          <div className="px-4 pb-4 pt-1 text-center text-xs font-bold text-[#3d9b55]">
                            ✓ Enviada ao GDL
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Peças */}
                  {dados.armas.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 px-1">
                        <Package className="h-4 w-4 text-[#9e7f45]" />
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#6b5838]">
                          Peças periciadas ({dados.armas.length})
                        </span>
                        <span className="ml-auto text-[10px] text-[#9e8c6e]">toque para expandir</span>
                      </div>
                      {dados.armas.map((arma, i) => (
                        <PecaCard key={arma.localId} arma={arma} index={i} />
                      ))}
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#cab88d] bg-[#fbf8f3] px-4 py-8 text-center">
                      <Package className="h-8 w-8 mx-auto mb-2 text-[#cab88d]" />
                      <p className="text-sm text-[#6e614d]">Nenhuma peça registrada.</p>
                    </div>
                  )}
                </>
              )}

              {!carregando && !dados && (
                <div className="rounded-2xl border border-dashed border-[#cab88d] bg-[#fbf8f3] px-4 py-8 text-center text-sm text-[#6e614d]">
                  Exame não encontrado.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
