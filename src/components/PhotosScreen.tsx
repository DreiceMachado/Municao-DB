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
  lacreNumero: string
  lacreSaidaNumero: string
  onClose: () => void
  onCapture: (key: string, file: File) => void
  onRemove: (key: string) => void
  onView: (url: string) => void
  onLacreChange: (value: string) => void
  onLacreSaidaChange: (value: string) => void
}

export function PhotosScreen({
  photosOpen,
  weaponType,
  activeWeapon,
  photoUrls,
  lacreNumero,
  lacreSaidaNumero,
  onClose,
  onCapture,
  onRemove,
  onView,
  onLacreChange,
  onLacreSaidaChange,
}: Props) {
  const isArtesanal = activeWeapon?.tipoProd === "ARTESANAL"
  const firearmTypes: WeaponType[] = ["REVÓLVER", "PISTOLA", "ESPINGARDA", "CARABINA", "FUZIL", "METRALHADORA"]

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
                <div className="text-lg font-black text-[#f0d08a]">Fotos</div>
                <div className="truncate text-[10px] uppercase tracking-[0.2em] text-[#ccb780]">{weaponType}</div>
              </div>
              {photoUrls.size > 0 && (
                <div className="shrink-0 rounded-full bg-[#f0d08a]/15 px-3 py-1 text-[11px] font-black text-[#f0d08a]">
                  {photoUrls.size} foto{photoUrls.size > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-8 p-4 pb-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">
                  Lacre de entrada
                </label>
                <input
                  value={lacreNumero}
                  onChange={e => onLacreChange(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#d3c4a8] bg-white px-4 text-[16px] font-bold text-[#50442f] outline-none focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/10"
                  placeholder="Nº lacre de entrada"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#b89a58]" />
                  <span className="text-[15px] font-black uppercase tracking-[0.22em] text-[#6b5838]">
                    Fotos da peça
                  </span>
                </div>
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

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#b89a58]" />
                  <span className="text-[15px] font-black uppercase tracking-[0.22em] text-[#6b5838]">
                    Embalagem
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "lacre-Frente da embalagem recebida", label: "Entrada (Frente)" },
                    { key: "lacre-Verso da embalagem recebida",  label: "Entrada (Verso)" },
                    { key: "lacre-Frente da embalagem despachada", label: "Saída (Frente)" },
                    { key: "lacre-Verso da embalagem despachada",  label: "Saída (Verso)" },
                  ].map(({ key, label }) => (
                    <PhotoSlot
                      key={key}
                      slotKey={key}
                      label={label}
                      photoUrl={photoUrls.get(key)}
                      onCapture={onCapture}
                      onRemove={onRemove}
                      onView={onView}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-[#8d7854]">
                  Lacre de saída
                </label>
                <input
                  value={lacreSaidaNumero}
                  onChange={e => onLacreSaidaChange(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#d3c4a8] bg-white px-4 text-[16px] font-bold text-[#50442f] outline-none focus:border-[#b89a58] focus:ring-2 focus:ring-[#b89a58]/10"
                  placeholder="Nº lacre de saída"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
