import { useCallback, useEffect, useMemo, useState } from "react"
import type { ComponentType } from "react"
import CropperDefault from "react-easy-crop"
import type { Area } from "react-easy-crop"
import "react-easy-crop/react-easy-crop.css"
import {
  RotateCcw, RotateCw, Check, X, FlipHorizontal2, FlipVertical2,
  Crop as CropIcon, SlidersHorizontal, Sun, Contrast, Droplet, Thermometer, Undo2,
} from "lucide-react"

// O index.d.ts (CJS) do react-easy-crop só reexporta tipos, perdendo o default;
// o cast recupera o componente (a lib aplica os defaults das props não informadas).
const Cropper = CropperDefault as unknown as ComponentType<Record<string, unknown>>

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener("load", () => resolve(img))
    img.addEventListener("error", reject)
    img.src = url
  })
}

function rotateSize(width: number, height: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  }
}

// Gera a imagem recortada + girada + com ajustes (filtro) como Blob JPEG.
async function getCroppedBlob(
  src: string, pixelCrop: Area, rotation: number, filtro: string,
): Promise<Blob> {
  const image = await createImage(src)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  const rotRad = (rotation * Math.PI) / 180
  const { width: bW, height: bH } = rotateSize(image.width, image.height, rotation)
  canvas.width = bW
  canvas.height = bH
  ctx.translate(bW / 2, bH / 2)
  ctx.rotate(rotRad)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  const out = document.createElement("canvas")
  const octx = out.getContext("2d")!
  out.width = Math.round(pixelCrop.width)
  out.height = Math.round(pixelCrop.height)
  // Aplica os mesmos ajustes do preview (brilho/contraste/etc.) ao exportar.
  octx.filter = filtro
  octx.drawImage(
    canvas,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  )
  return new Promise((resolve) => out.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.92))
}

// Espelha a imagem (H/V) e devolve um novo data URL, para o preview e a exportação
// usarem a mesma origem já espelhada.
async function espelhar(src: string, flipH: boolean, flipV: boolean): Promise<string> {
  const img = await createImage(src)
  const c = document.createElement("canvas")
  c.width = img.width
  c.height = img.height
  const cx = c.getContext("2d")!
  cx.translate(flipH ? img.width : 0, flipV ? img.height : 0)
  cx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  cx.drawImage(img, 0, 0)
  return c.toDataURL("image/jpeg", 0.95)
}

type Aspecto = { label: string; value?: number }

type Ajustes = { brilho: number; contraste: number; saturacao: number; calor: number }
const AJUSTES_PADRAO: Ajustes = { brilho: 100, contraste: 100, saturacao: 100, calor: 0 }

function montarFiltro(a: Ajustes): string {
  const sepia = a.calor > 0 ? a.calor : 0            // calor positivo = mais quente
  const hue = a.calor < 0 ? a.calor * 0.8 : 0        // calor negativo = mais frio (azulado)
  return `brightness(${a.brilho}%) contrast(${a.contraste}%) saturate(${a.saturacao}%) sepia(${sepia}%) hue-rotate(${hue}deg)`
}

type Props = {
  src: string
  onSave: (file: File) => void
  onCancel: () => void
}

export function PhotoEditor({ src, onSave, onCancel }: Props) {
  const [aba, setAba] = useState<"cortar" | "ajustes">("cortar")

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [giro90, setGiro90] = useState(0)          // 0/90/180/270
  const [nivelar, setNivelar] = useState(0)        // -45..45 (régua fina)
  const [aspect, setAspect] = useState<number | undefined>(4 / 3)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_PADRAO)

  // Origem de trabalho já espelhada (quando flip ativo). Mantém preview = exportação.
  const [workingSrc, setWorkingSrc] = useState(src)
  const [aspectoOriginal, setAspectoOriginal] = useState<number | undefined>(undefined)

  useEffect(() => {
    let vivo = true
    createImage(src).then(img => { if (vivo) setAspectoOriginal(img.width / img.height) })
    return () => { vivo = false }
  }, [src])

  useEffect(() => {
    let vivo = true
    if (!flipH && !flipV) { setWorkingSrc(src); return }
    espelhar(src, flipH, flipV).then(url => { if (vivo) setWorkingSrc(url) })
    return () => { vivo = false }
  }, [src, flipH, flipV])

  const filtro = useMemo(() => montarFiltro(ajustes), [ajustes])
  const rotationTotal = giro90 + nivelar

  // Auto-zoom ao nivelar: escala mínima para a imagem inclinada continuar cobrindo
  // todo o recorte (sem cantos vazios) — igual ao Fotos do Windows.
  const aspectAtual = aspect ?? aspectoOriginal ?? 4 / 3
  const autoZoom = useMemo(() => {
    const rad = (nivelar * Math.PI) / 180
    const c = Math.abs(Math.cos(rad))
    const s = Math.abs(Math.sin(rad))
    return c + Math.max(aspectAtual, 1 / aspectAtual) * s
  }, [nivelar, aspectAtual])
  const zoomEfetivo = zoom * autoZoom

  const aspectos: Aspecto[] = [
    { label: "Original", value: aspectoOriginal },
    { label: "1:1", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:4", value: 3 / 4 },
    { label: "16:9", value: 16 / 9 },
    { label: "9:16", value: 9 / 16 },
  ]

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => setCroppedArea(areaPixels), [])

  const ajustesAlterados = ajustes.brilho !== 100 || ajustes.contraste !== 100 ||
    ajustes.saturacao !== 100 || ajustes.calor !== 0
  const cortarAlterado = giro90 !== 0 || nivelar !== 0 || flipH || flipV || zoom !== 1

  const handleSave = async () => {
    if (!croppedArea) return
    setSaving(true)
    try {
      const blob = await getCroppedBlob(workingSrc, croppedArea, rotationTotal, filtro)
      onSave(new File([blob], `foto_${Date.now()}.jpg`, { type: "image/jpeg" }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#1b1b1b]">
      {/* Topo */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#2c2c2c] bg-[#202020] px-4 py-3">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-[#e6e6e6] active:bg-white/10">
          <X className="h-4 w-4" /> Cancelar
        </button>
        <span className="text-[13px] font-bold text-[#c9c9c9]">Editar foto</span>
        <button type="button" onClick={handleSave} disabled={saving || !croppedArea}
          className="flex items-center gap-1.5 rounded-lg bg-[#f0d08a] px-3 py-1.5 text-[13px] font-black text-[#1b1b1b] active:brightness-95 disabled:opacity-50">
          <Check className="h-4 w-4" /> {saving ? "..." : "Salvar"}
        </button>
      </div>

      {/* Área da imagem */}
      <div className="relative flex-1">
        <Cropper
          image={workingSrc}
          crop={crop}
          zoom={zoomEfetivo}
          minZoom={autoZoom}
          maxZoom={3 * autoZoom}
          rotation={rotationTotal}
          aspect={aspectAtual}
          onCropChange={setCrop}
          onZoomChange={(z: number) => setZoom(Math.min(3, Math.max(1, z / autoZoom)))}
          onCropComplete={onCropComplete}
          showGrid={aba === "cortar"}
          style={{ mediaStyle: { filter: filtro }, containerStyle: { background: "#1b1b1b" } }}
        />
      </div>

      {/* Controles */}
      <div className="shrink-0 border-t border-[#2c2c2c] bg-[#202020] px-4 pb-7 pt-3">
        {aba === "cortar" ? (
          <div className="space-y-3">
            {/* Proporções */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {aspectos.map(a => {
                const ativo = (aspect ?? aspectoOriginal) === a.value
                return (
                  <button key={a.label} type="button" onClick={() => setAspect(a.value)}
                    className={`shrink-0 rounded-lg border px-3.5 py-1.5 text-[12px] font-bold transition ${ativo ? "border-[#f0d08a] bg-[#f0d08a]/15 text-[#f0d08a]" : "border-[#3a3a3a] text-[#c9c9c9]"}`}>
                    {a.label}
                  </button>
                )
              })}
            </div>

            {/* Girar / Espelhar */}
            <div className="flex items-center justify-center gap-2">
              <button type="button" onClick={() => setGiro90(g => (g - 90 + 360) % 360)} title="Girar à esquerda"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3a3a3a] text-[#e6e6e6] active:scale-95">
                <RotateCcw className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setGiro90(g => (g + 90) % 360)} title="Girar à direita"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3a3a3a] text-[#e6e6e6] active:scale-95">
                <RotateCw className="h-5 w-5" />
              </button>
              <div className="mx-1 h-7 w-px bg-[#3a3a3a]" />
              <button type="button" onClick={() => setFlipH(v => !v)} title="Espelhar na horizontal"
                className={`flex h-11 w-11 items-center justify-center rounded-xl border active:scale-95 ${flipH ? "border-[#f0d08a] bg-[#f0d08a]/15 text-[#f0d08a]" : "border-[#3a3a3a] text-[#e6e6e6]"}`}>
                <FlipHorizontal2 className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setFlipV(v => !v)} title="Espelhar na vertical"
                className={`flex h-11 w-11 items-center justify-center rounded-xl border active:scale-95 ${flipV ? "border-[#f0d08a] bg-[#f0d08a]/15 text-[#f0d08a]" : "border-[#3a3a3a] text-[#e6e6e6]"}`}>
                <FlipVertical2 className="h-5 w-5" />
              </button>
            </div>

            {/* Régua de nivelar (straighten) */}
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a9a9a]">
                <span>Nivelar</span>
                <span className="text-[#f0d08a]">{nivelar > 0 ? "+" : ""}{nivelar}°</span>
              </div>
              <input type="range" min={-45} max={45} step={1} value={nivelar}
                onChange={e => setNivelar(Number(e.target.value))}
                className="h-2 w-full accent-[#f0d08a]" aria-label="Nivelar" />
            </div>

            {/* Zoom */}
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a9a9a]">Zoom</div>
              <input type="range" min={1} max={3} step={0.01} value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="h-2 w-full accent-[#f0d08a]" aria-label="Zoom" />
            </div>

            {cortarAlterado && (
              <button type="button"
                onClick={() => { setGiro90(0); setNivelar(0); setFlipH(false); setFlipV(false); setZoom(1) }}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#9a9a9a] active:text-[#e6e6e6]">
                <Undo2 className="h-3.5 w-3.5" /> Redefinir corte
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {([
              { key: "brilho",    label: "Brilho",    Icon: Sun,         min: 0,    max: 200, base: 100, suf: "%" },
              { key: "contraste", label: "Contraste", Icon: Contrast,    min: 0,    max: 200, base: 100, suf: "%" },
              { key: "saturacao", label: "Saturação", Icon: Droplet,     min: 0,    max: 200, base: 100, suf: "%" },
              { key: "calor",     label: "Calor",     Icon: Thermometer, min: -100, max: 100, base: 0,   suf: "" },
            ] as const).map(({ key, label, Icon, min, max, base, suf }) => {
              const val = ajustes[key]
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a9a9a]">
                    <span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{label}</span>
                    <span className="text-[#f0d08a]">{val - base > 0 && suf === "" ? "+" : ""}{suf === "%" ? val : val - base}{suf}</span>
                  </div>
                  <input type="range" min={min} max={max} step={1} value={val}
                    onChange={e => setAjustes(a => ({ ...a, [key]: Number(e.target.value) }))}
                    className="h-2 w-full accent-[#f0d08a]" aria-label={label} />
                </div>
              )
            })}
            {ajustesAlterados && (
              <button type="button" onClick={() => setAjustes(AJUSTES_PADRAO)}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#9a9a9a] active:text-[#e6e6e6]">
                <Undo2 className="h-3.5 w-3.5" /> Redefinir ajustes
              </button>
            )}
          </div>
        )}

        {/* Abas (Cortar / Ajustes) */}
        <div className="mt-3 flex items-center justify-center gap-2 border-t border-[#2c2c2c] pt-3">
          <button type="button" onClick={() => setAba("cortar")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-bold transition ${aba === "cortar" ? "bg-white/10 text-[#f0d08a]" : "text-[#c9c9c9]"}`}>
            <CropIcon className="h-4 w-4" /> Cortar
          </button>
          <button type="button" onClick={() => setAba("ajustes")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-bold transition ${aba === "ajustes" ? "bg-white/10 text-[#f0d08a]" : "text-[#c9c9c9]"}`}>
            <SlidersHorizontal className="h-4 w-4" /> Ajustes
          </button>
        </div>
      </div>
    </div>
  )
}
