import type { WeaponType } from "../../types"
import antecargaImg from "../../assets/icons/pecas/antecarga.png"
import armaChoqueImg from "../../assets/icons/pecas/arma-choque.png"
import armaPressaoImg from "../../assets/icons/pecas/arma-pressao.png"
import carabinaImg from "../../assets/icons/pecas/carabina.png"
import carregadorImg from "../../assets/icons/pecas/carregador.png"
import cartuchoImg from "../../assets/icons/pecas/cartucho.png"
import espingardaImg from "../../assets/icons/pecas/espingarda.png"
import espoletaImg from "../../assets/icons/pecas/espoleta.png"
import estojoImg from "../../assets/icons/pecas/estojo.png"
import facaImg from "../../assets/icons/pecas/faca.png"
import fuzilImg from "../../assets/icons/pecas/fuzil.png"
import garruchaImg from "../../assets/icons/pecas/garrucha.png"
import metralhadoraImg from "../../assets/icons/pecas/metralhadora.png"
import pistolaImg from "../../assets/icons/pecas/pistola.png"
import pistoleteImg from "../../assets/icons/pecas/pistolete.png"
import polvoraImg from "../../assets/icons/pecas/polvora.png"
import projetilImg from "../../assets/icons/pecas/projetil.png"
import revolverImg from "../../assets/icons/pecas/revolver.png"
import submetralhadoraImg from "../../assets/icons/pecas/submetralhadora.png"

type Props = {
  type: WeaponType
  className?: string
}

// Ícones em imagem (fundo removido) desenhados pelo usuário, para cada tipo de peça.
const IMG_ICONS: Partial<Record<WeaponType, string>> = {
  "REVÓLVER":          revolverImg,
  "PISTOLA":           pistolaImg,
  "PISTOLETE":         pistoleteImg,
  "GARRUCHA":          garruchaImg,
  "ESPINGARDA":        espingardaImg,
  "CARABINA":          carabinaImg,
  "FUZIL":             fuzilImg,
  "METRALHADORA":      metralhadoraImg,
  "SUBMETRALHADORA":   submetralhadoraImg,
  "ARMA DE CHOQUE":    armaChoqueImg,
  "ESTOJO":            estojoImg,
  "PROJÉTIL":          projetilImg,
  "CARTUCHO":          cartuchoImg,
  "FACA":              facaImg,
  "ARMA DE PRESSÃO":   armaPressaoImg,
  "ARMA DE ANTECARGA": antecargaImg,
  "PÓLVORA":           polvoraImg,
  "ESPOLETA":          espoletaImg,
  "CARREGADOR":        carregadorImg,
}

export function PieceIcon({ type, className = "h-14 w-auto" }: Props) {
  const img = IMG_ICONS[type]
  if (!img) return null
  return <img src={img} alt="" aria-hidden="true" draggable={false} className={`${className} object-contain`} />
}
