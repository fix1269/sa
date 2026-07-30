import { useState } from "react";
import { AlertTriangle, ArrowLeft, Plus, Trash2, ScanLine, Pencil } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/components/ui/Toast";
import { Card, PageHeader, Breadcrumbs } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PrintShareButton } from "@/components/ui/PrintShare";
import { ArchiveView, InlineForm } from "@/components/ui/Archive";
import { useFirestore, formatDate } from "@/hooks/useFirestore";
import shopConfig from "@/../shopapp.js";

interface ShortageItem {
  productName: string;
  quantity: number;
  notes?: string;
}

interface ShortageRecord {
  id: string;
  date: string;
  items: ShortageItem[];
  createdAt: unknown;
  [key: string]: unknown;
}

export function ShortagesModule({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { items, addItem, updateItem, deleteItem } = useFirestore<ShortageRecord>("rofof_shortages");

  const [draftItems, setDraftItems] = useState<ShortageItem[]>([{ productName: "", quantity: 1, notes: "" }]);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [editing, setEditing] = useState<ShortageRecord | null>(null);
  const [editItems, setEditItems] = useState<ShortageItem[]>([]);

  const addRow = () => setDraftItems([...draftItems, { productName: "", quantity: 1, notes: "" }]);
  const removeRow = (i: number) => setDraftItems(draftItems.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof ShortageItem, value: string | number) => setDraftItems(draftItems.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const commitList = async () => {
    const valid = draftItems.filter((d) => d.productName.trim());
    if (valid.length === 0) return;
    await addItem({ date: recordDate, items: valid, createdAt: new Date().toISOString() } as Omit<ShortageRecord, "id">);
    setDraftItems([{ productName: "", quantity: 1, notes: "" }]);
    toast(t("saveSuccess"), "success");
  };

  const startEdit = (r: ShortageRecord) => { setEditing(r); setEditItems(r.items.map((i) => ({ ...i }))); };
  const saveEdit = async () => {
    if (!editing) return;
    await updateItem(editing.id, { items: editItems.filter((i) => i.productName.trim()) });
    setEditing(null);
    toast(t("saveSuccess"), "success");
  };

  const shareContent = items.map((r) => `${formatDate(r.date || r.createdAt, lang)}:\n${r.items.map((i) => `  - ${i.productName} (${i.quantity})`).join("\n")}`).join("\n\n");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title={t("shortagesRecorder")}
        description={t("shortagesDesc")}
        icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
        breadcrumbs={<Breadcrumbs items={[{ label: t("dashboard"), onClick: onBack }, { label: t("shortagesRecorder") }]} />}
        actions={<><Button onClick={onBack} variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("backToDashboard")}</Button><PrintShareButton title={t("shortagesRecorder")} content={shareContent} /></>}
      />

      <Card className="p-5 mb-5 print-area">
        <div className="flex items-center gap-2 mb-4"><ScanLine className="w-4 h-4 text-orange-500" /><h3 className="font-bold text-slate-900 dark:text-white">{t("addShortage")}</h3></div>
        <div className="mb-3"><label className="block text-xs font-medium text-slate-500 mb-1">{t("date")}</label><input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400" /></div>
        <div className="space-y-2">
          {draftItems.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input placeholder={t("product")} value={item.productName} onChange={(e) => updateRow(i, "productName", e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400" />
              <input type="number" placeholder={t("quantity")} value={item.quantity || ""} onChange={(e) => updateRow(i, "quantity", +e.target.value)} className="w-20 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400" />
              <textarea placeholder={t("notes")} value={item.notes || ""} onChange={(e) => updateRow(i, "notes", e.target.value)} rows={2} className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400 resize-y" />
              {draftItems.length > 1 && <button onClick={() => removeRow(i)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"><Trash2 size={16} /></button>}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3"><Button onClick={addRow} variant="outline" size="sm"><Plus size={14} /> {t("addMore")}</Button><Button onClick={commitList} variant="primary" size="sm" className="bg-orange-600 hover:bg-orange-700">{t("save")}</Button></div>
      </Card>

      {editing && (
        <InlineForm title={t("edit")} onSave={saveEdit} onCancel={() => setEditing(null)}>
          <div className="space-y-2">
            {editItems.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder={t("product")} value={item.productName} onChange={(e) => setEditItems(editItems.map((it, idx) => idx === i ? { ...it, productName: e.target.value } : it))} className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400" />
                <input type="number" placeholder={t("quantity")} value={item.quantity || ""} onChange={(e) => setEditItems(editItems.map((it, idx) => idx === i ? { ...it, quantity: +e.target.value } : it))} className="w-20 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400" />
              </div>
            ))}
          </div>
        </InlineForm>
      )}

      <Card className="p-5 print-area">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">{t("dayLog")}</h3>
        <ArchiveView
          records={items}
          lang={lang}
          emptyMessage={t("noData")}
          emptyIcon={<AlertTriangle className="w-10 h-10" />}
          renderDay={(dayRecords) => (
            <div className="table-shield">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                  <tr>
                    <th className="px-3 py-1.5 text-start font-medium">{t("items")}</th>
                    <th className="px-3 py-1.5 text-end font-medium print-hide">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRecords.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                        {(r as ShortageRecord).items.map((i, idx) => <span key={idx} className="inline-block me-2 mb-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs">{i.productName} ({i.quantity})</span>)}
                      </td>
                      <td className="px-3 py-2 text-end print-hide">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(r as ShortageRecord)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"><Pencil size={12} /> {t("edit")}</button>
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
