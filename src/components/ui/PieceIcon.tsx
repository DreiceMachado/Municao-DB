import type { WeaponType } from "../../types"

type Props = {
  type: WeaponType
  className?: string
}

export function PieceIcon({ type, className = "h-14 w-auto" }: Props) {
  switch (type) {
    case "REVÓLVER": return (
      <svg viewBox="0 0 64 40" fill="currentColor" className={className} aria-hidden="true">
        <rect x="8" y="22" width="10" height="16" rx="3"/>
        <rect x="8" y="14" width="22" height="9" rx="2"/>
        <ellipse cx="25" cy="18" rx="9" ry="9"/>
        <ellipse cx="25" cy="18" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="25" cy="18" r="1.5"/>
        <rect x="29" y="15" width="26" height="6" rx="2"/>
        <path d="M11 23 Q11 30 18 30 L18 23" fill="none" stroke="currentColor" strokeWidth="2"/>
        <rect x="6" y="12" width="5" height="7" rx="1.5"/>
      </svg>
    )
    case "PISTOLA": return (
      <svg viewBox="0 0 64 40" fill="currentColor" className={className} aria-hidden="true">
        <rect x="12" y="20" width="11" height="18" rx="3"/>
        <rect x="12" y="12" width="30" height="10" rx="2"/>
        <rect x="20" y="8" width="26" height="9" rx="2"/>
        <rect x="44" y="10" width="16" height="5" rx="2"/>
        <path d="M15 22 Q15 30 24 30 L24 22" fill="none" stroke="currentColor" strokeWidth="2"/>
        <rect x="34" y="9" width="7" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="20" y="6" width="4" height="3" rx="1"/>
        <rect x="56" y="7" width="3" height="3" rx="1"/>
      </svg>
    )
    case "ESPINGARDA": return (
      <svg viewBox="0 0 88 36" fill="currentColor" className={className} aria-hidden="true">
        <path d="M2 14 Q2 6 8 6 L20 8 L22 28 L8 30 Q2 30 2 22 Z"/>
        <rect x="20" y="10" width="10" height="18" rx="2"/>
        <rect x="18" y="8" width="22" height="13" rx="2"/>
        <rect x="38" y="9" width="22" height="11" rx="2"/>
        <rect x="58" y="10" width="28" height="9" rx="3"/>
        <path d="M22 22 Q22 32 30 32 L30 24" fill="none" stroke="currentColor" strokeWidth="2"/>
        <ellipse cx="86" cy="14.5" rx="2" ry="4.5"/>
      </svg>
    )
    case "CARABINA": return (
      <svg viewBox="0 0 80 32" fill="currentColor" className={className} aria-hidden="true">
        <path d="M2 14 Q2 8 8 8 L16 8 L18 24 L8 26 Q2 26 2 20 Z"/>
        <rect x="18" y="17" width="8" height="12" rx="2"/>
        <rect x="16" y="9" width="22" height="10" rx="2"/>
        <rect x="36" y="10" width="20" height="8" rx="2"/>
        <rect x="54" y="12" width="24" height="4" rx="2"/>
        <path d="M22 19 L28 19 L30 30 L20 30 Z"/>
        <rect x="18" y="6" width="20" height="4" rx="1"/>
        <rect x="77" y="11" width="3" height="6" rx="1"/>
      </svg>
    )
    case "FUZIL": return (
      <svg viewBox="0 0 88 36" fill="currentColor" className={className} aria-hidden="true">
        <path d="M2 15 L14 13 L16 22 L2 24 Z"/>
        <rect x="10" y="14" width="9" height="8" rx="1"/>
        <rect x="16" y="13" width="22" height="10" rx="2"/>
        <path d="M20 23 L28 22 L30 35 L18 35 Z"/>
        <rect x="18" y="7" width="28" height="8" rx="2"/>
        <rect x="18" y="5" width="26" height="3" rx="1" opacity="0.5"/>
        <rect x="44" y="8" width="22" height="7" rx="2"/>
        <rect x="64" y="10" width="22" height="4" rx="1.5"/>
        <path d="M22 23 L32 23 L34 35 L20 35 Q20 33 22 30 Z"/>
        <rect x="85" y="9" width="3" height="6" rx="1"/>
      </svg>
    )
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
