import { useEffect, useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useI18n } from "@/i18n/I18nContext";

interface Props {
  onDetected: (code: string) => void;
}

export function BarcodeScannerButton({ onDetected }: Props) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const containerId = useRef(`qr-${Math.random().toString(36).slice(2, 9)}`);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const stop = async () => {
    const s = scannerRef.current;
    if (s) {
      try { await s.stop(); await s.clear(); } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setActive(false);
    setStarting(false);
  };

  const start = async () => {
    setError("");
    setStarting(true);
    setActive(true);
    // wait a tick for the container div to mount
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(containerId.current, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decoded) => {
            onDetected(decoded);
            stop();
          },
          () => { /* per-frame failures are noise */ }
        );
        setStarting(false);
      } catch {
        setError(t("cameraError"));
        setStarting(false);
        setActive(false);
      }
    }, 50);
  };

  useEffect(() => () => { if (scannerRef.current) { scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {}); } }, []);

  return (
    <div className="relative">
      <button type="button" onClick={active ? stop : start} title={t("cameraScanner")} className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5">
        {active ? <X size={18} /> : <Camera size={18} />}
      </button>
      {active && (
        <div className="absolute top-full end-0 mt-2 z-50 w-72 sm:w-80 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              {starting ? <Loader2 size={12} className="animate-spin" /> : null}
              {starting ? t("scanning") : t("scanBarcode")}
            </span>
            <button onClick={stop} className="text-xs text-rose-500 hover:text-rose-600">{t("stopScan")}</button>
          </div>
          <div id={containerId.current} className="w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 min-h-[120px]" />
          {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
