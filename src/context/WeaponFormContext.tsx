import React, { createContext, useContext } from "react"
import type { WeaponEntry } from "../types"

export type WeaponFormContextValue = {
  weapon: WeaponEntry
  handleField: (field: keyof Omit<WeaponEntry, "type">) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  setDirect: (field: keyof Omit<WeaponEntry, "type">, value: string | boolean | null | string[]) => void
  naToggle: (field: string) => void
  HelpBtn: (props: { title: string; text: string }) => React.ReactElement
  fieldHelper: { title: string; text: string } | null
  clearFieldHelper: () => void
  // Picker openers
  openMaterialPicker: () => void
  openAcabamentoPicker: () => void
  openCalibrePicker: () => void
  openCalibreAntecargaPicker: () => void
  openCalibreArmaPressaoPicker: () => void
  openPaisPicker: () => void
  openSistemaAcionamentoPicker: () => void
  openTipoRaiamentoPicker: () => void
  openMaterialCoronhaPicker: () => void
  openMaterialTamborPicker: () => void
  openMaterialQuadroPicker: () => void
  openSentidoPicker: () => void
  openDeformacoesPicker: () => void
  openFormatoPicker: () => void
  openTipoLaminaPicker: () => void
  openTipoGumePicker: () => void
  openTipoPolvoraPicker: () => void
  openTipoEspoletaPicker: () => void
  openMiraPicker: () => void
  openCarregadorPicker: () => void
}

const WeaponFormContext = createContext<WeaponFormContextValue | null>(null)

export function WeaponFormProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: WeaponFormContextValue
}) {
  return (
    <WeaponFormContext.Provider value={value}>
      {children}
    </WeaponFormContext.Provider>
  )
}

export function useWeaponForm(): WeaponFormContextValue {
  const ctx = useContext(WeaponFormContext)
  if (!ctx) throw new Error("useWeaponForm must be used inside WeaponFormProvider")
  return ctx
}
