import React, { useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Camera, ChevronRight, Image as ImageIcon, Plus, X } from "lucide-react"

const MAX_PHOTOS = 4

type Props = {
  label: string
  slotKey: string
  value: string
  onChange: (v: string) => void
  allPhotoUrls: Map<string, string>
  onCapture: (key: string, file: File) => void
  onRemove: (key: string) => void
  onView: (url: string) => void
  placeholder?: string
}

export function LacreInput({
  label, slotKey, value, onChange, allPhotoUrls, onCapture, onRemove, onView, placeholder,
}: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const photos = Array.from(allPhotoUrls.entries()).filter(([k]) => k.startsWith(slotKey + "-"))
  const canAdd = photos.length < MAX_PHOTOS

  const getNextKey = () => {
    let i = 0
    while (allPhotoUrls.has(`${slotKey}-${i}`)) i++
    return `${slotKey}-${i}`
  }

  const openPicker = () => {
    if (!canAdd) return
    setPendingKey(getNextKey())
    setShowPicker(true)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !pendingKey) return
    e.target.value = ""
    onCapture(pendingKey, file)
    setPendingKey(null)
  }

  const ACCEPT = "image/*,.heic,.heif"
  const camId = `lacre-cam-${slotKey}`
  const galId = `lacre-gal-${slotKey}`

  return (
    <div>
      <label className="mb-2 block text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]">{label}</label>

      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? `Nº ${label.toLowerCase()}`}
          className="h-14 flex-1 rounded-2xl border border-[#cdbf9e] bg-[#fbf8f2] px-4 text-[16px] outline-none transition focus:border-[#9e7f45] focus:ring-2 focus:ring-[#dcc17c]/35 shadow-sm"
        />
        <button
          type="button"
          onClick={openPicker}
          disabled={!canAdd}
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 transition active:scale-[.95]
            ${photos.length > 0 ? "border-[#b89a58] bg-[#f0e8d0]" : "border-[#cdbf9e] bg-[#fbf8f2] hover:bg-[#f5efe3]"}
            disabled:opacity-40`}
        >
          <Camera className="h-6 w-6 text-[#8d7854]" />
          {photos.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#b89a58] text-[9px] font-black text-white">
              {photos.length}
            </span>
          )}
        </button>
      </div>

      {photos.length > 0 && (
        <div className="mt-2.5 flex items-center gap-2 overflow-x-auto rounded-xl border border-[#ddd0b3] bg-white p-2 shadow-sm">
          {photos.map(([k, url]) => (
            <div key={k} className="relative shrink-0">
              <button type="button" onClick={() => onView(url)}>
                <img src={url} alt="lacre" className="h-14 w-14 rounded-lg border border-[#c8b47e] object-cover" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(k)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#b03030] text-white shadow"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {canAdd && (
            <button
              type="button"
              onClick={openPicker}
              className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#c8b47e] bg-[#fdf8ef] text-[#9e8255] active:bg-[#ece6da]"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[9px] font-bold">Adicionar</span>
            </button>
          )}
        </div>
      )}

      <input id={camId} ref={cameraRef} type="file" accept={ACCEPT} capture="environment" onChange={handleFile} className="sr-only" />
      <input id={galId} ref={galleryRef} type="file" accept={ACCEPT} onChange={handleFile} className="sr-only" />

      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-6"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.4)]">
                <div className="bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-6 py-4">
                  <div className="text-base font-black text-[#f0d08a]">{label}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">
                    Foto {photos.length + 1} de {MAX_PHOTOS} · Selecione a origem
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <label
                    htmlFor={camId}
                    onClick={() => setShowPicker(false)}
                    className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 border-[#d3c4a8] bg-white px-5 py-4 active:scale-[.97] active:bg-[#ece6da]"
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
                    className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 border-[#d3c4a8] bg-white px-5 py-4 active:scale-[.97] active:bg-[#ece6da]"
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
    </div>
  )
}
