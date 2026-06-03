import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import type { WeaponEntry, WeaponType } from "../types"
import { photoSlotsByType } from "../data/constants"
import { PhotoSlot } from "./PhotoSlot"

type Props = {
  photosOpen: boolean
  weaponType: WeaponType | null
  activeWeapon: WeaponEntry | null
  photoUrls: Map<string, string>
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
  onClose,
  onCapture,
  onRemove,
  onView,
}: Props) {
  const isArtesanal = activeWeapon?.tipoProd === "ARTESANAL"
  const firearmTypes: WeaponType[] = ["REVÓLVER", "PISTOLA", "ESPINGARDA", "CARABINA", "FUZIL", "METRALHADORA"]

  const piecePhotoCount = Array.from(photoUrls.keys()).filter(k => k.startsWith("piece-")).length

  return (
    <AnimatePresence>
      {photosOpen && weaponType && (
        <motion.div
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 200 }}
          className="fixed inset-0 z-[80] flex flex-col bg-[#f5efe3] text-[#26221b]"
        >
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

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-8 p-4 pb-8">
              <div className="grid grid-cols-2 gap-3">
                {(photoSlotsByType[weaponType] ?? [])
                  .filter(slot =>
                    !(slot === "Numeração de série" && firearmTypes.includes(weaponType) && isArtesanal)
                  )
                  .map((slot) => (
                    <PhotoSlot
                      key={slot}
                      slotKey={`piece-${slot}`}
                      label={slot}
                      photoUrl={photoUrls.get(`piece-${slot}`)}
                      onCapture={onCapture}
                      onRemove={onRemove}
                      onView={onView}
                    />
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
