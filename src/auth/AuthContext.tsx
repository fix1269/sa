import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import shopConfig from "@/../shopapp.js";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export type AccessLevel = "general" | "manager" | null;

interface AuthContextValue {
  accessLevel: AccessLevel;
  login: (level: AccessLevel, password: string) => boolean;
  logout: () => void;
  passwords: { general: string; manager: string };
  updatePassword: (level: "general" | "manager", newPass: string) => void;
  generateRecoveryCode: () => string;
  verifyRecoveryCode: (code: string) => boolean;
  resetPasswordWithCode: (level: "general" | "manager", code: string, newPass: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const [passwords, setPasswords] = useState({
    general: shopConfig.security.generalPassword,
    manager: shopConfig.security.managerKey,
  });
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  // Load passwords from Firebase on mount
  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "rofof_config", "security");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setPasswords({
            general: data.generalPassword ?? shopConfig.security.generalPassword,
            manager: data.managerKey ?? shopConfig.security.managerKey,
          });
        } else {
          // Initialize with defaults
          await setDoc(ref, {
            generalPassword: shopConfig.security.generalPassword,
            managerKey: shopConfig.security.managerKey,
          });
        }
      } catch {
        // Offline or not configured — use defaults
      }
    })();
  }, []);

  const login = (level: AccessLevel, password: string) => {
    if (!level) return false;
    const key = level === "general" ? passwords.general : passwords.manager;
    if (password === key) {
      setAccessLevel(level);
      sessionStorage.setItem("rofof-access", level);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAccessLevel(null);
    sessionStorage.removeItem("rofof-access");
  };

  const updatePassword = async (level: "general" | "manager", newPass: string) => {
    setPasswords((p) => ({ ...p, [level === "general" ? "general" : "manager"]: newPass }));
    try {
      const ref = doc(db, "rofof_config", "security");
      await updateDoc(ref, level === "general" ? { generalPassword: newPass } : { managerKey: newPass });
    } catch {
      // Offline — local only
    }
  };

  const generateRecoveryCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRecoveryCode(code);
    // Store in Firebase for verification
    (async () => {
      try {
        const ref = doc(db, "rofof_config", "recovery");
        await setDoc(ref, { code, createdAt: new Date().toISOString() });
      } catch {
        // Offline
      }
    })();
    return code;
  };

  const verifyRecoveryCode = (code: string) => {
    return recoveryCode !== null && code === recoveryCode;
  };

  const resetPasswordWithCode = (level: "general" | "manager", code: string, newPass: string) => {
    if (!verifyRecoveryCode(code)) return false;
    updatePassword(level, newPass);
    setRecoveryCode(null);
    return true;
  };

  // Restore session
  useEffect(() => {
    const saved = sessionStorage.getItem("rofof-access");
    if (saved === "general" || saved === "manager") setAccessLevel(saved);
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessLevel, login, logout, passwords, updatePassword, generateRecoveryCode, verifyRecoveryCode, resetPasswordWithCode }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
