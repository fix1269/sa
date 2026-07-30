import { useState } from "react";
import { Receipt, ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/components/ui/Toast";
import { Card, PageHeader, Breadcrumbs } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PrintShareButton } from "@/components/ui/PrintShare";
import { ArchiveView, InlineForm } from "@/components/ui/Archive";
import { useFirestore, formatDate } from "@/hooks/useFirestore";
import shopConfig from "@/../shopapp.js";

interface Expense {
  id: string;
  category: string;
  amount: number;
  paymentOrigin: string;
  date: string;
  notes?: string;
  createdAt: unknown;
  [key: string]: unknown;
}

const CATEGORIES = ["rent", "salaries", "electricity", "gas", "water", "insurances", "repairs", "operatingCosts", "others"];

export function ExpensesModule({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { items, addItem, updateItem, deleteItem } = useFirestore<Expense>("rofof_expenses");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState({ category: "rent", amount: 0, paymentOrigin: "cashDrawer", date: new Date().toISOString().split("T")[0], notes: "" });

  const save = async () => {
    if (!form.amount) return;
    if (editing) { await updateItem(editing.id, form); setEditing(null); }
    else { await addItem({ ...form, createdAt: new Date().toISOString() } as Omit<Expense, "id">); }
    setForm({ category: "rent", amount: 0, paymentOrigin: "cashDrawer", date: new Date().toISOString().split("T")[0], notes: "" });
    setShowForm(false);
    toast(t("saveSuccess"), "success");
  };

  const startEdit = (e: Expense) => { setEditing(e); setForm({ category: e.category, amount: e.amount, paymentOrigin: e.paymentOrigin, date: e.date, notes: e.notes || "" }); setShowForm(true); };

  const now = new Date();
  const monthExpenses = items.filter((e) => { const d = new Date(e.date || (e.createdAt as string)); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const monthlyTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const byCategory: Record<string, number> = {};
  monthExpenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

  const shareContent = `${t("monthlyTotal")}: ${monthlyTotal} ${shopConfig.clientShop.currency}\n\n${Object.entries(byCategory).map(([k, v]) => `${t(k)}: ${v}`).join("\n")}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title={t("expensesTracker")}
        description={t("expensesDesc")}
        icon={<Receipt className="w-6 h-6 text-rose-600" />}
        breadcrumbs={<Breadcrumbs items={[{ label: t("dashboard"), onClick: onBack }, { label: t("expensesTracker") }]} />}
        actions={<><Button onClick={onBack} variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("backToDashboard")}</Button><Button onClick={() => { setEditing(null); setForm({ category: "rent", amount: 0, paymentOrigin: "cashDrawer", date: new Date().toISOString().split("T")[0], notes: "" }); setShowForm(true); }} size="sm" className="bg-rose-600 hover:bg-rose-700"><Plus size={14} /> {t("addExpense")}</Button><PrintShareButton title={t("expensesTracker")} content={shareContent} /></>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Card className="p-4 print-area"><div className="text-xs text-slate-500">{t("monthlyTotal")}</div><div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{monthlyTotal} <span className="text-xs font-normal">{shopConfig.clientShop.currency}</span></div></Card>
        {CATEGORIES.slice(0, 3).map((cat) => <Card key={cat} className="p-4 print-area"><div className="text-xs text-slate-500">{t(cat)}</div><div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{byCategory[cat] || 0}</div></Card>)}
      </div>

      {showForm && (
        <InlineForm title={editing ? t("edit") : t("addExpense")} onSave={save} onCancel={() => { setShowForm(false); setEditing(null); }}>
          <div className="grid grid-cols-2 gap-2">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400">
              {CATEGORIES.map((c) => <option key={c} value={c}>{t(c)}</option>)}
            </select>
            <input type="number" placeholder={t("amount")} value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400" />
            <select value={form.paymentOrigin} onChange={(e) => setForm({ ...form, paymentOrigin: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400">
              <option value="cashDrawer">{t("cashDrawer")}</option>
              <option value="digitalWallet">{t("financialServices")}</option>
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400" />
            <textarea placeholder={t("notes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400 col-span-2 resize-y" />
          </div>
        </InlineForm>
      )}

      <Card className="p-5 print-area">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">{t("dayLog")} ({items.length})</h3>
        <ArchiveView
          records={items}
          lang={lang}
          emptyMessage={t("noData")}
          emptyIcon={<Receipt className="w-10 h-10" />}
          renderDay={(dayRecords) => (
            <div className="table-shield">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-start font-medium">{t("category")}</th>
                    <th className="px-3 py-2 text-start font-medium">{t("amount")}</th>
                    <th className="px-3 py-2 text-start font-medium">{t("paymentOrigin")}</th>
                    <th className="px-3 py-2 text-start font-medium">{t("notes")}</th>
                    <th className="px-3 py-2 text-end font-medium print-hide">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRecords.map((r) => {
                    const e = r as Expense;
                    return (
                      <tr key={e.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400">{t(e.category)}</span></td>
                        <td className="px-3 py-2 text-slate-900 dark:text-white font-medium">{e.amount} {shopConfig.clientShop.currency}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300 text-xs">{e.paymentOrigin === "cashDrawer" ? t("cashDrawer") : t("financialServices")}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400 truncate-cell">{e.notes || "—"}</td>
                        <td className="px-3 py-2 text-end print-hide">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => startEdit(e)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"><Pencil size={12} /> {t("edit")}</button>
                            <button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteItem(e.id); toast(t("deleteSuccess"), "success"); } }} className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-1"><Trash2 size={12} /> {t("delete")}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        />
      </Card>
    </div>
  );
}
