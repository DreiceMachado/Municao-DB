import { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import type { IScannerControls } from "@zxing/browser"
import { QrCode, Barcode, X } from "lucide-react"

type Props = {
  onResult: (text: string) => void
  onClose: () => void
}

// Scanner de código de barras / QR code (usa a câmera traseira). Ao ler, devolve o texto.
export function BarcodeScanner({ onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult
  // Modo apenas visual: muda o formato da mira para ajudar a enquadrar (o leitor lê ambos).
  const [modo, setModo] = useState<"qr" | "barra">("qr")
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // iOS/Safari exige estes ajustes para exibir o vídeo inline.
    video.muted = true
    video.setAttribute("playsinline", "true")
    video.setAttribute("webkit-playsinline", "true")

    // getUserMedia só existe em contexto seguro (HTTPS ou localhost).
    if (!navigator.mediaDevices?.getUserMedia) {
      setErro(
        window.isSecureContext === false
          ? "A câmera exige HTTPS. Abra o app pelo endereço com cadeado (https), não pelo IP/HTTP."
          : "A câmera não está disponível neste navegador."
      )
      return
    }

    const traduz = (e: unknown): string => {
      const name = (e as { name?: string })?.name || ""
      if (name === "NotAllowedError" || name === "SecurityError")
        return "Permissão da câmera negada. Toque em 'AA' na barra do Safari → Configurações do site → Câmera → Permitir."
      if (name === "NotFoundError" || name === "OverconstrainedError")
        return "Nenhuma câmera encontrada."
      if (name === "NotReadableError")
        return "A câmera está em uso por outro app. Feche-o e tente de novo."
      return "Não foi possível iniciar a câmera. Tente novamente."
    }

    const reader = new BrowserMultiFormatReader()
    let controls: IScannerControls | null = null
    let cancelled = false
    let done = false

    const onFrame = (result: import("@zxing/library").Result | undefined, _err: unknown, ctrl: IScannerControls) => {
      controls = ctrl
      if (result && !done) {
        done = true
        ctrl.stop()
        onResultRef.current(result.getText())
      }
    }

    // Tenta câmera traseira; se falhar por restrição, cai para a câmera padrão.
    reader
      .decodeFromConstraints({ video: { facingMode: { ideal: "environment" } } }, video, onFrame)
      .then((ctrl) => { controls = ctrl; if (cancelled) ctrl.stop() })
      .catch(() => {
        if (cancelled) return
        reader
          .decodeFromVideoDevice(undefined, video, onFrame)
          .then((ctrl) => { controls = ctrl; if (cancelled) ctrl.stop() })
          .catch((e2) => { if (!cancelled) setErro(traduz(e2)) })
      })

    return () => {
      cancelled = true
      controls?.stop()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
        {/* Mira — quadrada (QR) ou retangular (código de barras) */}
        {!erro && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className={`rounded-2xl border-2 border-[#f0d08a] shadow-[0_0_0_9999px_rgba(0,0,0,.45)] transition-all duration-200 ${
              modo === "qr" ? "h-64 w-64 max-w-[80vw]" : "h-32 w-[86vw] max-w-[420px]"
            }`} />
          </div>
        )}
        {erro && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 px-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3d1a1a]">
              <X className="h-6 w-6 text-[#f0a0a0]" />
            </div>
            <p className="text-[14px] font-semibold leading-snug text-[#f0d8b0]">{erro}</p>
          </div>
        )}
      </div>
      <div className="shrink-0 space-y-4 border-t border-[#2a3a5b] bg-[#12213d] px-5 pb-8 pt-4">
        <p className="text-center text-[13px] leading-snug text-[#ccb780]">
          Aponte a câmera para o <b className="text-[#f0d08a]">{modo === "qr" ? "QR code" : "código de barras"}</b> do lacre
        </p>
        {/* Seletor de formato da mira */}
        <div className="flex items-center justify-center gap-2">
          <button type="button" onClick={() => setModo("qr")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-[13px] font-black tracking-[0.08em] transition ${
              modo === "qr" ? "border-[#f0d08a] bg-[#f0d08a]/15 text-[#f0d08a]" : "border-[#3a4a6b] text-[#ccb780]"
            }`}>
            <QrCode className="h-4 w-4" /> QR Code
          </button>
          <button type="button" onClick={() => setModo("barra")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-[13px] font-black tracking-[0.08em] transition ${
              modo === "barra" ? "border-[#f0d08a] bg-[#f0d08a]/15 text-[#f0d08a]" : "border-[#3a4a6b] text-[#ccb780]"
            }`}>
            <Barcode className="h-4 w-4" /> Cód. barras
          </button>
        </div>
        <button type="button" onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#8b2020] bg-[#3d1a1a] py-3.5 text-sm font-black uppercase tracking-[0.14em] text-[#f0a0a0] active:brightness-110">
          <X className="h-4 w-4" /> Cancelar
        </button>
      </div>
    </div>
  )
}
