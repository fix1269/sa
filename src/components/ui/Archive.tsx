import { useState, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { toDate } from "@/hooks/useFirestore";

interface ArchiveGroup {
  key: string;
  label: string;
  count: number;
  children: ArchiveGroup[];
}

interface ArchiveViewProps {
  records: { id: string; date?: string; createdAt?: unknown; [key: string]: unknown }[];
  renderDay: (records: { id: string; date?: string; createdAt?: unknown; [key: string]: unknown }[]) => ReactNode;
  lang: "en" | "ar";
  emptyMessage: string;
  emptyIcon?: ReactNode;
}

export function ArchiveView({ records, renderDay, lang, emptyMessage, emptyIcon }: ArchiveViewProps) {
  const { t } = useI18n();
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  // Group by year -> month -> day
  const grouped: Record<string, Record<string, Record<string, typeof records>>> = {};
  records.forEach((r) => {
    const d = toDate(r.date || r.createdAt);
    const y = d.getFullYear().toString();
    const m = d.toLocaleString(lang === "ar" ? "ar-EG" : "en", { month: "long" });
    const day = d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short" });
    if (!grouped[y]) grouped[y] = {};
    if (!grouped[y][m]) grouped[y][m] = {};
    if (!grouped[y][m][day]) grouped[y][m][day] = [];
    grouped[y][m][day].push(r);
  });

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {emptyIcon && <div className="text-slate-300 dark:text-slate-600 mb-3">{emptyIcon}</div>}
        <p className="text-slate-400 dark:text-slate-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(grouped)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([year, months]) => {
          const yearCount = Object.values(months).reduce((s, m) => Object.values(m).reduce((ms, d) => ms + d.length, 0), 0);
          return (
            <div key={year} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => { setExpandedYear(expandedYear === year ? null : year); setExpandedMonth(null); }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-start"
              >
                {expandedYear === year ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400 rtl:rotate-180" />}
                <span className="font-bold text-slate-900 dark:text-white">{year}</span>
                <span className="text-xs text-slate-500">({yearCount} {t("recordCount")})</span>
              </button>
              {expandedYear === year && (
                <div className="p-2 space-y-2">
                  {Object.entries(months).map(([month, days]) => {
                    const monthCount = Object.values(days).reduce((s, d) => s + d.length, 0);
                    const monthKey = `${year}-${month}`;
                    return (
                      <div key={month} className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <button
                          onClick={() => setExpandedMonth(expandedMonth === monthKey ? null : monthKey)}
                          className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-start"
                        >
                          {expandedMonth === monthKey ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400 rtl:rotate-180" />}
                          <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{month}</span>
                          <span className="text-xs text-slate-500">({monthCount})</span>
                        </button>
                        {expandedMonth === monthKey && (
                          <div className="p-2 space-y-2">
                            {Object.entries(days).map(([day, dayRecords]) => (
                              <div key={day} className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <div className="px-3 py-1.5 bg-slate-50/30 dark:bg-slate-800/30 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                  {day}
                                </div>
                                {renderDay(dayRecords)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

interface InlineFormProps {
  title: string;
  children: ReactNode;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
}

export function InlineForm({ title, children, onSave, onCancel, saveLabel, cancelLabel }: InlineFormProps) {
  const { t } = useI18n();
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4 animate-[slideUp_0.2s_ease]">
      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">{title}</h4>
      <div className="space-y-3">{children}</div>
      <div className="flex gap-2 mt-4">
        <button onClick={onSave} className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:opacity-90 transition-opacity">
          {saveLabel || t("save")}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          {cancelLabel || t("cancel")}
        </button>
      </div>
    </div>
  );
}

interface InfoTooltipProps {
  text: string;
  children?: ReactNode;
}

export function InfoTooltip({ text, children }: InfoTooltipProps) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <span onClick={() => setShow((s) => !s)} className="cursor-pointer truncate-cell" title={text}>
        {children || text}
      </span>
      {show && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShow(false)} />
          <div className="absolute z-40 top-full mt-1 start-0 max-w-xs p-3 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs shadow-xl animate-[slideUp_0.15s_ease]">
            {text}
          </div>
        </>
      )}
    </span>
  );
}
