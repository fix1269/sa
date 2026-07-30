import { useState } from "react";
import { Users, ArrowLeft, Plus, Trash2, LogIn, LogOut, Wallet, Calendar, Clock, Pencil } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/components/ui/Toast";
import { useSync } from "@/sync/SyncContext";
import { Card, PageHeader, Breadcrumbs, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PrintShareButton } from "@/components/ui/PrintShare";
import { InlineForm } from "@/components/ui/Archive";
import { useFirestore, formatDate, formatTime } from "@/hooks/useFirestore";
import shopConfig from "@/../shopapp.js";

interface Employee {
  id: string;
  name: string;
  mobile: string;
  position: string;
  salaryType: "fixedMonthly" | "shiftBased";
  baseSalary: number;
  shiftRate: number;
  createdAt: unknown;
  [key: string]: unknown;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  date: string;
  createdAt: unknown;
  [key: string]: unknown;
}

interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  paymentOrigin: string;
  date: string;
  notes: string;
  createdAt: unknown;
  [key: string]: unknown;
}

export function WorkforceModule({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { autoSync } = useSync();
  const { items: employees, addItem: addEmployee, updateItem: updateEmployee, deleteItem: deleteEmployee } = useFirestore<Employee>("rofof_employees");
  const { items: attendance, addItem: addAttendance, updateItem: updateAttendance, deleteItem: deleteAttendance } = useFirestore<AttendanceRecord>("rofof_attendance");
  const { addItem: addExpense } = useFirestore<ExpenseRecord>("rofof_expenses");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<{ name: string; mobile: string; position: string; salaryType: "fixedMonthly" | "shiftBased"; baseSalary: number; shiftRate: number }>({ name: "", mobile: "", position: "", salaryType: "fixedMonthly", baseSalary: 0, shiftRate: 0 });

  const saveEmployee = async () => {
    if (!form.name.trim()) return;
    if (editing) { await updateEmployee(editing.id, form); setEditing(null); }
    else { await addEmployee({ ...form, createdAt: new Date().toISOString() } as Omit<Employee, "id">); }
    setForm({ name: "", mobile: "", position: "", salaryType: "fixedMonthly", baseSalary: 0, shiftRate: 0 });
    setShowForm(false);
    toast(t("saveSuccess"), "success");
  };

  const startEdit = (emp: Employee) => { setEditing(emp); setForm({ name: emp.name, mobile: emp.mobile, position: emp.position, salaryType: emp.salaryType, baseSalary: emp.baseSalary, shiftRate: emp.shiftRate }); setShowForm(true); };

  const clockIn = async (emp: Employee) => {
    const now = new Date().toISOString();
    await addAttendance({ employeeId: emp.id, employeeName: emp.name, clockIn: now, clockOut: "", hours: 0, date: new Date().toISOString().split("T")[0], createdAt: now } as Omit<AttendanceRecord, "id">);
    toast(t("clockIn"), "success");
  };

  const clockOut = async (emp: Employee) => {
    const open = attendance.find((a) => a.employeeId === emp.id && !a.clockOut);
    if (!open) return;
    const out = new Date();
    const inTime = new Date(open.clockIn);
    const hours = Math.round(((out.getTime() - inTime.getTime()) / (1000 * 60 * 60)) * 100) / 100;
    await updateAttendance(open.id, { clockOut: out.toISOString(), hours });
    toast(t("clockOut"), "success");
  };

  const paySalary = async (emp: Employee) => {
    const empAttendance = attendance.filter((a) => a.employeeId === emp.id);
    let net = emp.salaryType === "fixedMonthly" ? emp.baseSalary : empAttendance.reduce((s, a) => s + a.hours * emp.shiftRate, 0);
    if (autoSync) {
      await addExpense({ category: "salaries", amount: net, paymentOrigin: "cashDrawer", date: new Date().toISOString().split("T")[0], notes: `${t("paySalary")}: ${emp.name}`, createdAt: new Date().toISOString() } as Omit<ExpenseRecord, "id">);
    }
    toast(`${t("salaryPaid")}: ${net} ${shopConfig.clientShop.currency}`, "success");
  };

  const isClockedIn = (empId: string) => attendance.some((a) => a.employeeId === empId && !a.clockOut);
  const shareContent = `${t("workforce")}:\n${employees.map((e) => `${e.name} — ${e.position} (${t(e.salaryType)})`).join("\n")}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title={t("workforce")}
        description={t("workforceDesc")}
        icon={<Users className="w-6 h-6 text-fuchsia-600" />}
        breadcrumbs={<Breadcrumbs items={[{ label: t("dashboard"), onClick: onBack }, { label: t("workforce") }]} />}
        actions={<><Button onClick={onBack} variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("backToDashboard")}</Button><Button onClick={() => { setEditing(null); setForm({ name: "", mobile: "", position: "", salaryType: "fixedMonthly", baseSalary: 0, shiftRate: 0 }); setShowForm(true); }} size="sm" className="bg-fuchsia-600 hover:bg-fuchsia-700"><Plus size={14} /> {t("addEmployee")}</Button><PrintShareButton title={t("workforce")} content={shareContent} /></>}
      />

      {/* Inline employee form */}
      {showForm && (
        <InlineForm title={editing ? t("edit") : t("addEmployee")} onSave={saveEmployee} onCancel={() => { setShowForm(false); setEditing(null); }}>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder={t("employeeName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-400 col-span-2" />
            <input placeholder={t("employeeMobile")} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-400" />
            <input placeholder={t("position")} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-400" />
            <select value={form.salaryType} onChange={(e) => setForm({ ...form, salaryType: e.target.value as "fixedMonthly" | "shiftBased" })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-400">
              <option value="fixedMonthly">{t("fixedMonthly")}</option>
              <option value="shiftBased">{t("shiftBased")}</option>
            </select>
            {form.salaryType === "fixedMonthly" ? <input type="number" placeholder={t("baseSalary")} value={form.baseSalary || ""} onChange={(e) => setForm({ ...form, baseSalary: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-400" /> : <input type="number" placeholder={t("shiftRate")} value={form.shiftRate || ""} onChange={(e) => setForm({ ...form, shiftRate: +e.target.value })} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-400" />}
          </div>
        </InlineForm>
      )}

      {/* Employee cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {employees.map((emp) => (
          <Card key={emp.id} className="p-4 print-area">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold">{emp.name.charAt(0)}</div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                  <div className="text-xs text-slate-500">{emp.position}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(emp)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Pencil size={14} /></button>
                <button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteEmployee(emp.id); toast(t("deleteSuccess"), "success"); } }} className="text-rose-400 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">{emp.mobile}</div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400">{t(emp.salaryType)}</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{emp.salaryType === "fixedMonthly" ? emp.baseSalary : `${emp.shiftRate}/${t("shiftHours")}`} {shopConfig.clientShop.currency}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 print-hide">
              <button onClick={() => clockIn(emp)} disabled={isClockedIn(emp.id)} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-40"><LogIn size={12} /> {t("clockIn")}</button>
              <button onClick={() => clockOut(emp)} disabled={!isClockedIn(emp.id)} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-40"><LogOut size={12} /> {t("clockOut")}</button>
              <button onClick={() => paySalary(emp)} className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-medium hover:bg-violet-100 dark:hover:bg-violet-900/50"><Wallet size={12} /> {t("paySalary")}</button>
            </div>
          </Card>
        ))}
        {employees.length === 0 && !showForm && <div className="col-span-full"><EmptyState message={t("noEmployees")} icon={<Users className="w-10 h-10" />} /></div>}
      </div>

      {/* Attendance log */}
      <Card className="p-5 print-area">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-fuchsia-500" /> {t("attendanceLog")} ({attendance.length})</h3>
        <div className="table-shield">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{t("employee")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("date")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("clockInTime")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("clockOutTime")}</th>
                <th className="px-3 py-2 text-start font-medium">{t("hoursWorked")}</th>
                <th className="px-3 py-2 text-end font-medium print-hide">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2 text-slate-900 dark:text-white font-medium">{a.employeeName}</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{formatDate(a.date || a.createdAt, lang)}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{formatTime(a.clockIn, lang)}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{a.clockOut ? formatTime(a.clockOut, lang) : "—"}</td>
                  <td className="px-3 py-2 text-fuchsia-600 dark:text-fuchsia-400 font-medium">{a.hours || "—"}</td>
                  <td className="px-3 py-2 text-end print-hide"><button onClick={async () => { if (confirm(t("confirmDelete"))) { await deleteAttendance(a.id); toast(t("deleteSuccess"), "success"); } }} className="text-rose-500 text-xs hover:text-rose-600">{t("delete")}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length === 0 && <EmptyState message={t("noData")} icon={<Clock className="w-10 h-10" />} />}
        </div>
      </Card>
    </div>
  );
}
