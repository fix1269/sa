import { useState } from "react";
import { Truck, ArrowLeft, Plus, Trash2, ClipboardList, ExternalLink, MessageCircle, Pencil } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/components/ui/Toast";
import { Card, PageHeader, Breadcrumbs, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PrintShareButton } from "@/components/ui/PrintShare";
import { InlineForm, InfoTooltip } from "@/components/ui/Archive";
import { useFirestore, formatDate } from "@/hooks/useFirestore";
import shopConfig from "@/../shopapp.js";

interface Vendor {
  id: string;
  name: string;
  agent: string;
  mobile: string;
  appLink: string;
  date: string;
  createdAt: unknown;
  [key: string]: unknown;
}

interface Order {
  id: string;
  vendorName: string;
  items: string;
  status: "pending" | "shipped" | "received";
  date: string;
  createdAt: unknown;
  [key: string]: unknown;
}

export function WholesalersModule({ onBack, shortageItems }: { onBack: () => void; shortageItems: { productName: string; quantity: number }[] }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { items: vendors, addItem: addVendor, updateItem: updateVendor, deleteItem: deleteVendor } = useFirestore<Vendor>("rofof_vendors");
  const { items: orders, addItem: addOrder, updateItem: updateOrder, deleteItem: deleteOrder } = useFirestore<Order>("rofof_orders");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ name: "", agent: "", mobile: "", appLink: "" });

  const saveVendor = async () => {
    if (!form.name.trim()) return;
    if (editing) { await updateVendor(editing.id, form); setEditing(null); }
    else { await addVendor({ ...form, date: new Date().toISOString(), createdAt: new Date().toISOString() } as Omit<Vendor, "id">); }
    setForm({ name: "", agent: "", mobile: "", appLink: "" });
    setShowForm(false);
    toast(t("saveSuccess"), "success");
  };

  const startEdit = (v: Vendor) => { setEditing(v); setForm({ name: v.name, agent: v.agent, mobile: v.mobile, appLink: v.appLink }); setShowForm(true); };

  const packOrder = async () => {
    if (shortageItems.length === 0) { toast(t("noItemsForOrder"), "error"); return; }
    const itemsText = shortageItems.map((i) => `${i.productName} (${i.quantity})`).join("\n");
    const fullText = t("orderPackText").replace("{shop}", shopConfig.clientShop.name).replace("{items}", itemsText).replace("{count}", String(shortageItems.length));
    try { await navigator.clipboard.writeText(fullText); toast(t("orderPlaced"), "success"); }
    catch { toast(t("orderPlaced"), "info"); }
    await addOrder({ vendorName: "—", items: itemsText, status: "pending", date: new Date().toISOString().split("T")[0], createdAt: new Date().toISOString() } as Omit<Order, "id">);
  };

  const whatsappChat = (mobile: string) => {
    const phone = mobile.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
    shipped: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
    received: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
  };

  const shareContent = `${t("vendors")}:\n${vendors.map((v) => `${v.name} — ${v.mobile}`).join("\n")}\n\n${t("orderStatus")}:\n${orders.map((o) => `${o.date}: ${o.items} [${t(o.status)}]`).join("\n")}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title={t("wholesalers")}
        description={t("wholesalersDesc")}
        icon={<Truck className="w-6 h-6 text-teal-600" />}
        breadcrumbs={<Breadcrumbs items={[{ label: t("dashboard"), onClick: onBack }, { label: t("wholesalers") }]} />}
        actions={<><Button onClick={onBack} variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("backToDashboard")}</Button><Button onClick={() => { setEditing(null); setForm({ name: "", agent: "", mobile: "", appLink: "" }); setShowForm(true); }} size="sm" className="bg-teal-600 hover:bg-teal-700"><Plus size={14} /> {t("addVendor")}</Button><Button onClick={packOrder} size="sm" variant="outline" className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"><ClipboardList size={14} /> {t("packOrder")}</Button><PrintShareButton title={t("wholesalers")} content={shareContent} /></>}
      />

      {/* Inline vendor form */}
      {showForm && (
        <InlineForm title={editing ? t("edit") : t("addVendor")} onSave={saveVendor} onCancel={() => { setShowForm(false); setEditing(null); }}>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder={t("vendorName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400 col-span-2" />
            <textarea placeholder={t("agent")} value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })} rows={2} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400 col-span-2 resize-y" />
            <input placeholder={t("mobile")} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400" />
            <input placeholder={t("appLink")} value={form.appLink} onChange={(e) => setForm({ ...form, appLink: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-400" />
          </div>
        </InlineForm>
      )}

      {/* Vendor cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {vendors.map((v) => (
          <Card key={v.id} className="p-4 print-area">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center"><Truck className="w-5 h-5 text-white" /></div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(v)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Pencil size={14} /></button>
                <button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteVendor(v.id); toast(t("deleteSuccess"), "success"); } }} className="text-rose-400 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="font-bold text-slate-900 dark:text-white truncate-cell"><InfoTooltip text={v.name}>{v.name}</InfoTooltip></div>
            {v.agent && <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{v.agent}</div>}
            <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">{v.mobile}</div>
            <div className="flex gap-1.5 print-hide">
              {v.mobile && <button onClick={() => whatsappChat(v.mobile)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50"><MessageCircle size={12} /> {t("whatsapp")}</button>}
              {v.appLink && <a href={v.appLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50"><ExternalLink size={12} /> {t("appLink")}</a>}
            </div>
          </Card>
        ))}
        {vendors.length === 0 && !showForm && (
          <div className="col-span-full"><EmptyState message={t("noData")} icon={<Truck className="w-10 h-10" />} /></div>
        )}
      </div>

      {/* Orders */}
      <Card className="p-5 print-area">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">{t("orderStatus")} ({orders.length})</h3>
        <div className="table-shield">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{t("date")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("orderItems")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("status")}</th>
                <th className="px-3 py-2 text-end font-medium print-hide">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{formatDate(o.date || o.createdAt, lang)}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 truncate-cell"><InfoTooltip text={o.items}>{o.items}</InfoTooltip></td>
                  <td className="px-3 py-2"><select value={o.status} onChange={(e) => updateOrder(o.id, { status: e.target.value as "pending" | "shipped" | "received" })} className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[o.status]}`}><option value="pending">{t("pending")}</option><option value="shipped">{t("shipped")}</option><option value="received">{t("received")}</option></select></td>
                  <td className="px-3 py-2 text-end print-hide"><button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteOrder(o.id); toast(t("deleteSuccess"), "success"); } }} className="text-rose-500 text-xs hover:text-rose-600">{t("delete")}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <EmptyState message={t("noData")} icon={<ClipboardList className="w-10 h-10" />} />}
        </div>
      </Card>
    </div>
  );
}
