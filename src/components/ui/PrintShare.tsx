import { useState, ReactNode } from "react";
import { Printer, Share2, MessageCircle, Mail, Copy, Check } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/components/ui/Toast";
import shopConfig from "@/../shopapp.js";

interface PrintShareProps {
  title: string;
  content: string;
  children?: ReactNode;
}

export function PrintShareButton({ title, content, children }: PrintShareProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullText = `${title} — ${shopConfig.clientShop.name}\n${"=".repeat(40)}\n${content}\n\n${shopConfig.developer.copyright}`;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(fullText);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setShowShareMenu(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${title} — ${shopConfig.clientShop.name}`);
    const body = encodeURIComponent(fullText);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    setShowShareMenu(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast(t("copyToClipboard"), "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast(t("copyToClipboard"), "error");
    }
    setShowShareMenu(false);
  };

  return (
    <div className="flex items-center gap-2 print:hidden relative">
      {children}
      <button
        onClick={handlePrint}
        title={t("print")}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
      >
        <Printer size={14} />
        <span className="hidden sm:inline">{t("print")}</span>
      </button>
      <button
        onClick={() => setShowShareMenu((s) => !s)}
        title={t("share")}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
      >
        <Share2 size={14} />
        <span className="hidden sm:inline">{t("share")}</span>
      </button>
      {showShareMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
          <div className="absolute top-full mt-1 end-0 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[160px] animate-[slideUp_0.2s_ease]">
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MessageCircle size={16} className="text-emerald-500" />
              {t("whatsapp")}
            </button>
            <button
              onClick={handleEmail}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Mail size={16} className="text-blue-500" />
              {t("email")}
            </button>
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-slate-500" />}
              {t("copy")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
