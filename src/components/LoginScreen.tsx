import { useState } from "react";
import { Lock, Shield, KeyRound, Mail, ArrowRight, Eye, EyeOff, Store } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useTheme } from "@/theme/ThemeContext";
import { useAuth, AccessLevel } from "@/auth/AuthContext";
import shopConfig from "@/../shopapp.js";

export function LoginScreen() {
  const { t, lang, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { login, generateRecoveryCode, verifyRecoveryCode, resetPasswordWithCode } = useAuth();

  const [accessLevel, setAccessLevel] = useState<AccessLevel>("general");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Inline recovery state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"request" | "verify" | "success">("request");
  const [generatedCode, setGeneratedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [resetLevel, setResetLevel] = useState<"general" | "manager">("general");
  const [recoveryMsg, setRecoveryMsg] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessLevel) return;
    if (login(accessLevel, password)) { setError(""); }
    else { setError(t("wrongPassword")); }
  };

  const handleRequestRecovery = () => {
    const code = generateRecoveryCode();
    setGeneratedCode(code);
    setRecoveryStep("verify");
    setRecoveryMsg(t("recoveryCodeSent"));
  };

  const handleResetPassword = () => {
    if (!enteredCode || !newPass) { setRecoveryMsg(t("invalidRecoveryCode")); return; }
    if (resetPasswordWithCode(resetLevel, enteredCode, newPass)) {
      setRecoveryStep("success");
      setRecoveryMsg(t("passwordReset"));
      setTimeout(() => { setShowRecovery(false); setRecoveryStep("request"); setEnteredCode(""); setNewPass(""); setPassword(""); }, 1500);
    } else {
      setRecoveryMsg(t("invalidRecoveryCode"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <button onClick={toggleLang} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors">{lang === "en" ? "العربية" : "English"}</button>
        <button onClick={toggleTheme} className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors">{theme === "light" ? "🌙" : "☀️"}</button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 dark:from-white dark:to-slate-200 mb-4 shadow-xl">
            <Store className="w-10 h-10 text-white dark:text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{shopConfig.appName}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{t("appDescription")}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          {!showRecovery ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t("secureLogin")}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button onClick={() => setAccessLevel("general")} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${accessLevel === "general" ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  <Lock className="w-4 h-4 text-slate-500" />
                  <div className="text-start"><div className="text-sm font-semibold text-slate-900 dark:text-white">{t("general")}</div><div className="text-xs text-slate-500">{t("generalPassword")}</div></div>
                </button>
                <button onClick={() => setAccessLevel("manager")} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${accessLevel === "manager" ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  <div className="text-start"><div className="text-sm font-semibold text-slate-900 dark:text-white">{t("manager")}</div><div className="text-xs text-slate-500">{t("managerKey")}</div></div>
                </button>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t("enterPassword")}</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 pe-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 text-base" placeholder="••••••" autoFocus />
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                  {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
                </div>
                <button type="submit" className="w-full px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">{t("proceed")}<ArrowRight className="w-4 h-4 rtl:rotate-180" /></button>
              </form>
              <button onClick={() => { setShowRecovery(true); setRecoveryStep("request"); setRecoveryMsg(""); }} className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-1.5"><Mail size={14} />{t("forgotPassword")}</button>
            </>
          ) : (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease]">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("resetPassword")}</h3>
              </div>

              {recoveryStep === "request" && (
                <>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{t("recoveryCodeSent")}</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t("accessLevel")}</label>
                    <select value={resetLevel} onChange={(e) => setResetLevel(e.target.value as "general" | "manager")} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400">
                      <option value="general">{t("generalPassword")}</option>
                      <option value="manager">{t("managerKey")}</option>
                    </select>
                  </div>
                  <button onClick={handleRequestRecovery} className="w-full px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-sm">{t("sendRecoveryCode")}</button>
                </>
              )}

              {recoveryStep === "verify" && (
                <>
                  {recoveryMsg && <p className="text-sm text-rose-500">{recoveryMsg}</p>}
                  <p className="text-sm text-slate-600 dark:text-slate-300">{t("recoveryCodeSent")}</p>
                  {generatedCode && <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-center">Demo code: <span className="font-mono font-bold">{generatedCode}</span></div>}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t("recoveryCode")}</label>
                    <input type="text" value={enteredCode} onChange={(e) => setEnteredCode(e.target.value)} maxLength={6} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 text-center text-2xl tracking-widest font-mono" placeholder="000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t("newPassword")}</label>
                    <input type="text" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400" />
                  </div>
                  <button onClick={handleResetPassword} className="w-full px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-sm">{t("confirmReset")}</button>
                </>
              )}

              {recoveryStep === "success" && (
                <div className="text-center py-4">
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">{t("passwordReset")}</p>
                </div>
              )}

              <button onClick={() => { setShowRecovery(false); setRecoveryStep("request"); setEnteredCode(""); setNewPass(""); setRecoveryMsg(""); }} className="w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">{t("backToDashboard")}</button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">{shopConfig.developer.copyright}</p>
      </div>
    </div>
  );
}
