import { createContext, useContext, useState, ReactNode } from "react";
import shopConfig from "@/../shopapp.js";

interface SyncContextValue {
  autoSync: boolean;
  setAutoSync: (v: boolean) => void;
  toggleSync: () => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [autoSync, setAutoSyncState] = useState<boolean>(() => {
    const saved = localStorage.getItem("rofof-sync");
    return saved === null ? shopConfig.autoSync : saved === "true";
  });

  const setAutoSync = (v: boolean) => {
    setAutoSyncState(v);
    localStorage.setItem("rofof-sync", String(v));
  };

  const toggleSync = () => setAutoSync(!autoSync);

  return (
    <SyncContext.Provider value={{ autoSync, setAutoSync, toggleSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within SyncProvider");
  return ctx;
}
