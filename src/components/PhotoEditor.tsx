import { useCallback, useState } from "react"
import type { ComponentType } from "react"
import CropperDefault from "react-easy-crop"
import type { Area } from "react-easy-crop"
import "react-easy-crop/react-easy-crop.css"
import { RotateCcw, RotateCw, Check, X } from "lucide-react"

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

// Gera a imagem recortada + girada como Blob JPEG.
async function getCroppedBlob(src: string, pixelCrop: Area, rotation: number): Promise<Blob> {
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
  octx.drawImage(
    canvas,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  )
  return new Promise((resolve) => out.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.9))
}

const ASPECTS = [
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
]

type Props = {
  src: string
  onSave: (file: File) => void
  onCancel: () => void
}

export function PhotoEditor({ src, onSave, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [aspect, setAspect] = useState(4 / 3)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => setCroppedArea(areaPixels), [])

  const handleSave = async () => {
    if (!croppedArea) return
    setSaving(true)
    try {
      const blob = await getCroppedBlob(src, croppedArea, rotation)
      onSave(new File([blob], `foto_${Date.now()}.jpg`, { type: "image/jpeg" }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      {/* Área de recorte */}
      <div className="relative flex-1">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          showGrid
        />
      </div>

      {/* Controles */}
      <div className="shrink-0 space-y-4 border-t border-[#2a3a5b] bg-[#12213d] px-5 pb-8 pt-4">
        {/* Proporção */}
        <div className="flex items-center justify-center gap-2">
          {ASPECTS.map(a => (
            <button key={a.label} type="button" onClick={() => setAspect(a.value)}
              className={`rounded-lg border px-4 py-1.5 text-[12px] font-black tracking-[0.1em] transition ${aspect === a.value ? "border-[#f0d08a] bg-[#f0d08a]/15 text-[#f0d08a]" : "border-[#3a4a6b] text-[#ccb780]"}`}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Girar + Zoom */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setRotation(r => (r - 90 + 360) % 360)} title="Girar à esquerda"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3a4a6b] text-[#f0d08a] active:scale-95">
            <RotateCcw className="h-5 w-5" />
          </button>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))}
            className="h-2 flex-1 accent-[#f0d08a]" aria-label="Zoom" />
          <button type="button" onClick={() => setRotation(r => (r + 90) % 360)} title="Girar à direita"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3a4a6b] text-[#f0d08a] active:scale-95">
            <RotateCw className="h-5 w-5" />
          </button>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#8b2020] bg-[#3d1a1a] py-3.5 text-sm font-black uppercase tracking-[0.14em] text-[#f0a0a0] active:brightness-110">
            <X className="h-4 w-4" /> Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving || !croppedArea}
            className="flex flex-[2] items-center justify-center gap-2 rounded-2xl border-2 border-[#7b6236] bg-[linear-gradient(180deg,#6e572f_0%,#49391f_100%)] py-3.5 text-sm font-black uppercase tracking-[0.16em] text-[#f8e3b3] transition active:brightness-95 disabled:opacity-50">
            <Check className="h-4 w-4" /> {saving ? "..." : "Usar foto"}
          </button>
        </div>
      </div>
    </div>
  )
}
