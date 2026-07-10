import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Camera, ChevronRight, Image as ImageIcon, ScanLine, X } from "lucide-react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { PhotoEditor } from "./PhotoEditor"

type Props = {
  label: string
  slotKey: string
  photoUrl?: string
  onCapture: (key: string, file: File) => void
  onRemove: (key: string) => void
  onView: (url: string) => void
  // Se informado, exibe a opção "Escanear código" (barras/QR) e devolve o texto lido.
  onScan?: (text: string) => void
}

export function PhotoSlot({ label, slotKey, photoUrl, onCapture, onRemove, onView, onScan }: Props) {
  const cameraRef = React.useRef<HTMLInputElement>(null)
  const galleryRef = React.useRef<HTMLInputElement>(null)
  const scanRef = React.useRef<HTMLInputElement>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [lendoCodigo, setLendoCodigo] = useState(false)
  const [scanErro, setScanErro] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)
  const [editorSrc, setEditorSrc] = useState<string | null>(null)

  // Lê o código de barras / QR a partir de UMA FOTO (câmera nativa via input file).
  // Não usa getUserMedia, então funciona em HTTP (pelo IP), sem precisar de HTTPS.
  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !onScan) return
    setScanErro(null)
    setLendoCodigo(true)
    const url = URL.createObjectURL(file)
    try {
      const reader = new BrowserMultiFormatReader()
      const result = await reader.decodeFromImageUrl(url)
      onScan(result.getText())
    } catch {
      setScanErro("Não foi possível ler o código. Aproxime, deixe nítido e bem iluminado, e tente de novo.")
    } finally {
      URL.revokeObjectURL(url)
      setLendoCodigo(false)
    }
  }

  const abrirEditor = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => setEditorSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      /\.(heic|heif)$/i.test(file.name)

    if (isHeic) {
      setConverting(true)
      try {
        const heic2any = (await import("heic2any")).default
        const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.88 })
        abrirEditor(new File(
          [blob as Blob],
          file.name.replace(/\.(heic|heif)$/i, ".jpg"),
          { type: "image/jpeg" }
        ))
      } catch {
        abrirEditor(file)
      } finally {
        setConverting(false)
      }
    } else {
      abrirEditor(file)
    }
  }

  const ACCEPT = "image/*,.heic,.heif"
  const camId = `fc-cam-${slotKey}`
  const galId = `fc-gal-${slotKey}`

  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex min-h-[2.2em] items-end px-0.5 text-[10px] font-black uppercase leading-[1.1] tracking-[0.12em] text-[#6b5838]">{label}</span>
      <input id={camId} ref={cameraRef} type="file" accept={ACCEPT} capture="environment" onChange={handleFile} className="sr-only" />
      <input id={galId} ref={galleryRef} type="file" accept={ACCEPT} onChange={handleFile} className="sr-only" />
      {onScan && (
        <input ref={scanRef} type="file" accept="image/*" capture="environment" onChange={handleScanFile} className="sr-only" />
      )}

      {converting ? (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#c8b47e] bg-[#fbf8f2]">
          <svg className="h-8 w-8 animate-spin text-[#b89a58]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-[11px] font-bold text-[#8d7854]">Convertendo…</span>
        </div>
      ) : photoUrl ? (
        <div className="overflow-hidden rounded-2xl border-2 border-[#b89a58] bg-white shadow-sm">
          <button type="button" onClick={() => onView(photoUrl)} className="block w-full">
            <img src={photoUrl} alt={label} className="aspect-[4/3] w-full object-cover" />
          </button>
          <div className="flex divide-x divide-[#e8dfc8] bg-[#fbf8f2]">
            <button type="button" onClick={() => setShowPicker(true)} className="flex flex-1 items-center justify-center gap-1 py-3 text-[#6b5838] active:bg-[#ece6da]">
              <Camera className="h-4 w-4" />
              <span className="text-[10px] font-bold">Trocar</span>
            </button>
            <button type="button" onClick={() => onRemove(slotKey)} className="flex items-center justify-center px-4 py-3 text-[#b03030] active:bg-[#fdf0f0]">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c8b47e] bg-[#fbf8f2] active:bg-[#ece6da] md:gap-1.5"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8dfc8] md:h-9 md:w-9">
            <Camera className="h-7 w-7 text-[#8d7854] md:h-4 md:w-4" />
          </div>
          <span className="text-[12px] font-semibold text-[#8d7854] md:text-[9px]">Adicionar foto</span>
        </button>
      )}

      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6 sm:mx-auto sm:max-w-md"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4">
                  <div className="text-base font-black text-[#f0d08a]">{label}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">Selecione a origem</div>
                </div>
                <div className="space-y-3 p-4">
                  <label
                    htmlFor={camId}
                    onClick={() => setShowPicker(false)}
                    className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 border-[#d3c4a8] bg-white px-5 py-4 text-left active:scale-[.97] active:bg-[#ece6da]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                      <Camera className="h-6 w-6 text-[#8d7854]" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#1d2433]">Câmera</div>
                      <div className="text-xs text-[#8d7854]">Tirar foto agora</div>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-[#b89a58]" />
                  </label>
                  <label
                    htmlFor={galId}
                    onClick={() => setShowPicker(false)}
                    className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 border-[#d3c4a8] bg-white px-5 py-4 text-left active:scale-[.97] active:bg-[#ece6da]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                      <ImageIcon className="h-6 w-6 text-[#8d7854]" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#1d2433]">Galeria</div>
                      <div className="text-xs text-[#8d7854]">Escolher da galeria</div>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-[#b89a58]" />
                  </label>
                  {onScan && (
                    <button
                      type="button"
                      onClick={() => { setShowPicker(false); scanRef.current?.click() }}
                      className="flex w-full items-center gap-4 rounded-2xl border-2 border-[#d3c4a8] bg-white px-5 py-4 text-left active:scale-[.97] active:bg-[#ece6da]"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8dfc8]">
                        <ScanLine className="h-6 w-6 text-[#8d7854]" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-[#1d2433]">Escanear código</div>
                        <div className="text-xs text-[#8d7854]">Tire uma foto do código de barras ou QR</div>
                      </div>
                      <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-[#b89a58]" />
                    </button>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => setShowPicker(false)}
                    className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838] active:brightness-95"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Editor: recortar e girar antes de salvar */}
      {editorSrc && (
        <PhotoEditor
          src={editorSrc}
          onSave={(file) => { onCapture(slotKey, file); setEditorSrc(null) }}
          onCancel={() => setEditorSrc(null)}
        />
      )}

      {/* Lendo o código da foto */}
      {lendoCodigo && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-3 bg-black/80">
          <svg className="h-9 w-9 animate-spin text-[#f0d08a]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-sm font-bold text-[#f0d8b0]">Lendo o código…</span>
        </div>
      )}

      {/* Erro de leitura */}
      <AnimatePresence>
        {scanErro && (
          <>
            <motion.div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setScanErro(null)} />
            <motion.div className="fixed inset-x-4 bottom-8 z-[210] mx-auto max-w-sm rounded-3xl border border-[#cab88f] bg-[#f5efe3] p-5 shadow-[0_-8px_40px_rgba(0,0,0,.4)]"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
              <p className="text-[14px] font-semibold leading-snug text-[#6b4a2a]">{scanErro}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setScanErro(null)}
                  className="flex-1 rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-3 text-sm font-bold uppercase tracking-[0.1em] text-[#6b5838] active:brightness-95">
                  Fechar
                </button>
                <button type="button" onClick={() => { setScanErro(null); scanRef.current?.click() }}
                  className="flex-1 rounded-2xl border-2 border-[#f1d58d] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] py-3 text-sm font-black uppercase tracking-[0.1em] text-[#f0d08a] active:brightness-110">
                  Tentar de novo
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
