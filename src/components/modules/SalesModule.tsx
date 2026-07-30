import { useState } from "react";
import { TrendingUp, ArrowLeft, Calculator, Plus, Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/components/ui/Toast";
import { Card, PageHeader, Breadcrumbs } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PrintShareButton } from "@/components/ui/PrintShare";
import { ArchiveView, InlineForm } from "@/components/ui/Archive";
import { useFirestore, formatDate } from "@/hooks/useFirestore";
import shopConfig from "@/../shopapp.js";

interface SalesRecord {
  id: string;
  type: "bulk" | "shift";
  bulkAmount?: number;
  profitPercent?: number;
  openingFloat?: number;
  totalManual?: number;
  totalDigital?: number;
  recordedExpenses?: number;
  actualCash?: number;
  expectedDrawer?: number;
  shortageSurplus?: number;
  date: string;
  createdAt: unknown;
  [key: string]: unknown;
}

export function SalesModule({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { items, addItem, updateItem, deleteItem } = useFirestore<SalesRecord>("rofof_sales_audit");

  const [bulkAmount, setBulkAmount] = useState("");
  const [profitPercent, setProfitPercent] = useState("15");
  const [openingFloat, setOpeningFloat] = useState("");
  const [totalManual, setTotalManual] = useState("");
  const [totalDigital, setTotalDigital] = useState("");
  const [recordedExpenses, setRecordedExpenses] = useState("");
  const [actualCash, setActualCash] = useState("");

  const [editing, setEditing] = useState<SalesRecord | null>(null);
  const [editForm, setEditForm] = useState({ bulkAmount: 0, profitPercent: 0, actualCash: 0 });

  const expectedDrawer = (parseFloat(openingFloat) || 0) + (parseFloat(totalManual) || 0) + (parseFloat(totalDigital) || 0) - (parseFloat(recordedExpenses) || 0);
  const shortageSurplus = actualCash ? (parseFloat(actualCash) || 0) - expectedDrawer : 0;

  const saveBulk = async () => {
    if (!bulkAmount) return;
    await addItem({ type: "bulk", bulkAmount: parseFloat(bulkAmount), profitPercent: parseFloat(profitPercent), date: new Date().toISOString(), createdAt: new Date().toISOString() } as Omit<SalesRecord, "id">);
    setBulkAmount("");
    toast(t("saveSuccess"), "success");
  };

  const saveShift = async () => {
    await addItem({ type: "shift", openingFloat: parseFloat(openingFloat) || 0, totalManual: parseFloat(totalManual) || 0, totalDigital: parseFloat(totalDigital) || 0, recordedExpenses: parseFloat(recordedExpenses) || 0, actualCash: parseFloat(actualCash) || 0, expectedDrawer, shortageSurplus, date: new Date().toISOString(), createdAt: new Date().toISOString() } as Omit<SalesRecord, "id">);
    setOpeningFloat(""); setTotalManual(""); setTotalDigital(""); setRecordedExpenses(""); setActualCash("");
    toast(t("saveSuccess"), "success");
  };

  const startEdit = (r: SalesRecord) => {
    setEditing(r);
    setEditForm({ bulkAmount: r.bulkAmount || 0, profitPercent: r.profitPercent || 0, actualCash: r.actualCash || 0 });
  };

  const saveEdit = async () => {
    if (!editing) return;
    await updateItem(editing.id, editForm);
    setEditing(null);
    toast(t("saveSuccess"), "success");
  };

  const shareContent = items.map((r) => {
    if (r.type === "bulk") return `${t("bulkSales")}: ${r.bulkAmount} | ${t("profitPercent")}: ${r.profitPercent}%`;
    return `${t("expectedDrawer")}: ${r.expectedDrawer} | ${t("shortageSurplus")}: ${r.shortageSurplus}`;
  }).join("\n");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title={t("salesAssistant")}
        description={t("salesAssistantDesc")}
        icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
        breadcrumbs={<Breadcrumbs items={[{ label: t("dashboard"), onClick: onBack }, { label: t("salesAssistant") }]} />}
        actions={<><Button onClick={onBack} variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("backToDashboard")}</Button><PrintShareButton title={t("salesAssistant")} content={shareContent} /></>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card className="p-5 print-area">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-500" /> {t("recordSales")}</h3>
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t("bulkSales")}</label><input type="number" value={bulkAmount} onChange={(e) => setBulkAmount(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="0" /></div>
            <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t("profitPercent")}</label><input type="number" value={profitPercent} onChange={(e) => setProfitPercent(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="15" /></div>
            {bulkAmount && <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm">{t("profit")}: {((parseFloat(bulkAmount) || 0) * (parseFloat(profitPercent) || 0) / 100).toFixed(2)} {shopConfig.clientShop.currency}</div>}
            <button onClick={saveBulk} className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center justify-center gap-1.5"><Plus size={16} /> {t("save")}</button>
          </div>
        </Card>

        <Card className="p-5 print-area">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Calculator className="w-4 h-4 text-emerald-500" /> {t("shiftEndCalc")}</h3>
          <div className="space-y-2.5">
            <Field label={t("openingFloat")} value={openingFloat} onChange={setOpeningFloat} />
            <Field label={t("totalManual")} value={totalManual} onChange={setTotalManual} />
            <Field label={t("totalDigital")} value={totalDigital} onChange={setTotalDigital} />
            <Field label={t("recordedExpenses")} value={recordedExpenses} onChange={setRecordedExpenses} />
            <Field label={t("actualCash")} value={actualCash} onChange={setActualCash} />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-center"><div className="text-xs text-slate-500">{t("expectedDrawer")}</div><div className="font-bold text-slate-900 dark:text-white">{expectedDrawer.toFixed(2)}</div></div>
              <div className={`p-3 rounded-lg text-center ${shortageSurplus < 0 ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"}`}><div className="text-xs text-slate-500">{t("shortageSurplus")}</div><div className="font-bold">{shortageSurplus >= 0 ? "+" : ""}{shortageSurplus.toFixed(2)}</div></div>
            </div>
            <button onClick={saveShift} className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center justify-center gap-1.5"><Calculator size={16} /> {t("save")}</button>
          </div>
        </Card>
      </div>

      {editing && (
        <InlineForm title={t("edit")} onSave={saveEdit} onCancel={() => setEditing(null)}>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="block text-xs font-medium text-slate-500 mb-1">{t("bulkSales")}</label><input type="number" value={editForm.bulkAmount || ""} onChange={(e) => setEditForm({ ...editForm, bulkAmount: +e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400" /></div>
            <div><label className="block text-xs font-medium text-slate-500 mb-1">{t("profitPercent")}</label><input type="number" value={editForm.profitPercent || ""} onChange={(e) => setEditForm({ ...editForm, profitPercent: +e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400" /></div>
            <div><label className="block text-xs font-medium text-slate-500 mb-1">{t("actualCash")}</label><input type="number" value={editForm.actualCash || ""} onChange={(e) => setEditForm({ ...editForm, actualCash: +e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400" /></div>
          </div>
        </InlineForm>
      )}

      <Card className="p-5 print-area">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">{t("dayLog")}</h3>
        <ArchiveView
          records={items}
          lang={lang}
          emptyMessage={t("noData")}
          emptyIcon={<TrendingUp className="w-10 h-10" />}
          renderDay={(dayRecords) => (
            <div className="table-shield">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-start font-medium">{t("type")}</th>
                    <th className="px-3 py-2 text-start font-medium">{t("amount")}</th>
                    <th className="px-3 py-2 text-start font-medium">{t("shortageSurplus")}</th>
                    <th className="px-3 py-2 text-end font-medium print-hide">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRecords.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{r.type === "bulk" ? t("recordSales") : t("shiftEndCalc")}</td>
                      <td className="px-3 py-2 text-slate-900 dark:text-white font-medium">{String(r.bulkAmount ?? r.expectedDrawer ?? "—")}</td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{r.shortageSurplus != null ? String(r.shortageSurplus) : "—"}</td>
                      <td className="px-3 py-2 text-end print-hide">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(r as SalesRecord)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"><Pencil size={12} /> {t("edit")}</button>
                          <button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteItem(r.id); toast(t("deleteSuccess"), "success"); } }} className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-1"><Trash2 size={12} /> {t("delete")}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        />
      </Card>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400" placeholder="0" />
    </div>
  );
}
