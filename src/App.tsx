import { useState } from "react";
import { I18nProvider } from "@/i18n/I18nContext";
import { ThemeProvider } from "@/theme/ThemeContext";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { SyncProvider } from "@/sync/SyncContext";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { LoginScreen } from "@/components/LoginScreen";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { SalesModule } from "@/components/modules/SalesModule";
import { ShortagesModule } from "@/components/modules/ShortagesModule";
import { FinancialModule } from "@/components/modules/FinancialModule";
import { CreditModule } from "@/components/modules/CreditModule";
import { ExpensesModule } from "@/components/modules/ExpensesModule";
import { WasteModule } from "@/components/modules/WasteModule";
import { WholesalersModule } from "@/components/modules/WholesalersModule";
import { WorkforceModule } from "@/components/modules/WorkforceModule";
import { useFirestore } from "@/hooks/useFirestore";
import { useI18n } from "@/i18n/I18nContext";
import { ArrowLeft, Lock, KeyRound } from "lucide-react";

interface ShortageRecord {
  id: string;
  date: string;
  items: { productName: string; quantity: number }[];
  createdAt: unknown;
  [key: string]: unknown;
}

function AppContent() {
  const { accessLevel, login } = useAuth();
  const [view, setView] = useState("dashboard");
  const { items: shortageRecords } = useFirestore<ShortageRecord>("rofof_shortages");

  const allShortageItems = shortageRecords.flatMap((r) => r.items);

  if (!accessLevel) {
    return <LoginScreen />;
  }

  const goDashboard = () => setView("dashboard");
  const isManager = accessLevel === "manager";
  const canAccess = (mod: string) => {
    if (mod === "expenses" || mod === "workforce") return isManager;
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <Header onNavigate={setView} />
      <main>
        {view === "dashboard" && <Dashboard onNavigate={setView} />}
        {view === "sales" && <SalesModule onBack={goDashboard} />}
        {view === "shortages" && <ShortagesModule onBack={goDashboard} />}
        {view === "financial" && <FinancialModule onBack={goDashboard} />}
        {view === "credit" && <CreditModule onBack={goDashboard} />}
        {view === "expenses" && (canAccess("expenses") ? <ExpensesModule onBack={goDashboard} /> : <ManagerGate onBack={goDashboard} onSuccess={() => login("manager", "")} />)}
        {view === "waste" && <WasteModule onBack={goDashboard} />}
        {view === "wholesalers" && <WholesalersModule onBack={goDashboard} shortageItems={allShortageItems} />}
        {view === "workforce" && (canAccess("workforce") ? <WorkforceModule onBack={goDashboard} /> : <ManagerGate onBack={goDashboard} onSuccess={() => login("manager", "")} />)}
      </main>
    </div>
  );
}

function ManagerGate({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const { t } = useI18n();
  const { login } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    if (login("manager", password)) {
      toast(t("saveSuccess"), "success");
      onSuccess();
    } else {
      toast(t("wrongPassword"), "error");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 mb-6">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("backToDashboard")}
      </button>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
          <Lock className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("managerOnly")}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t("managerKey")}</p>
        <div className="space-y-3">
          <div className="relative">
            <KeyRound className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder={t("enterPassword")}
              autoFocus
              className="w-full ps-10 pe-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
            />
          </div>
          <button
            onClick={handleConfirm}
            className="w-full px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-colors"
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <SyncProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </SyncProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
