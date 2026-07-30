import { useState } from "react";
import { Smartphone, ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/components/ui/Toast";
import { Card, PageHeader, Breadcrumbs, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PrintShareButton } from "@/components/ui/PrintShare";
import { InlineForm } from "@/components/ui/Archive";
import { useFirestore, formatDate } from "@/hooks/useFirestore";
import shopConfig from "@/../shopapp.js";

interface Platform {
  id: string;
  name: string;
  balance: number;
  commissionRate: number;
  [key: string]: unknown;
}

interface Transaction {
  id: string;
  platformName: string;
  type: "deposit" | "cashOut" | "billPayment";
  amount: number;
  commission: number;
  date: string;
  createdAt: unknown;
  [key: string]: unknown;
}

export function FinancialModule({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { items: platforms, addItem: addPlatform, updateItem: updatePlatform, deleteItem: deletePlatform } = useFirestore<Platform>("rofof_platforms");
  const { items: transactions, addItem: addTransaction, updateItem: updateTransaction, deleteItem: deleteTransaction } = useFirestore<Transaction>("rofof_transactions");

  const [showTxForm, setShowTxForm] = useState(false);
  const [showPlatformForm, setShowPlatformForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);

  const [txForm, setTxForm] = useState<{ platformName: string; type: "deposit" | "cashOut" | "billPayment"; amount: number; commissionRate: number }>({ platformName: "", type: "deposit", amount: 0, commissionRate: 1 });
  const [platformForm, setPlatformForm] = useState({ name: "", balance: 0, commissionRate: 1 });

  const typeLabels: Record<string, string> = { deposit: t("deposit"), cashOut: t("cashOut"), billPayment: t("billPayment") };

  const saveTransaction = async () => {
    if (!txForm.platformName || !txForm.amount) return;
    const commission = (txForm.amount * txForm.commissionRate) / 100;
    if (editingTx) {
      await updateTransaction(editingTx.id, { ...txForm, commission });
      setEditingTx(null);
    } else {
      await addTransaction({ ...txForm, commission, date: new Date().toISOString(), createdAt: new Date().toISOString() } as Omit<Transaction, "id">);
      const p = platforms.find((x) => x.name === txForm.platformName);
      if (p) await updatePlatform(p.id, { balance: txForm.type === "deposit" ? p.balance + txForm.amount : p.balance - txForm.amount });
    }
    setShowTxForm(false);
    setTxForm({ platformName: "", type: "deposit", amount: 0, commissionRate: 1 });
    toast(t("saveSuccess"), "success");
  };

  const startEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxForm({ platformName: tx.platformName, type: tx.type, amount: tx.amount, commissionRate: platforms.find((p) => p.name === tx.platformName)?.commissionRate || 1 });
    setShowTxForm(true);
  };

  const savePlatform = async () => {
    if (!platformForm.name.trim()) return;
    if (editingPlatform) { await updatePlatform(editingPlatform.id, platformForm); setEditingPlatform(null); }
    else { await addPlatform(platformForm as Omit<Platform, "id">); }
    setPlatformForm({ name: "", balance: 0, commissionRate: 1 });
    setShowPlatformForm(false);
    toast(t("saveSuccess"), "success");
  };

  const startEditPlatform = (p: Platform) => { setEditingPlatform(p); setPlatformForm({ name: p.name, balance: p.balance, commissionRate: p.commissionRate }); setShowPlatformForm(true); };

  const totalCommission = transactions.reduce((s, tx) => s + (tx.commission || 0), 0);
  const shareContent = `${t("netCommission")}: ${totalCommission.toFixed(2)} ${shopConfig.clientShop.currency}\n\n${platforms.map((p) => `${p.name}: ${p.balance} ${shopConfig.clientShop.currency}`).join("\n")}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title={t("financialServices")}
        description={t("financialServicesDesc")}
        icon={<Smartphone className="w-6 h-6 text-cyan-600" />}
        breadcrumbs={<Breadcrumbs items={[{ label: t("dashboard"), onClick: onBack }, { label: t("financialServices") }]} />}
        actions={<><Button onClick={onBack} variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("backToDashboard")}</Button><Button onClick={() => { setEditingTx(null); setTxForm({ platformName: "", type: "deposit", amount: 0, commissionRate: 1 }); setShowTxForm(true); }} size="sm" className="bg-cyan-600 hover:bg-cyan-700"><Plus size={14} /> {t("addTransaction")}</Button><PrintShareButton title={t("financialServices")} content={shareContent} /></>}
      />

      {/* Platform balances */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
        {platforms.map((p) => (
          <Card key={p.id} className="p-4 print-area">
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="w-5 h-5 text-cyan-500" />
              <div className="flex gap-1">
                <button onClick={() => startEditPlatform(p)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Pencil size={14} /></button>
                <button onClick={async () => { if (confirm(t("confirmDelete"))) { await deletePlatform(p.id); toast(t("deleteSuccess"), "success"); } }} className="text-rose-400 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate-cell">{p.name}</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{p.balance} <span className="text-xs font-normal text-slate-500">{shopConfig.clientShop.currency}</span></div>
            <div className="text-xs text-slate-400 mt-1">{t("commissionRate")}: {p.commissionRate}%</div>
          </Card>
        ))}
        <button onClick={() => { setEditingPlatform(null); setPlatformForm({ name: "", balance: 0, commissionRate: 1 }); setShowPlatformForm(true); }} className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors min-h-[100px]">
          <Plus className="w-6 h-6" /><span className="text-xs font-medium">{t("add")}</span>
        </button>
      </div>

      {/* Inline transaction form */}
      {showTxForm && (
        <InlineForm title={editingTx ? t("edit") : t("addTransaction")} onSave={saveTransaction} onCancel={() => { setShowTxForm(false); setEditingTx(null); }}>
          <div className="grid grid-cols-2 gap-2">
            <select value={txForm.platformName} onChange={(e) => { const p = platforms.find((x) => x.name === e.target.value); setTxForm({ ...txForm, platformName: e.target.value, commissionRate: p?.commissionRate || 1 }); }} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-400">
              <option value="">{t("selectPlatform")}</option>
              {platforms.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <select value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value as "deposit" | "cashOut" | "billPayment" })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-400">
              <option value="deposit">{t("deposit")}</option>
              <option value="cashOut">{t("cashOut")}</option>
              <option value="billPayment">{t("billPayment")}</option>
            </select>
            <input type="number" placeholder={t("amount")} value={txForm.amount || ""} onChange={(e) => setTxForm({ ...txForm, amount: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-400" />
            <input type="number" placeholder={t("commissionRate")} value={txForm.commissionRate || ""} onChange={(e) => setTxForm({ ...txForm, commissionRate: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-400" />
          </div>
        </InlineForm>
      )}

      {/* Inline platform form */}
      {showPlatformForm && (
        <InlineForm title={editingPlatform ? t("edit") : t("add")} onSave={savePlatform} onCancel={() => { setShowPlatformForm(false); setEditingPlatform(null); }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">{t("serviceName")}</label>
              <input placeholder={t("serviceNamePlaceholder")} value={platformForm.name} onChange={(e) => setPlatformForm({ ...platformForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t("openingBalance")}</label>
              <input type="number" placeholder={t("openingBalancePlaceholder")} value={platformForm.balance || ""} onChange={(e) => setPlatformForm({ ...platformForm, balance: +e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t("shopCommissionRate")}</label>
              <input type="number" placeholder="%" value={platformForm.commissionRate || ""} onChange={(e) => setPlatformForm({ ...platformForm, commissionRate: +e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-400" />
            </div>
          </div>
        </InlineForm>
      )}

      {/* Transactions table */}
      <Card className="p-5 print-area">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white">{t("transaction")} ({transactions.length})</h3>
          <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">{t("netCommission")}: {totalCommission.toFixed(2)} {shopConfig.clientShop.currency}</div>
        </div>
        <div className="table-shield">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{t("date")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("platform")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("transactionType")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("amount")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("netCommission")}</th>
                <th className="px-3 py-2 text-end font-medium print-hide">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{formatDate(tx.date || tx.createdAt, lang)}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{tx.platformName}</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400">{typeLabels[tx.type]}</span></td>
                  <td className="px-3 py-2 text-slate-900 dark:text-white font-medium">{tx.amount} {shopConfig.clientShop.currency}</td>
                  <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400">{tx.commission?.toFixed(2)}</td>
                  <td className="px-3 py-2 text-end print-hide">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEditTx(tx)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"><Pencil size={12} /> {t("edit")}</button>
                      <button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteTransaction(tx.id); toast(t("deleteSuccess"), "success"); } }} className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-1"><Trash2 size={12} /> {t("delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <EmptyState message={t("noData")} icon={<Smartphone className="w-10 h-10" />} />}
        </div>
      </Card>
    </div>
  );
}
