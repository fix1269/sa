import { useState } from "react";
import { CreditCard, ArrowLeft, Plus, Trash2, MessageCircle, AlertCircle, Users, Building2, Pencil } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/components/ui/Toast";
import { Card, PageHeader, Breadcrumbs, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PrintShareButton } from "@/components/ui/PrintShare";
import { ArchiveView, InlineForm, InfoTooltip } from "@/components/ui/Archive";
import { useFirestore, formatDate } from "@/hooks/useFirestore";
import shopConfig from "@/../shopapp.js";

interface Supplier {
  id: string;
  company: string;
  totalDebt: number;
  amountPaid: number;
  deadline: string;
  date: string;
  createdAt: unknown;
  [key: string]: unknown;
}

interface Customer {
  id: string;
  name: string;
  mobile: string;
  amount: number;
  description: string;
  date: string;
  createdAt: unknown;
  [key: string]: unknown;
}

export function CreditModule({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [tab, setTab] = useState<"suppliers" | "customers">("suppliers");

  const { items: suppliers, addItem: addSupplier, updateItem: updateSupplier, deleteItem: deleteSupplier } = useFirestore<Supplier>("rofof_suppliers");
  const { items: customers, addItem: addCustomer, updateItem: updateCustomer, deleteItem: deleteCustomer } = useFirestore<Customer>("rofof_customers");

  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [supplierForm, setSupplierForm] = useState({ company: "", totalDebt: 0, amountPaid: 0, deadline: "" });
  const [customerForm, setCustomerForm] = useState({ name: "", mobile: "", amount: 0, description: "" });

  const saveSupplier = async () => {
    if (!supplierForm.company.trim()) return;
    if (editingSupplier) { await updateSupplier(editingSupplier.id, supplierForm); setEditingSupplier(null); }
    else { await addSupplier({ ...supplierForm, date: new Date().toISOString(), createdAt: new Date().toISOString() } as Omit<Supplier, "id">); }
    setSupplierForm({ company: "", totalDebt: 0, amountPaid: 0, deadline: "" });
    setShowSupplierForm(false);
    toast(t("saveSuccess"), "success");
  };

  const startEditSupplier = (s: Supplier) => { setEditingSupplier(s); setSupplierForm({ company: s.company, totalDebt: s.totalDebt, amountPaid: s.amountPaid, deadline: s.deadline }); setShowSupplierForm(true); };

  const saveCustomer = async () => {
    if (!customerForm.name.trim()) return;
    if (editingCustomer) { await updateCustomer(editingCustomer.id, customerForm); setEditingCustomer(null); }
    else { await addCustomer({ ...customerForm, date: new Date().toISOString(), createdAt: new Date().toISOString() } as Omit<Customer, "id">); }
    setCustomerForm({ name: "", mobile: "", amount: 0, description: "" });
    setShowCustomerForm(false);
    toast(t("saveSuccess"), "success");
  };

  const startEditCustomer = (c: Customer) => { setEditingCustomer(c); setCustomerForm({ name: c.name, mobile: c.mobile, amount: c.amount, description: c.description }); setShowCustomerForm(true); };

  const isOverdue = (deadline: string) => deadline && new Date(deadline) < new Date();
  const remaining = (s: Supplier) => Math.max(0, s.totalDebt - s.amountPaid);

  const generateReminder = (c: Customer) => t("debtReminderText").replace("{name}", c.name).replace("{shop}", shopConfig.clientShop.name).replace("{amount}", String(c.amount)).replace("{currency}", shopConfig.clientShop.currency).replace("{items}", c.description || "—");

  const shareContent = tab === "suppliers"
    ? suppliers.map((s) => `${s.company}: ${t("remaining")} ${remaining(s)} ${shopConfig.clientShop.currency} ${isOverdue(s.deadline) ? "⚠️ " + t("overdue") : ""}`).join("\n")
    : customers.map((c) => `${c.name} (${c.mobile}): ${c.amount} ${shopConfig.clientShop.currency}`).join("\n");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title={t("creditDebt")}
        description={t("creditDebtDesc")}
        icon={<CreditCard className="w-6 h-6 text-purple-600" />}
        breadcrumbs={<Breadcrumbs items={[{ label: t("dashboard"), onClick: onBack }, { label: t("creditDebt") }]} />}
        actions={<><Button onClick={onBack} variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("backToDashboard")}</Button><PrintShareButton title={t("creditDebt")} content={shareContent} /></>}
      />

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab("suppliers")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "suppliers" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}><Building2 size={16} /> {t("suppliers")}</button>
        <button onClick={() => setTab("customers")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "customers" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}><Users size={16} /> {t("customers")}</button>
      </div>

      {tab === "suppliers" ? (
        <Card className="p-5 print-area">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white">{t("suppliers")} ({suppliers.length})</h3>
            <Button onClick={() => { setEditingSupplier(null); setSupplierForm({ company: "", totalDebt: 0, amountPaid: 0, deadline: "" }); setShowSupplierForm(true); }} size="sm" className="bg-purple-600 hover:bg-purple-700"><Plus size={14} /> {t("addSupplier")}</Button>
          </div>

          {showSupplierForm && (
            <InlineForm title={editingSupplier ? t("edit") : t("addSupplier")} onSave={saveSupplier} onCancel={() => { setShowSupplierForm(false); setEditingSupplier(null); }}>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder={t("supplierCompany")} value={supplierForm.company} onChange={(e) => setSupplierForm({ ...supplierForm, company: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 col-span-2" />
                <input type="number" placeholder={t("totalDebt")} value={supplierForm.totalDebt || ""} onChange={(e) => setSupplierForm({ ...supplierForm, totalDebt: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400" />
                <input type="number" placeholder={t("amountPaid")} value={supplierForm.amountPaid || ""} onChange={(e) => setSupplierForm({ ...supplierForm, amountPaid: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400" />
                <input type="date" value={supplierForm.deadline} onChange={(e) => setSupplierForm({ ...supplierForm, deadline: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 col-span-2" />
              </div>
            </InlineForm>
          )}

          <ArchiveView
            records={suppliers}
            lang={lang}
            emptyMessage={t("noData")}
            emptyIcon={<Building2 className="w-10 h-10" />}
            renderDay={(dayRecords) => (
              <div className="table-shield">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="px-3 py-2 text-start font-medium">{t("company")}</th>
                      <th className="px-3 py-2 text-start font-medium">{t("totalDebt")}</th>
                      <th className="px-3 py-2 text-start font-medium">{t("remaining")}</th>
                      <th className="px-3 py-2 text-start font-medium">{t("deadline")}</th>
                      <th className="px-3 py-2 text-end font-medium print-hide">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayRecords.map((r) => {
                      const s = r as Supplier;
                      return (
                        <tr key={s.id} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-3 py-2 text-slate-900 dark:text-white font-medium truncate-cell"><InfoTooltip text={s.company}>{s.company}</InfoTooltip></td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{s.totalDebt} {shopConfig.clientShop.currency}</td>
                          <td className="px-3 py-2 text-rose-600 dark:text-rose-400 font-medium">{remaining(s)} {shopConfig.clientShop.currency}</td>
                          <td className="px-3 py-2">{s.deadline ? <span className={`text-xs px-2 py-0.5 rounded-full ${isOverdue(s.deadline) ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>{isOverdue(s.deadline) && <AlertCircle className="w-3 h-3 inline me-1" />}{formatDate(s.deadline, lang)}</span> : "—"}</td>
                          <td className="px-3 py-2 text-end print-hide">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => startEditSupplier(s)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"><Pencil size={12} /> {t("edit")}</button>
                              <button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteSupplier(s.id); toast(t("deleteSuccess"), "success"); } }} className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-1"><Trash2 size={12} /> {t("delete")}</button>
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
      ) : (
        <Card className="p-5 print-area">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white">{t("customers")} ({customers.length})</h3>
            <Button onClick={() => { setEditingCustomer(null); setCustomerForm({ name: "", mobile: "", amount: 0, description: "" }); setShowCustomerForm(true); }} size="sm" className="bg-purple-600 hover:bg-purple-700"><Plus size={14} /> {t("addCustomer")}</Button>
          </div>

          {showCustomerForm && (
            <InlineForm title={editingCustomer ? t("edit") : t("addCustomer")} onSave={saveCustomer} onCancel={() => { setShowCustomerForm(false); setEditingCustomer(null); }}>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder={t("customerName")} value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400" />
                <input placeholder={t("customerMobile")} value={customerForm.mobile} onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400" />
                <input type="number" placeholder={t("amount")} value={customerForm.amount || ""} onChange={(e) => setCustomerForm({ ...customerForm, amount: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400" />
                <textarea placeholder={t("itemDescription")} value={customerForm.description} onChange={(e) => setCustomerForm({ ...customerForm, description: e.target.value })} rows={2} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 col-span-2" />
              </div>
            </InlineForm>
          )}

          <ArchiveView
            records={customers}
            lang={lang}
            emptyMessage={t("noData")}
            emptyIcon={<Users className="w-10 h-10" />}
            renderDay={(dayRecords) => (
              <div className="space-y-2">
                {dayRecords.map((r) => {
                  const c = r as Customer;
                  return (
                    <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{c.mobile}</div>
                        </div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{c.amount} <span className="text-xs font-normal">{shopConfig.clientShop.currency}</span></div>
                      </div>
                      {c.description && <p className="text-sm text-slate-600 dark:text-slate-300 mb-3"><InfoTooltip text={c.description}>{c.description}</InfoTooltip></p>}
                      <div className="flex gap-2 print-hide">
                        <button onClick={() => { const text = encodeURIComponent(generateReminder(c)); const phone = c.mobile.replace(/\D/g, ""); window.open(`https://wa.me/${phone}?text=${text}`, "_blank"); }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50"><MessageCircle size={14} /> {t("whatsappReminder")}</button>
                        <button onClick={() => startEditCustomer(c)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"><Pencil size={12} /> {t("edit")}</button>
                        <button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteCustomer(c.id); toast(t("deleteSuccess"), "success"); } }} className="px-3 py-1.5 rounded-lg text-rose-500 text-xs flex items-center gap-1"><Trash2 size={12} /> {t("delete")}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          />
        </Card>
      )}
    </div>
  );
}
