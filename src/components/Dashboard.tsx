import {
  TrendingUp, AlertTriangle, Smartphone, CreditCard,
  Receipt, Trash2, Truck, Users, ArrowRight,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useSync } from "@/sync/SyncContext";
import shopConfig from "@/../shopapp.js";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

interface ModuleCard {
  id: string;
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  managerOnly?: boolean;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { t } = useI18n();
  const { autoSync } = useSync();

  const modules: ModuleCard[] = [
    {
      id: "sales",
      titleKey: "salesAssistant",
      descKey: "salesAssistantDesc",
      icon: <TrendingUp className="w-7 h-7 text-white" />,
      gradient: "from-emerald-500 to-green-600",
      glow: "glow-green",
    },
    {
      id: "shortages",
      titleKey: "shortagesRecorder",
      descKey: "shortagesDesc",
      icon: <AlertTriangle className="w-7 h-7 text-white" />,
      gradient: "from-orange-500 to-amber-600",
      glow: "glow-orange",
    },
    {
      id: "financial",
      titleKey: "financialServices",
      descKey: "financialServicesDesc",
      icon: <Smartphone className="w-7 h-7 text-white" />,
      gradient: "from-cyan-500 to-blue-600",
      glow: "glow-cyan",
    },
    {
      id: "credit",
      titleKey: "creditDebt",
      descKey: "creditDebtDesc",
      icon: <CreditCard className="w-7 h-7 text-white" />,
      gradient: "from-purple-500 to-indigo-600",
      glow: "glow-purple",
    },
    {
      id: "expenses",
      titleKey: "expensesTracker",
      descKey: "expensesDesc",
      icon: <Receipt className="w-7 h-7 text-white" />,
      gradient: "from-rose-500 to-red-600",
      glow: "glow-red",
      managerOnly: true,
    },
    {
      id: "waste",
      titleKey: "wasteLog",
      descKey: "wasteDesc",
      icon: <Trash2 className="w-7 h-7 text-white" />,
      gradient: "from-slate-600 to-rose-700",
      glow: "glow-slate",
    },
    {
      id: "wholesalers",
      titleKey: "wholesalers",
      descKey: "wholesalersDesc",
      icon: <Truck className="w-7 h-7 text-white" />,
      gradient: "from-teal-500 to-blue-600",
      glow: "glow-teal",
    },
    {
      id: "workforce",
      titleKey: "workforce",
      descKey: "workforceDesc",
      icon: <Users className="w-7 h-7 text-white" />,
      gradient: "from-violet-500 to-fuchsia-600",
      glow: "glow-violet",
      managerOnly: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Welcome header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t("dashboard")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {shopConfig.clientShop.name} — {shopConfig.clientShop.type}
        </p>
        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          autoSync
            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
            : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
        }`}>
          <span className={`w-2 h-2 rounded-full ${autoSync ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
          {autoSync ? t("syncOn") : t("syncOff")}
        </div>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => onNavigate(mod.id)}
            className="group relative text-start bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-transparent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl print-area"
          >
            {/* Glow on hover */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${mod.glow}`} />

            <div className="relative">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {mod.icon}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 leading-tight">
                {t(mod.titleKey)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                {t(mod.descKey)}
              </p>
              <div className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                <span>{t("viewDetails")}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </div>
              {mod.managerOnly && (
                <span className="absolute top-4 end-4 text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                  {t("manager")}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Credit footer */}
      <div id="rofof-credit" className="mt-10 text-center text-xs text-slate-400 dark:text-slate-600">
        {shopConfig.appName} — v{shopConfig.appVersion} — {shopConfig.developer.copyright}
      </div>
    </div>
  );
}
