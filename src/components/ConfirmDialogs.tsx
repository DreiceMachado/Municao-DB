import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import type { WeaponEntry } from "../types"
import { PieceIcon } from "./ui/PieceIcon"

type Props = {
  confirmDeletePieceIdx: number | null
  savedPieces: WeaponEntry[]
  onDeletePiece: (idx: number) => void
  onCancelDeletePiece: () => void

  confirmDeleteMira: boolean
  onDeleteMira: () => void
  onCancelDeleteMira: () => void

  confirmDeleteCarregador: boolean
  onDeleteCarregador: () => void
  onCancelDeleteCarregador: () => void
}

const sheetContainer = "overflow-hidden rounded-3xl border border-[#cab88f] bg-[#f5efe3] shadow-[0_-8px_40px_rgba(0,0,0,.45)]"
const sheetHeader = "bg-[linear-gradient(180deg,#3a1515_0%,#2a0f0f_100%)] px-6 py-5"
const confirmBtn = "flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#7a3535] bg-[linear-gradient(180deg,#6b2020_0%,#4a1515_100%)] py-4 text-sm font-black tracking-[0.18em] text-[#ffcccc] shadow-[0_8px_20px_rgba(120,30,30,.35)] active:brightness-95"
const cancelBtn = "w-full rounded-2xl border border-[#d3c4a8] bg-[#ece6da] py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#6b5838] active:brightness-95"

const sheetMotion = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "100%", opacity: 0 },
  transition: { type: "spring" as const, damping: 28, stiffness: 320 },
}

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export function ConfirmDialogs({
  confirmDeletePieceIdx,
  savedPieces,
  onDeletePiece,
  onCancelDeletePiece,
  confirmDeleteMira,
  onDeleteMira,
  onCancelDeleteMira,
  confirmDeleteCarregador,
  onDeleteCarregador,
  onCancelDeleteCarregador,
}: Props) {
  const piece = confirmDeletePieceIdx !== null ? savedPieces[confirmDeletePieceIdx] : null

  return (
    <>
      <AnimatePresence>
        {confirmDeletePieceIdx !== null && (
          <>
            <motion.div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-[2px]"
              {...backdropMotion} onClick={onCancelDeletePiece} />
            <motion.div className="fixed inset-x-0 bottom-0 z-[150] px-4 pb-8" {...sheetMotion}>
              <div className={sheetContainer}>
                <div className={sheetHeader}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f08a8a]/15">
                      <X className="h-5 w-5 text-[#f08a8a]" />
                    </div>
                    <div>
                      <div className="text-base font-black text-[#f08a8a]">Excluir peça</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#c47a7a]">Esta ação não pode ser desfeita</div>
                    </div>
                  </div>
                </div>
                {piece && (
                  <div className="flex items-center gap-3 border-b border-[#e8dfc8] px-6 py-4">
                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-[#12213d] p-2 text-[#f0d08a]">
                      <PieceIcon type={piece.type} className="h-5 w-auto max-w-[36px]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b5838]">{piece.type}</div>
                      <div className="truncate text-sm font-bold text-[#26221b]">
                        {piece.model || <span className="italic text-[#a89268]">modelo não informado</span>}
                      </div>
                      <div className="text-xs text-[#6b5838]">
                        Nº {piece.serial || "—"}
                        {piece.caliber ? ` • ${piece.caliber}` : ""}
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-3 p-4">
                  <button type="button" onClick={() => onDeletePiece(confirmDeletePieceIdx!)} className={confirmBtn}>
                    <X className="h-4 w-4" /> SIM, EXCLUIR
                  </button>
                  <button type="button" onClick={onCancelDeletePiece} className={cancelBtn}>CANCELAR</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteMira && (
          <>
            <motion.div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-[2px]"
              {...backdropMotion} onClick={onCancelDeleteMira} />
            <motion.div className="fixed inset-x-0 bottom-0 z-[150] px-4 pb-8" {...sheetMotion}>
              <div className={sheetContainer}>
                <div className={sheetHeader}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f08a8a]/15">
                      <X className="h-5 w-5 text-[#f08a8a]" />
                    </div>
                    <div>
                      <div className="text-base font-black text-[#f08a8a]">Remover mira</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#c47a7a]">Deseja mesmo remover a mira selecionada?</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <button type="button" onClick={onDeleteMira} className={confirmBtn}>
                    <X className="h-4 w-4" /> SIM, REMOVER
                  </button>
                  <button type="button" onClick={onCancelDeleteMira} className={cancelBtn}>CANCELAR</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteCarregador && (
          <>
            <motion.div className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-[2px]"
              {...backdropMotion} onClick={onCancelDeleteCarregador} />
            <motion.div className="fixed inset-x-0 bottom-0 z-[150] px-4 pb-8" {...sheetMotion}>
              <div className={sheetContainer}>
                <div className={sheetHeader}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f08a8a]/15">
                      <X className="h-5 w-5 text-[#f08a8a]" />
                    </div>
                    <div>
                      <div className="text-base font-black text-[#f08a8a]">Remover carregador</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#c47a7a]">Deseja mesmo remover o tipo de carregador?</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <button type="button" onClick={onDeleteCarregador} className={confirmBtn}>
                    <X className="h-4 w-4" /> SIM, REMOVER
                  </button>
                  <button type="button" onClick={onCancelDeleteCarregador} className={cancelBtn}>CANCELAR</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
