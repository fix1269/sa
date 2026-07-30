import { useState } from "react";
import { Trash2, ArrowLeft, Plus, Filter, Package, Pencil } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/components/ui/Toast";
import { Card, PageHeader, Breadcrumbs } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PrintShareButton } from "@/components/ui/PrintShare";
import { ArchiveView, InlineForm, InfoTooltip } from "@/components/ui/Archive";
import { useFirestore } from "@/hooks/useFirestore";
import shopConfig from "@/../shopapp.js";

interface WasteRecord {
  id: string;
  itemName: string;
  quantity: number;
  costPerItem: number;
  totalCost: number;
  reason: string;
  supplier?: string;
  returnable: boolean;
  date: string;
  createdAt: unknown;
  [key: string]: unknown;
}

const REASONS = ["expired", "broken", "badStorage", "returnable"];

export function WasteModule({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { items, addItem, updateItem, deleteItem } = useFirestore<WasteRecord>("rofof_waste");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WasteRecord | null>(null);
  const [form, setForm] = useState({ itemName: "", quantity: 1, costPerItem: 0, reason: "expired", supplier: "", returnable: false, date: new Date().toISOString().split("T")[0] });
  const [supplierFilter, setSupplierFilter] = useState("all");

  const totalCost = form.quantity * form.costPerItem;

  const save = async () => {
    if (!form.itemName.trim()) return;
    if (editing) { await updateItem(editing.id, { ...form, totalCost }); setEditing(null); }
    else { await addItem({ ...form, totalCost, createdAt: new Date().toISOString() } as Omit<WasteRecord, "id">); }
    setForm({ itemName: "", quantity: 1, costPerItem: 0, reason: "expired", supplier: "", returnable: false, date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    toast(t("saveSuccess"), "success");
  };

  const startEdit = (w: WasteRecord) => { setEditing(w); setForm({ itemName: w.itemName, quantity: w.quantity, costPerItem: w.costPerItem, reason: w.reason, supplier: w.supplier || "", returnable: w.returnable, date: w.date }); setShowForm(true); };

  const suppliers = [...new Set(items.map((w) => w.supplier).filter(Boolean))] as string[];
  const filtered = supplierFilter === "all" ? items : items.filter((w) => w.supplier === supplierFilter);
  const returnable = filtered.filter((w) => w.returnable);
  const grandTotal = items.reduce((s, w) => s + w.totalCost, 0);

  const shareContent = `${t("totalWaste")}: ${grandTotal} ${shopConfig.clientShop.currency}\n\n${items.map((w) => `${w.itemName} (${w.quantity}x${w.costPerItem}) = ${w.totalCost} [${t(w.reason)}]`).join("\n")}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title={t("wasteLog")}
        description={t("wasteDesc")}
        icon={<Trash2 className="w-6 h-6 text-rose-700" />}
        breadcrumbs={<Breadcrumbs items={[{ label: t("dashboard"), onClick: onBack }, { label: t("wasteLog") }]} />}
        actions={<><Button onClick={onBack} variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("backToDashboard")}</Button><Button onClick={() => { setEditing(null); setForm({ itemName: "", quantity: 1, costPerItem: 0, reason: "expired", supplier: "", returnable: false, date: new Date().toISOString().split("T")[0] }); setShowForm(true); }} size="sm" className="bg-rose-700 hover:bg-rose-800"><Plus size={14} /> {t("addWaste")}</Button><PrintShareButton title={t("wasteLog")} content={shareContent} /></>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <Card className="p-4 print-area"><div className="text-xs text-slate-500">{t("totalCost")}</div><div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">{grandTotal} <span className="text-xs">{shopConfig.clientShop.currency}</span></div></Card>
        <Card className="p-4 print-area"><div className="text-xs text-slate-500">{t("returnable")}</div><div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{returnable.length}</div></Card>
        <Card className="p-4 print-area"><div className="text-xs text-slate-500">{t("items")}</div><div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{items.length}</div></Card>
      </div>

      {suppliers.length > 0 && (
        <Card className="p-4 mb-5 print-area">
          <div className="flex items-center gap-2 mb-2"><Filter className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t("supplierRefundFilter")}</span></div>
          <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="w-full sm:w-64 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400">
            <option value="all">{t("allSuppliers")}</option>
            {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Card>
      )}

      {showForm && (
        <InlineForm title={editing ? t("edit") : t("addWaste")} onSave={save} onCancel={() => { setShowForm(false); setEditing(null); }}>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder={t("product")} value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400 col-span-2" />
            <input type="number" placeholder={t("quantity")} value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400" />
            <input type="number" placeholder={t("costPerItem")} value={form.costPerItem || ""} onChange={(e) => setForm({ ...form, costPerItem: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400" />
            <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value, returnable: e.target.value === "returnable" })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400 col-span-2">
              {REASONS.map((r) => <option key={r} value={r}>{t(r)}</option>)}
            </select>
            <textarea placeholder={t("supplier")} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} rows={2} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400 col-span-2 resize-y" />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400 col-span-2" />
            <div className="col-span-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-sm font-medium text-center">{t("totalCost")}: {totalCost} {shopConfig.clientShop.currency}</div>
          </div>
        </InlineForm>
      )}

      <Card className="p-5 print-area">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">{t("dayLog")} ({filtered.length})</h3>
        <ArchiveView
          records={filtered}
          lang={lang}
          emptyMessage={t("noData")}
          emptyIcon={<Package className="w-10 h-10" />}
          renderDay={(dayRecords) => (
            <div className="table-shield">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-start font-medium">{t("product")}</th>
                    <th className="px-3 py-2 text-start font-medium">{t("quantity")}</th>
                    <th className="px-3 py-2 text-start font-medium">{t("totalCost")}</th>
                    <th className="px-3 py-2 text-start font-medium">{t("reason")}</th>
                    <th className="px-3 py-2 text-start font-medium">{t("supplier")}</th>
                    <th className="px-3 py-2 text-end font-medium print-hide">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRecords.map((r) => {
                    const w = r as WasteRecord;
                    return (
                      <tr key={w.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2 text-slate-900 dark:text-white font-medium truncate-cell"><InfoTooltip text={w.itemName}>{w.itemName}</InfoTooltip></td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{w.quantity}</td>
                        <td className="px-3 py-2 text-rose-700 dark:text-rose-400 font-medium">{w.totalCost}</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{t(w.reason)}</span></td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400 truncate-cell">{w.supplier || "—"}</td>
                        <td className="px-3 py-2 text-end print-hide">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => startEdit(w)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"><Pencil size={12} /> {t("edit")}</button>
                            <button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteItem(w.id); toast(t("deleteSuccess"), "success"); } }} className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-1"><Trash2 size={12} /> {t("delete")}</button>
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
        {returnable.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">{t("returnable")} ({returnable.length})</div>
            <PrintShareButton title={t("supplierRefundFilter")} content={returnable.map((w) => `${w.itemName} (${w.quantity}) — ${w.supplier}`).join("\n")} />
          </div>
        )}
      </Card>
    </div>
  );
}
