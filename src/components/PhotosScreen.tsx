import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, Link2, X } from "lucide-react"
import type { WeaponEntry, WeaponType } from "../types"
import { photoSlotsByType } from "../data/constants"
import { PhotoSlot } from "./PhotoSlot"

type Props = {
  photosOpen: boolean
  weaponType: WeaponType | null
  activeWeapon: WeaponEntry | null
  photoUrls: Map<string, string>
  gdlFotos?: string[]
  currentPhotoIdx: number
  savedPieces: WeaponEntry[]
  photoSyncMap: Record<number, number>
  onSync: (pieceIdx: number, masterIdx: number) => void
  onUnsync: (pieceIdx: number) => void
  onClose: () => void
  onCapture: (key: string, file: File) => void
  onRemove: (key: string) => void
  onView: (url: string) => void
}

export function PhotosScreen({
  photosOpen,
  weaponType,
  activeWeapon,
  photoUrls,
  gdlFotos = [],
  currentPhotoIdx,
  savedPieces,
  photoSyncMap,
  onSync,
  onUnsync,
  onClose,
  onCapture,
  onRemove,
  onView,
}: Props) {
  const [syncPickerOpen, setSyncPickerOpen] = useState(false)

  const isArtesanal = activeWeapon?.tipoProd === "ARTESANAL"
  const firearmTypes: WeaponType[] = ["REVÓLVER", "PISTOLA", "ESPINGARDA", "CARABINA", "FUZIL", "METRALHADORA"]

  const masterIdx = photoSyncMap[currentPhotoIdx]
  const masterPiece = masterIdx !== undefined ? savedPieces[masterIdx] : undefined
  const effectiveIdx = masterIdx ?? currentPhotoIdx

  const piecePhotoCount = Array.from(photoUrls.keys()).filter(k => k.startsWith(`piece-${effectiveIdx}-`)).length

  // Peças disponíveis para vincular: excluir a si mesmo e peças que já são "escravas" de outra
  const linkablePieces = savedPieces
    .map((p, idx) => ({ p, idx }))
    .filter(({ idx }) => idx !== currentPhotoIdx && photoSyncMap[idx] === undefined)

  return (
    <AnimatePresence>
      {photosOpen && weaponType && (
        <motion.div
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 200 }}
          className="fixed inset-0 z-[80] flex flex-col bg-[#f5efe3] text-[#26221b]"
        >
          {/* Header */}
          <div className="shrink-0 border-b border-[#cab88f] bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#8e7340] bg-[#12213d] p-2 text-[#f0d08a]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-black text-[#f0d08a]">Fotos da peça</div>
                <div className="truncate text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">{weaponType}</div>
              </div>
              {piecePhotoCount > 0 && (
                <div className="shrink-0 rounded-full bg-[#f0d08a]/15 px-3 py-1 text-[11px] font-black text-[#f0d08a]">
                  {piecePhotoCount} foto{piecePhotoCount > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          {/* Barra de sincronização */}
          {masterPiece ? (
            <div className="shrink-0 flex items-center gap-2 border-b border-[#e8dfc8] bg-[#eef6ee] px-4 py-2.5">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-[#4a8c4a]" />
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#4a8c4a]">Vinculado</span>
              <span className="text-[11px] text-[#2d5a2d]">
                Peça {masterIdx! + 1} · {masterPiece.type}{masterPiece.brand ? ` · ${masterPiece.brand}` : ""}
              </span>
              <button
                type="button"
                onClick={() => onUnsync(currentPhotoIdx)}
                className="ml-auto flex items-center gap-1 rounded-lg bg-[#fde8e8] px-2.5 py-1 text-[10px] font-black text-[#c0392b]"
              >
                <X className="h-3 w-3" />
                Desvincular
              </button>
            </div>
          ) : linkablePieces.length > 0 ? (
            <div className="shrink-0 border-b border-[#e8dfc8] bg-[#f5f0e8] px-4 py-2">
              <button
                type="button"
                onClick={() => setSyncPickerOpen(true)}
                className="flex items-center gap-2 py-1 active:opacity-70"
              >
                <Link2 className="h-3.5 w-3.5 text-[#9e7f45]" />
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6b5838]">
                  Sincronizar fotos com outra peça
                </span>
              </button>
            </div>
          ) : null}

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-8 p-4 pb-8">
              {masterPiece && (
                <div className="rounded-xl border border-[#b8dbb8] bg-[#f0faf0] px-4 py-3 text-[12px] text-[#2d5a2d]">
                  As fotos abaixo são compartilhadas com a Peça {masterIdx! + 1}. Qualquer foto adicionada ou removida aqui afetará todas as peças vinculadas.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-2">
                {(photoSlotsByType[weaponType] ?? [])
                  .filter(slot =>
                    !(slot === "Numeração de série" && firearmTypes.includes(weaponType) && isArtesanal)
                  )
                  .map((slot) => (
                    <PhotoSlot
                      key={slot}
                      slotKey={`piece-${effectiveIdx}-${slot}`}
                      label={slot}
                      photoUrl={photoUrls.get(`piece-${effectiveIdx}-${slot}`)}
                      onCapture={onCapture}
                      onRemove={onRemove}
                      onView={onView}
                    />
                  ))}
              </div>

              {gdlFotos.length > 0 && (
                <div>
                  <div className="mb-3 border-b border-[#d3c3a4] pb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#8d7854]">
                    Fotos importadas do GDL
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {gdlFotos.map((src, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onView(src)}
                        className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-[#d3c4a8] bg-[#f0e8d5]"
                      >
                        <img
                          src={src}
                          alt={`GDL ${idx + 1}`}
                          className="h-full w-full object-cover transition group-active:scale-95"
                        />
                        <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-black text-white">
                          {idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Picker de sincronização */}
          <AnimatePresence>
            {syncPickerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10 bg-black/40"
                  onClick={() => setSyncPickerOpen(false)}
                />
                <motion.div
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 220 }}
                  className="fixed inset-x-0 bottom-0 z-20 rounded-t-3xl bg-white pb-safe"
                >
                  <div className="px-5 pt-5 pb-3">
                    <div className="mb-1 text-base font-black uppercase tracking-[0.14em] text-[#26221b]">
                      Vincular fotos com
                    </div>
                    <p className="text-[12px] text-[#8d7854]">
                      Selecione a peça mestre. As fotos serão compartilhadas entre as peças vinculadas.
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto px-4">
                    <div className="space-y-2 pb-2">
                      {linkablePieces.map(({ p, idx }) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { onSync(currentPhotoIdx, idx); setSyncPickerOpen(false) }}
                          className="flex w-full items-center gap-3 rounded-2xl border border-[#d3c4a8] bg-[#fbf8f2] px-4 py-3 text-left active:bg-[#f0e8d5]"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#1b2947_0%,#12213d_100%)] text-[10px] font-black text-[#f0d08a]">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#b89a58]">{p.type}</div>
                            <div className="truncate text-[13px] font-black text-[#26221b]">
                              {p.brand || <span className="font-medium italic text-[#b8a070]">Não identificado</span>}
                            </div>
                            {p.model && <div className="truncate text-[11px] text-[#6b5838]">{p.model}</div>}
                          </div>
                          <Link2 className="h-4 w-4 shrink-0 text-[#9e7f45]" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <button
                      type="button"
                      onClick={() => setSyncPickerOpen(false)}
                      className="w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838]"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
