import { useState } from "react";
import {
  Store, LogOut, Sun, Moon, Languages, Settings, ScanLine,
  Package, ShoppingCart, X, Plus, Minus, Trash2, Check, Lock, Search, Download,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/auth/AuthContext";
import { useSync } from "@/sync/SyncContext";
import { useToast } from "@/components/ui/Toast";
import { InlineForm } from "@/components/ui/Archive";
import { BarcodeScannerButton } from "@/components/ui/BarcodeScanner";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import shopConfig from "@/../shopapp.js";
import { useFirestore } from "@/hooks/useFirestore";

interface InventoryItem {
  id: string;
  name: string;
  barcode: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  threshold: number;
  [key: string]: unknown;
}

interface SaleItem {
  id: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  createdAt: unknown;
  [key: string]: unknown;
}

type HeaderPanel = "pos" | "inventory" | "settings" | null;

export function Header({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { t, lang, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { accessLevel, logout } = useAuth();
  const { autoSync, setAutoSync } = useSync();
  const { canInstall, promptInstall } = usePWAInstall();

  const [panel, setPanel] = useState<HeaderPanel>(null);
  const [syncChallenge, setSyncChallenge] = useState(false);
  const [syncPassword, setSyncPassword] = useState("");
  const { toast } = useToast();

  const handleSyncClick = () => {
    if (!syncChallenge) { setSyncChallenge(true); return; }
  };
  const confirmSyncPassword = () => {
    if (syncPassword === shopConfig.security.managerKey) {
      setAutoSync(!autoSync);
      setSyncChallenge(false);
      setSyncPassword("");
      toast(t("saveSuccess"), "success");
    } else {
      toast(t("wrongPassword"), "error");
      setSyncPassword("");
    }
  };

  const togglePanel = (p: HeaderPanel) => setPanel((cur) => (cur === p ? null : p));

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Brand */}
            <button onClick={() => { onNavigate("dashboard"); setPanel(null); }} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 dark:from-white dark:to-slate-200 flex items-center justify-center">
                <Store className="w-5 h-5 text-white dark:text-slate-900" />
              </div>
              <div className="hidden sm:block text-start">
                <div className="text-base font-bold text-slate-900 dark:text-white leading-none">{shopConfig.appName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{shopConfig.clientShop.name}</div>
              </div>
            </button>

            {/* Center action icons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <HeaderIcon icon={<ScanLine size={18} />} label={t("cashier")} active={panel === "pos"} onClick={() => togglePanel("pos")} gradient="from-emerald-500 to-teal-600" />
              <HeaderIcon icon={<Package size={18} />} label={t("inventory")} active={panel === "inventory"} onClick={() => togglePanel("inventory")} gradient="from-blue-500 to-indigo-600" />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {canInstall && (
                <button onClick={promptInstall} title={t("installApp")} className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 hover:opacity-90 transition-opacity text-sm font-medium">
                  <Download size={16} /><span className="hidden lg:inline">{t("installApp")}</span>
                </button>
              )}
              <button onClick={handleSyncClick} title={autoSync ? t("syncOn") : t("syncOff")} className={`relative p-2 rounded-lg transition-colors ${autoSync ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                <div className={`w-4 h-4 rounded-full border-2 ${autoSync ? "bg-emerald-500 border-emerald-500" : "border-slate-400"}`}>
                  {autoSync && <Check className="w-2.5 h-2.5 text-white m-auto" strokeWidth={4} />}
                </div>
              </button>
              <button onClick={toggleLang} title={t("language")} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"><Languages size={18} /></button>
              <button onClick={toggleTheme} title={t("theme")} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
              <button onClick={() => togglePanel("settings")} title={t("settings")} className={`p-2 rounded-lg transition-colors ${panel === "settings" ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}`}><Settings size={18} /></button>
              <button onClick={logout} title={t("logout")} className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-colors text-sm font-medium">
                <LogOut size={16} /><span className="hidden sm:inline">{t("logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Inline sync password challenge */}
      {syncChallenge && (
        <div className="sticky top-16 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 print:hidden animate-[slideUp_0.15s_ease]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
            <div className="flex items-center gap-2 justify-end">
              <Lock size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">{t("syncProtected")}</span>
              <input
                type="password"
                value={syncPassword}
                autoFocus
                onChange={(e) => setSyncPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmSyncPassword()}
                placeholder={t("enterManagerKey")}
                className="w-40 sm:w-48 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <button onClick={confirmSyncPassword} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-1"><Check size={14} /> {t("confirm")}</button>
              <button onClick={() => { setSyncChallenge(false); setSyncPassword(""); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Inline panels */}
      {panel === "pos" && <POSPanel onClose={() => setPanel(null)} />}
      {panel === "inventory" && <InventoryPanel onClose={() => setPanel(null)} />}
      {panel === "settings" && <SettingsPanel onClose={() => setPanel(null)} />}
    </>
  );
}

function HeaderIcon({ icon, label, onClick, gradient, active }: { icon: React.ReactNode; label: string; onClick: () => void; gradient: string; active?: boolean }) {
  return (
    <button onClick={onClick} title={label} className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg transition-colors group ${active ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>{icon}</div>
      <span className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
    </button>
  );
}

function PanelShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 print:hidden animate-[slideUp_0.2s_ease]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ===== POS Panel =====
function POSPanel({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { autoSync } = useSync();
  const { items: inventory, addItem: addInv, updateItem: updateInv } = useFirestore<InventoryItem>("rofof_inventory");
  const { addItem: addSale } = useFirestore<SaleItem>("rofof_sales");

  const [cart, setCart] = useState<{ id: string; name: string; qty: number; price: number }[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const change = cashReceived ? Math.max(0, parseFloat(cashReceived) - subtotal) : 0;

  const addToCart = (item: InventoryItem) => {
    setCart((c) => {
      const existing = c.find((x) => x.id === item.id);
      if (existing) return c.map((x) => x.id === item.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { id: item.id, name: item.name, qty: 1, price: item.salePrice }];
    });
  };

  const handleBarcode = () => {
    if (!barcodeInput.trim()) return;
    const found = inventory.find((i) => i.barcode === barcodeInput.trim());
    if (found) { addToCart(found); setBarcodeInput(""); }
    else toast(t("noResults"), "error");
  };

  const completeSale = async () => {
    if (cart.length === 0) return;
    await addSale({ items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })), total: subtotal } as Omit<SaleItem, "id">);
    if (autoSync) {
      for (const c of cart) {
        const inv = inventory.find((i) => i.id === c.id);
        if (inv) await updateInv(inv.id, { quantity: Math.max(0, inv.quantity - c.qty) });
      }
    }
    setCart([]); setCashReceived("");
    toast(t("saleCompleted"), "success");
  };

  return (
    <PanelShell title={t("posPointOfSale")} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <ScanLine className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" size={18} />
            <input type="text" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleBarcode()} placeholder={t("enterBarcode")} className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <BarcodeScannerButton onDetected={(code) => { const found = inventory.find((i) => i.barcode === code); if (found) { addToCart(found); toast(t("saveSuccess"), "success"); } else { setBarcodeInput(code); toast(t("noResults"), "error"); } }} />
          <button onClick={handleBarcode} className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium flex items-center gap-1.5"><Plus size={16} />{t("addItem")}</button>
        </div>
        {/* Quick product lookup */}
        <QuickLookup inventory={inventory} onSelect={addToCart} />
        {inventory.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {inventory.slice(0, 10).map((item) => (
              <button key={item.id} onClick={() => addToCart(item)} className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700">{item.name} ({item.salePrice})</button>
            ))}
          </div>
        )}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 flex items-center justify-between">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><ShoppingCart size={16} /> {t("cart")} ({cart.length})</span>
            {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"><Trash2 size={12} /> {t("clearCart")}</button>}
          </div>
          <div className="max-h-48 overflow-y-auto">
            {cart.length === 0 ? <p className="text-center text-sm text-slate-400 py-6">{t("emptyCart")}</p> : (
              <table className="w-full text-sm">
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-200 truncate-cell">{item.name}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setCart((c) => c.map((x) => x.id === item.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="p-0.5 rounded bg-slate-100 dark:bg-slate-700"><Minus size={12} /></button>
                          <span className="w-8 text-center text-slate-900 dark:text-white">{item.qty}</span>
                          <button onClick={() => setCart((c) => c.map((x) => x.id === item.id ? { ...x, qty: x.qty + 1 } : x))} className="p-0.5 rounded bg-slate-100 dark:bg-slate-700"><Plus size={12} /></button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-end text-slate-900 dark:text-white font-medium">{item.price * item.qty} {shopConfig.clientShop.currency}</td>
                      <td className="px-2 py-2"><button onClick={() => setCart((c) => c.filter((x) => x.id !== item.id))} className="text-rose-500"><X size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {cart.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800">
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white"><span>{t("total")}</span><span>{subtotal} {shopConfig.clientShop.currency}</span></div>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t("cashReceived")}</label>
              <input type="number" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t("change")}</label>
              <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold">{change} {shopConfig.clientShop.currency}</div>
            </div>
          </div>
        )}
        <button onClick={completeSale} disabled={cart.length === 0} className="w-full px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"><Check size={18} /> {t("completeSale")}</button>
        {!autoSync && <p className="text-xs text-amber-600 dark:text-amber-400 text-center">{t("syncOff")}</p>}
      </div>
    </PanelShell>
  );
}

// ===== Inventory Panel =====
function InventoryPanel({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { items, addItem, updateItem, deleteItem } = useFirestore<InventoryItem>("rofof_inventory");
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", barcode: "", quantity: 0, purchasePrice: 0, salePrice: 0, threshold: 5 });

  const startEdit = (item: InventoryItem) => { setEditing(item); setForm({ name: item.name, barcode: item.barcode, quantity: item.quantity, purchasePrice: item.purchasePrice, salePrice: item.salePrice, threshold: item.threshold }); setShowForm(true); };
  const resetForm = () => { setEditing(null); setForm({ name: "", barcode: "", quantity: 0, purchasePrice: 0, salePrice: 0, threshold: 5 }); setShowForm(false); };
  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) { await updateItem(editing.id, form); toast(t("saveSuccess"), "success"); }
    else { await addItem(form as Omit<InventoryItem, "id">); toast(t("saveSuccess"), "success"); }
    resetForm();
  };

  return (
    <PanelShell title={t("inventory")} onClose={onClose}>
      <div className="space-y-4">
        {!showForm && <button onClick={() => { setEditing(null); setForm({ name: "", barcode: "", quantity: 0, purchasePrice: 0, salePrice: 0, threshold: 5 }); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-1.5"><Plus size={16} /> {t("addInventoryItem")}</button>}
        {showForm && (
          <InlineForm title={editing ? t("edit") : t("addInventoryItem")} onSave={handleSave} onCancel={resetForm}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <input placeholder={t("name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 col-span-2 sm:col-span-1" />
              <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                <input placeholder={t("barcode")} value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
                <BarcodeScannerButton onDetected={(code) => setForm((f) => ({ ...f, barcode: code }))} />
              </div>
              <input type="number" placeholder={t("quantity")} value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
              <input type="number" placeholder={t("purchasePrice")} value={form.purchasePrice || ""} onChange={(e) => setForm({ ...form, purchasePrice: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
              <input type="number" placeholder={t("salePrice")} value={form.salePrice || ""} onChange={(e) => setForm({ ...form, salePrice: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
              <input type="number" placeholder={t("threshold")} value={form.threshold || ""} onChange={(e) => setForm({ ...form, threshold: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
          </InlineForm>
        )}
        <div className="table-shield border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{t("name")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("barcode")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("quantity")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("purchasePrice")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("salePrice")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("threshold")}</th>
                <th className="px-3 py-2 text-end font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2 text-slate-900 dark:text-white truncate-cell">{item.name}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400 font-mono text-xs">{item.barcode || "—"}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.quantity <= 0 ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400" : item.quantity <= item.threshold ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400" : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"}`}>{item.quantity}</span></td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{item.purchasePrice}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{item.salePrice}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{item.threshold}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(item)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">{t("edit")}</button>
                      <button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteItem(item.id); toast(t("deleteSuccess"), "success"); } }} className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30">{t("delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-center text-sm text-slate-400 py-6">{t("noData")}</p>}
        </div>
      </div>
    </PanelShell>
  );
}

// ===== Settings Panel =====
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { accessLevel } = useAuth();
  const { autoSync, setAutoSync } = useSync();
  const { toast } = useToast();
  const [settingsPw, setSettingsPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const toggleSyncGuarded = () => {
    if (!showPw) { setShowPw(true); return; }
    if (settingsPw === shopConfig.security.managerKey) {
      setAutoSync(!autoSync);
      setShowPw(false); setSettingsPw("");
      toast(t("saveSuccess"), "success");
    } else {
      toast(t("wrongPassword"), "error");
      setSettingsPw("");
    }
  };

  return (
    <PanelShell title={t("settings")} onClose={onClose}>
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{t("autoSync")}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{t("autoSyncDesc")}</div>
            </div>
            <button onClick={toggleSyncGuarded} className={`relative w-12 h-6 rounded-full transition-colors ${autoSync ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoSync ? "translate-x-6 rtl:-translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          {showPw && (
            <div className="flex items-center gap-2 mt-3">
              <Lock size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <input type="password" value={settingsPw} autoFocus onChange={(e) => setSettingsPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && toggleSyncGuarded()} placeholder={t("enterManagerKey")} className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400" />
              <button onClick={toggleSyncGuarded} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-1"><Check size={14} /> {t("confirm")}</button>
              <button onClick={() => { setShowPw(false); setSettingsPw(""); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={16} /></button>
            </div>
          )}
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">{t("appName")}</span><span className="font-medium text-slate-900 dark:text-white">{shopConfig.appName}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">{t("version")}</span><span className="font-medium text-slate-900 dark:text-white">{shopConfig.appVersion}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">{t("accessLevel")}</span><span className="font-medium text-slate-900 dark:text-white">{accessLevel === "manager" ? t("manager") : t("general")}</span></div>
        </div>
      </div>
    </PanelShell>
  );
}

// ===== Quick Product Lookup =====
function QuickLookup({ inventory, onSelect }: { inventory: InventoryItem[]; onSelect: (i: InventoryItem) => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = q.trim() ? inventory.filter((i) => (i.name || "").toLowerCase().includes(q.trim().toLowerCase()) || (i.barcode || "").includes(q.trim())).slice(0, 6) : [];

  return (
    <div className="relative">
      <Search className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" size={16} />
      <input
        type="text"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={t("quickLookup")}
        className="w-full ps-9 pe-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full inset-x-0 mt-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          {results.map((i) => (
            <button key={i.id} onMouseDown={(e) => { e.preventDefault(); onSelect(i); setQ(""); setOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
              <span className="truncate">{i.name}</span>
              <span className="text-xs text-slate-400 flex-shrink-0 ms-2">{Number(i.price) || 0} {shopConfig.clientShop.currency}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
