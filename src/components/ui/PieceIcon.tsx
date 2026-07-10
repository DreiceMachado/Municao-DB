import type { WeaponType } from "../../types"
import carabinaImg from "../../assets/icons/pecas/carabina.png"
import espingardaImg from "../../assets/icons/pecas/espingarda.png"
import fuzilImg from "../../assets/icons/pecas/fuzil.png"
import garruchaImg from "../../assets/icons/pecas/garrucha.png"
import pistolaImg from "../../assets/icons/pecas/pistola.png"
import pistoleteImg from "../../assets/icons/pecas/pistolete.png"
import revolverImg from "../../assets/icons/pecas/revolver.png"

type Props = {
  type: WeaponType
  className?: string
}

// Ícones em imagem (fundo removido) para as armas de fogo desenhadas pelo usuário.
const IMG_ICONS: Partial<Record<WeaponType, string>> = {
  "REVÓLVER":   revolverImg,
  "PISTOLA":    pistolaImg,
  "PISTOLETE":  pistoleteImg,
  "GARRUCHA":   garruchaImg,
  "CARABINA":   carabinaImg,
  "ESPINGARDA": espingardaImg,
  "FUZIL":      fuzilImg,
}

export function PieceIcon({ type, className = "h-14 w-auto" }: Props) {
  const img = IMG_ICONS[type]
  if (img) return <img src={img} alt="" aria-hidden="true" draggable={false} className={`${className} object-contain`} />

  switch (type) {
    case "METRALHADORA": return (
      <svg viewBox="0 0 80 40" fill="currentColor" className={className} aria-hidden="true">
        <path d="M2 16 L12 14 L14 22 L2 24 Z"/>
        <rect x="10" y="10" width="28" height="14" rx="2"/>
        <rect x="16" y="24" width="9" height="13" rx="2"/>
        <rect x="36" y="11" width="30" height="12" rx="2"/>
        <rect x="64" y="13" width="14" height="8" rx="2"/>
        <rect x="12" y="24" width="22" height="14" rx="2"/>
        <circle cx="42" cy="17" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/>
        <circle cx="48" cy="17" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/>
        <circle cx="54" cy="17" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/>
        <circle cx="60" cy="17" r="1.5" fill="none" stroke="currentColor" strokeWidth="1"/>
        <rect x="77" y="12" width="3" height="10" rx="1"/>
      </svg>
    )
    case "ESTOJO": return (
      <svg viewBox="0 0 24 56" fill="currentColor" className={className} aria-hidden="true">
        <path d="M7 6 Q7 2 9 2 L15 2 Q17 2 17 6 Z"/>
        <rect x="7" y="5" width="10" height="34" rx="1.5"/>
        <rect x="5" y="39" width="14" height="3" rx="1" opacity="0.55"/>
        <rect x="3" y="42" width="18" height="5" rx="1.5"/>
        <rect x="5" y="47" width="14" height="4" rx="1"/>
        <circle cx="12" cy="49.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    )
    case "PROJÉTIL": return (
      <svg viewBox="0 0 20 52" fill="currentColor" className={className} aria-hidden="true">
        <path d="M3 28 Q2 12 10 2 Q18 12 17 28 Z"/>
        <rect x="3" y="26" width="14" height="22" rx="1"/>
        <rect x="3" y="36" width="14" height="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    )
    case "CARTUCHO": return (
      <svg viewBox="0 0 24 68" fill="currentColor" className={className} aria-hidden="true">
        <path d="M5 28 Q4 12 12 2 Q20 12 19 28 Z"/>
        <rect x="5" y="26" width="14" height="8" rx="1"/>
        <path d="M5 34 L7 40 L17 40 L19 34 Z"/>
        <rect x="7" y="32" width="10" height="10" rx="1"/>
        <rect x="5" y="39" width="14" height="17" rx="1"/>
        <rect x="4" y="55" width="16" height="2.5" rx="1" opacity="0.55"/>
        <rect x="3" y="57" width="18" height="5" rx="1.5"/>
        <circle cx="12" cy="64" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    )
    case "CARREGADOR": return (
      <svg viewBox="0 0 32 48" fill="currentColor" className={className} aria-hidden="true">
        <rect x="7" y="2" width="18" height="36" rx="3"/>
        <rect x="10" y="5" width="12" height="4" rx="1.5" opacity="0.35"/>
        <rect x="10" y="11" width="12" height="3" rx="1" opacity="0.28"/>
        <rect x="10" y="16" width="12" height="3" rx="1" opacity="0.28"/>
        <rect x="10" y="21" width="12" height="3" rx="1" opacity="0.28"/>
        <rect x="9" y="38" width="14" height="8" rx="2"/>
      </svg>
    )
    case "FACA": return (
      <svg viewBox="0 0 72 28" fill="currentColor" className={className} aria-hidden="true">
        <rect x="2" y="10" width="18" height="10" rx="3"/>
        <rect x="5" y="11" width="2" height="8" rx="1" opacity="0.32"/>
        <rect x="9" y="11" width="2" height="8" rx="1" opacity="0.32"/>
        <rect x="13" y="11" width="2" height="8" rx="1" opacity="0.32"/>
        <rect x="19" y="7" width="3" height="16" rx="1.5"/>
        <path d="M22 9 L68 14 L22 19 Z"/>
        <path d="M22 9 L58 11 L68 14" fill="none" stroke="currentColor" strokeWidth="0.8"/>
      </svg>
    )
    case "ARMA DE ANTECARGA": return (
      <svg viewBox="0 0 88 32" fill="currentColor" className={className} aria-hidden="true">
        <rect x="4" y="13" width="60" height="6" rx="3"/>
        <rect x="62" y="14" width="20" height="4" rx="2"/>
        <path d="M4 13 Q2 13 2 19 Q2 25 6 27 L14 27 Q10 22 10 19 L4 19 Z"/>
        <path d="M18 19 Q20 23 18 27" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <rect x="14" y="10" width="8" height="9" rx="1.5" opacity="0.7"/>
        <rect x="15" y="8" width="5" height="3" rx="1" opacity="0.5"/>
      </svg>
    )
    case "ARMA DE PRESSÃO": return (
      <svg viewBox="0 0 80 36" fill="currentColor" className={className} aria-hidden="true">
        <rect x="10" y="15" width="48" height="7" rx="3.5"/>
        <rect x="55" y="16" width="14" height="5" rx="2.5"/>
        <rect x="6" y="22" width="10" height="12" rx="3"/>
        <rect x="8" y="23" width="2" height="10" rx="1" opacity="0.3"/>
        <rect x="11" y="23" width="2" height="10" rx="1" opacity="0.3"/>
        <path d="M18 22 Q20 26 18 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <ellipse cx="14" cy="20" rx="6" ry="4" opacity="0.6"/>
      </svg>
    )
    default: return null
  }
}
