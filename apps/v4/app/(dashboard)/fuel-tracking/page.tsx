"use client"


import * as React from "react"
import {
  Search, Download, Plus, RefreshCw, X, Loader2,
  AlertCircle, Trash2, Upload, CheckCircle2, XCircle, FileText,
  Filter, Pencil,
} from "lucide-react"
import { useLang } from "@/components/lang-context"
import { useConfirm } from "@/components/confirm-dialog"
import {
  listFuelExpenses, createFuelExpense, updateFuelExpense,
  deleteFuelExpense, bulkDeleteFuelExpenses, exportFuelExpenses,
  uploadFuelFile, importFuelExcel, getFuelImportLogs,
  FUEL_PAYMENT_METHODS, FUEL_STATUSES, FUEL_METRIC_UNITS,
  type FuelExpense, type CreateFuelExpensePayload,
} from "@/lib/fuel-expenses-api"
import { listVehicles, type Vehicle } from "@/lib/vehicles-api"
import { listDrivers, type Driver } from "@/lib/drivers-api"

import { AgGridReact } from "ag-grid-react"
import {
  type ColDef, type ICellRendererParams,
  ModuleRegistry, AllCommunityModule, themeQuartz,
} from "ag-grid-community"
ModuleRegistry.registerModules([AllCommunityModule])

const _baseParams = {
  fontFamily: "var(--font-sans, 'Montserrat', 'Inter', system-ui, sans-serif)",
  fontSize: 13, rowHeight: 39, headerHeight: 38,
  backgroundColor: "var(--background, #ffffff)", foregroundColor: "var(--foreground, #1a1a1a)",
  headerBackgroundColor: "var(--muted, #f5f5f5)", headerTextColor: "var(--muted-foreground, #666666)",
  borderColor: "var(--border, #e5e7eb)", rowBorder: false, wrapperBorder: false,
  headerRowBorder: false, columnBorder: false,
  cellHorizontalPaddingScale: 1.1, rowVerticalPaddingScale: 1,
  selectedRowBackgroundColor: "var(--accent, #f0f0f0)", gridSize: 5, scrollbarWidth: 6,
}
const ftLightTheme = themeQuartz.withParams({ ..._baseParams, backgroundColor: "#ffffff", foregroundColor: "#1f2933", headerBackgroundColor: "#f9fafb", headerTextColor: "#39485d", borderColor: "#eff0f1", rowHoverColor: "#f5f7fb", selectedRowBackgroundColor: "#edf2ff" })
const ftDarkTheme  = themeQuartz.withParams({ ..._baseParams, backgroundColor: "#141414", foregroundColor: "#e5e5e5", headerBackgroundColor: "#1e2531", headerTextColor: "#c9d0da",  borderColor: "#2a2a2a",  rowHoverColor: "#1f2937", selectedRowBackgroundColor: "#1e3a5f" })

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso?: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
    + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700",
  approved: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700",
  rejected: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-700",
}

const STATUS_DOT: Record<string, string> = {
  pending:  "bg-amber-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
}

// ─── Add/Edit Slide-Over ──────────────────────────────────────────────────────

const EMPTY_FORM: CreateFuelExpensePayload = {
  driver_uuid: "", vehicle_uuid: "", reported_by_uuid: "me",
  status: "pending", amount: 0, currency: "GBP", payment_method: "Card",
  metric_unit: "L",
}

function ExpenseSlideOver({
  record, vehicles, drivers, onClose, onSaved,
}: {
  record: FuelExpense | null
  vehicles: Vehicle[]
  drivers: Driver[]
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useLang()
  const c = t.common
  const isEdit = !!record
  const [form, setForm] = React.useState<CreateFuelExpensePayload>(
    record
      ? {
          driver_uuid: record.driver?.uuid ?? record.driver_uuid ?? "",
          vehicle_uuid: record.vehicle?.uuid ?? record.vehicle_uuid ?? "",
          reported_by_uuid: record.reported_by_uuid ?? "me",
          status: record.status,
          amount: record.amount,
          currency: record.currency,
          payment_method: record.payment_method,
          card_type: record.card_type ?? "",
          amount_incl_tax: record.amount_incl_tax ?? undefined,
          volume: record.volume ?? "",
          metric_unit: record.metric_unit ?? "L",
          odometer: record.odometer ?? "",
          report: record.report ?? "",
          vr_id: record.vr_id ?? "",
          trip_id: record.trip_id ?? "",
          crossing_date: record.crossing_date ? record.crossing_date.slice(0, 16) : "",
        }
      : { ...EMPTY_FORM }
  )
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  const set = <K extends keyof CreateFuelExpensePayload>(k: K, v: CreateFuelExpensePayload[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setError("")
    setSaving(true)
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        amount_incl_tax: form.amount_incl_tax ? Number(form.amount_incl_tax) : undefined,
        crossing_date: form.crossing_date ? new Date(form.crossing_date).toISOString() : undefined,
      }
      if (isEdit && record) {
        await updateFuelExpense(record.uuid, payload)
      } else {
        await createFuelExpense(payload)
      }
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )

  const input = "h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
  const select = "h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-bold">{isEdit ? "Edit Fuel Expense" : "Add Fuel Expense"}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isEdit ? `Editing ${record?.public_id}` : "Create a new fuel expense record"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 px-3 py-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Driver *">
              <select value={form.driver_uuid} onChange={e => set("driver_uuid", e.target.value)} className={select}>
                <option value="">Select driver…</option>
                {drivers.map(d => <option key={d.uuid} value={d.uuid}>{d.name}</option>)}
              </select>
            </Field>
            <Field label="Vehicle *">
              <select value={form.vehicle_uuid} onChange={e => set("vehicle_uuid", e.target.value)} className={select}>
                <option value="">Select vehicle…</option>
                {vehicles.map(v => <option key={v.uuid} value={v.uuid}>{v.plate_number}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (excl. VAT) *">
              <input type="number" step="0.01" min="0" value={form.amount} onChange={e => set("amount", e.target.value as unknown as number)} className={input} />
            </Field>
            <Field label="Amount (incl. VAT)">
              <input type="number" step="0.01" min="0" value={form.amount_incl_tax ?? ""} onChange={e => set("amount_incl_tax", e.target.value ? Number(e.target.value) : undefined)} className={input} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Currency *">
              <input value={form.currency} onChange={e => set("currency", e.target.value)} className={input} placeholder="GBP" />
            </Field>
            <Field label="Status *">
              <select value={form.status} onChange={e => set("status", e.target.value as "pending" | "approved" | "rejected")} className={select}>
                {FUEL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Payment Method *">
              <select value={form.payment_method} onChange={e => set("payment_method", e.target.value as "Card" | "Other")} className={select}>
                {FUEL_PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Card Type">
              <input value={form.card_type ?? ""} onChange={e => set("card_type", e.target.value)} className={input} placeholder="Visa, Mastercard…" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Volume">
              <input value={form.volume ?? ""} onChange={e => set("volume", e.target.value)} className={input} placeholder="75.5" />
            </Field>
            <Field label="Unit">
              <select value={form.metric_unit ?? "L"} onChange={e => set("metric_unit", e.target.value)} className={select}>
                {FUEL_METRIC_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Odometer">
              <input value={form.odometer ?? ""} onChange={e => set("odometer", e.target.value)} className={input} placeholder="45200" />
            </Field>
            <Field label="Date / Time">
              <input type="datetime-local" value={form.crossing_date ?? ""} onChange={e => set("crossing_date", e.target.value)} className={input} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="VRID">
              <input value={form.vr_id ?? ""} onChange={e => set("vr_id", e.target.value)} className={input} />
            </Field>
            <Field label="Trip ID">
              <input value={form.trip_id ?? ""} onChange={e => set("trip_id", e.target.value)} className={input} />
            </Field>
          </div>

          <Field label="Notes">
            <textarea value={form.report ?? ""} onChange={e => set("report", e.target.value)} className="h-16 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Fuel fill-up at Shell M25…" />
          </Field>
        </div>

        <div className="flex gap-2 border-t p-4">
          <button onClick={onClose} className="flex-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">{c.cancel}</button>
          <button onClick={handleSave} disabled={saving || !form.driver_uuid || !form.vehicle_uuid}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? c.saving : isEdit ? c.save : c.createRecord}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Import Wizard ────────────────────────────────────────────────────────────

type ImportStep = "upload" | "uploading" | "importing" | "done" | "error"

function ImportWizard({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [step, setStep] = React.useState<ImportStep>("upload")
  const [file, setFile] = React.useState<File | null>(null)
  const [result, setResult] = React.useState<Awaited<ReturnType<typeof importFuelExcel>> | null>(null)
  const [errMsg, setErrMsg] = React.useState("")
  const fileRef = React.useRef<HTMLInputElement>(null)

  const runImport = async () => {
    if (!file) return
    try {
      setStep("uploading")
      const uploaded = await uploadFuelFile(file)
      setStep("importing")
      const res = await importFuelExcel([uploaded.uuid])
      setResult(res)
      setStep("done")
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : "Import failed")
      setStep("error")
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={step === "upload" ? onClose : undefined} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-bold">Import Fuel Expenses</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Upload a CSV or Excel file to bulk-import fuel expenses</p>
          </div>
          <button onClick={onClose} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
          {step === "upload" && (
            <>
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accepted columns</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {[["VRID","vr_id"],["Date/Time","crossing_date"],["Vehicle","vehicle / reg"],["Driver","driver_name"],["Amount","net / amount"],["Incl. VAT","gross / amount_incl_tax"],["Volume","volume / quantity"],["Unit","metric_unit"],["Currency","currency"],["Odometer","odometer"],["Report","report / info"]].map(([col, hint]) => (
                    <div key={col}><span className="font-mono font-medium">{col}</span><span className="ml-1 text-muted-foreground">{hint}</span></div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">Max 2000 rows per import.</p>
              </div>
              <div onClick={() => fileRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 py-10 transition-colors hover:border-primary/40 hover:bg-muted/20">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">{file ? file.name : "Click to select file"}</p>
                  <p className="text-xs text-muted-foreground">.xlsx, .xls, .csv accepted</p>
                </div>
                {file && <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Ready to import</span>}
              </div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </>
          )}

          {(step === "uploading" || step === "importing") && (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-medium">{step === "uploading" ? "Step 1 / 2 — Uploading file…" : "Step 2 / 2 — Importing records…"}</p>
            </div>
          )}

          {step === "done" && result && (
            <div className="flex flex-col gap-4">
              <div className={`flex items-center gap-3 rounded-xl p-4 ${result.success || result.partial_success ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
                {result.success || result.partial_success
                  ? <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                  : <XCircle className="h-6 w-6 text-red-500 shrink-0" />}
                <div>
                  <p className={`font-medium ${result.success || result.partial_success ? "text-green-800 dark:text-green-300" : "text-red-700 dark:text-red-400"}`}>
                    {result.success ? "Import complete" : result.partial_success ? "Partial import" : "Import failed"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{result.message}</p>
                </div>
              </div>
              {((result.errors?.length ?? 0) > 0 || (result.total_errors ?? 0) > 0) && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      {result.errors?.length ?? result.total_errors ?? 0} rows had errors
                    </p>
                    {result.error_log_url && (
                      <a
                        href={result.error_log_url}
                        className="inline-flex items-center gap-1 rounded-md border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FileText className="h-3 w-3" /> Download error log
                      </a>
                    )}
                  </div>
                  {(result.errors?.length ?? 0) > 0 && (
                    <div className="max-h-40 space-y-1 overflow-y-auto">
                      {result.errors!.map((e, i) => (
                        <p key={i} className="text-xs text-amber-600 dark:text-amber-400">
                          Row {e[0]}{e[1] ? ` [${e[1]}]` : ""}: {e[2]}
                        </p>
                      ))}
                    </div>
                  )}
                  {!result.errors?.length && (result.total_errors ?? 0) > 0 && !result.error_log_url && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Error details were not returned by the API. Check your file and retry.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === "error" && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 p-4">
              <XCircle className="h-6 w-6 text-red-500 shrink-0" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Import failed</p>
                <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errMsg}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t p-4">
          {step === "upload" && (
            <>
              <button onClick={onClose} className="flex-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={runImport} disabled={!file} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Start Import</button>
            </>
          )}
          {step === "done" && (
            <button onClick={() => { onDone(); onClose() }} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Done — Refresh List</button>
          )}
          {step === "error" && (
            <>
              <button onClick={() => setStep("upload")} className="flex-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Try Again</button>
              <button onClick={onClose} className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted">Close</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

type Filters = { vehicle: string; status: string; payment_method: string; from_date: string; to_date: string }
const EMPTY_FILTERS: Filters = { vehicle: "", status: "", payment_method: "", from_date: "", to_date: "" }

function FilterPanel({ open, onClose, filters, setFilters, vehicles }: {
  open: boolean; onClose: () => void
  filters: Filters; setFilters: (f: Filters) => void
  vehicles: Vehicle[]
}) {
  const [local, setLocal] = React.useState<Filters>(filters)
  const set = <K extends keyof Filters>(k: K, v: string) => setLocal(f => ({ ...f, [k]: v }))
  React.useEffect(() => { setLocal(filters) }, [filters])
  const active = Object.values(filters).filter(Boolean).length

  if (!open) return null
  const sel = "h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-bold">Filter Expenses</h2>
          <button onClick={onClose} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Vehicle</label>
            <select value={local.vehicle} onChange={e => set("vehicle", e.target.value)} className={sel}>
              <option value="">Any vehicle</option>
              {vehicles.map(v => <option key={v.uuid} value={v.uuid}>{v.plate_number}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
            <select value={local.status} onChange={e => set("status", e.target.value)} className={sel}>
              <option value="">Any status</option>
              {FUEL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Payment Method</label>
            <select value={local.payment_method} onChange={e => set("payment_method", e.target.value)} className={sel}>
              <option value="">Any method</option>
              {FUEL_PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date from</label>
            <input type="date" value={local.from_date} onChange={e => set("from_date", e.target.value)} className={sel} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date to</label>
            <input type="date" value={local.to_date} onChange={e => set("to_date", e.target.value)} className={sel} />
          </div>
        </div>
        <div className="flex gap-2 border-t p-4">
          <button onClick={() => { setLocal(EMPTY_FILTERS); setFilters(EMPTY_FILTERS) }} className="flex-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Clear all</button>
          <button onClick={() => { setFilters(local); onClose() }} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Apply{active > 0 ? ` (${active})` : ""}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FuelTrackingPage() {
  const { t } = useLang()
  const confirm = useConfirm()
  const c = t.common
  const f = t.fuelTracking

  // Data state
  const [records, setRecords] = React.useState<FuelExpense[]>([])
  const [meta, setMeta] = React.useState({ total: 0, last_page: 1, current_page: 1 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  // UI state
  const [search, setSearch] = React.useState("")
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS)
  const [page, setPage] = React.useState(1)
  const [slideOver, setSlideOver] = React.useState<FuelExpense | null | "new">(null)
  const [showImport, setShowImport] = React.useState(false)
  const [showFilter, setShowFilter] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(false)
  const [showCards, setShowCards] = React.useState(false)
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)

  // isDark
  const [isDark, setIsDark] = React.useState(false)
  React.useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"))
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  const gridRef = React.useRef<AgGridReact<FuelExpense>>(null)

  // Reference data
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [drivers, setDrivers] = React.useState<Driver[]>([])

  // Debounced search
  const searchRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  React.useEffect(() => {
    clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(searchRef.current)
  }, [search])

  const fetchData = React.useCallback(async (p = page) => {
    setLoading(true)
    setError("")
    try {
      const res = await listFuelExpenses({
        page: p, limit: 15,
        query: debouncedSearch || undefined,
        vehicle: filters.vehicle || undefined,
        status: filters.status || undefined,
        payment_method: filters.payment_method || undefined,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
      })
      const raw = res as unknown as Record<string, unknown>
      const rows = (raw.fuel_expenses ?? raw.data ?? []) as FuelExpense[]
      setRecords(rows)
      const m = res.meta ?? { total: 0, last_page: 1, current_page: 1 }
      setMeta({ total: m.total, last_page: m.last_page, current_page: m.current_page })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters])

  // Load reference data once
  React.useEffect(() => {
    listVehicles({ limit: 999 }).then(r => setVehicles(r.vehicles)).catch(() => {})
    listDrivers({ limit: 999 }).then(r => setDrivers(r.drivers ?? [])).catch(() => {})
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { setPage(1); fetchData(1) }, [debouncedSearch, filters])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { fetchData(page) }, [page])

  const handleDelete = async (uuid: string) => {
    const ok = await confirm({
      title: "Delete fuel expense",
      description: "This will permanently remove the fuel expense record.",
    })
    if (!ok) return
    try { await deleteFuelExpense(uuid); fetchData(page) }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Delete failed") }
  }

  const handleBulkDelete = async () => {
    const selected = gridRef.current?.api?.getSelectedRows() ?? []
    if (!selected.length) return
    const ok = await confirm({
      title: `Delete ${selected.length} record${selected.length !== 1 ? "s" : ""}`,
      description: "This action is permanent and cannot be undone.",
    })
    if (!ok) return
    try {
      await bulkDeleteFuelExpenses(selected.map(r => r.uuid))
      fetchData(page)
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Delete failed") }
  }

  const handleRefresh = async () => { setRefreshing(true); await fetchData(page); setRefreshing(false) }

  const handleExport = async () => {
    setExporting(true)
    try { await exportFuelExpenses({ format: "xlsx", from_date: filters.from_date || undefined, to_date: filters.to_date || undefined }) }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Export failed") }
    finally { setExporting(false) }
  }

  // Stable action ref — avoids re-creating colDefs on every state change
  const actionsRef = React.useRef({ onEdit: (r: FuelExpense) => setSlideOver(r), onDelete: handleDelete })
  React.useEffect(() => { actionsRef.current = { onEdit: (r: FuelExpense) => setSlideOver(r), onDelete: handleDelete } })

  // Status badge
  const STATUS_GRID: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    pending:  { bg: "bg-amber-50 dark:bg-amber-900/20",   border: "border-amber-300/70",   text: "text-amber-800 dark:text-amber-300",   dot: "bg-amber-500" },
    approved: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-300/70", text: "text-emerald-800 dark:text-emerald-300", dot: "bg-emerald-500" },
    rejected: { bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-300/70",       text: "text-red-700 dark:text-red-400",       dot: "bg-red-500" },
  }

  // Column defs
  const colDefs = React.useMemo<ColDef<FuelExpense>[]>(() => [
    {
      colId: "_edit", headerName: "", width: 40, minWidth: 40, maxWidth: 40,
      sortable: false, filter: false, resizable: false, pinned: "left" as const, suppressMovable: true,
      cellRenderer: ({ data }: ICellRendererParams<FuelExpense>) => data ? (
        <button onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); actionsRef.current.onEdit(data) }}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
          </svg>
        </button>
      ) : null,
    },
    { headerName: "Driver",     valueGetter: ({ data }) => data?.driver?.name ?? data?.driver_name ?? "",         filter: "agTextColumnFilter", flex: 1.2, minWidth: 140, cellRenderer: ({ value }: ICellRendererParams) => <span className="font-medium">{value || <span className="text-muted-foreground">—</span>}</span> },
    { headerName: "Vehicle",    valueGetter: ({ data }) => data?.vehicle?.plate_number ?? data?.vehicle_name ?? "", filter: "agTextColumnFilter", width: 130, cellRenderer: ({ value }: ICellRendererParams) => <span className="font-mono text-xs">{value || <span className="text-muted-foreground">—</span>}</span> },
    { headerName: "Date",       field: "created_at",    filter: "agDateColumnFilter", width: 148, sort: "desc", cellRenderer: ({ data }: ICellRendererParams<FuelExpense>) => <span className="text-xs text-muted-foreground">{fmt(data?.crossing_date || data?.created_at)}</span> },
    { headerName: "Amount",     valueGetter: ({ data }) => data?.amount ?? 0, filter: "agNumberColumnFilter", width: 110, cellRenderer: ({ data }: ICellRendererParams<FuelExpense>) => <span className="font-semibold tabular-nums">{data?.currency ?? ""} {Number(data?.amount ?? 0).toFixed(2)}</span> },
    { headerName: "Incl. VAT",  valueGetter: ({ data }) => data?.amount_incl_tax ?? "", filter: "agNumberColumnFilter", width: 110, cellRenderer: ({ data }: ICellRendererParams<FuelExpense>) => <span className="text-xs text-muted-foreground">{data?.amount_incl_tax ? `${data.currency} ${Number(data.amount_incl_tax).toFixed(2)}` : "—"}</span> },
    { headerName: "Volume",     valueGetter: ({ data }) => data?.volume ?? "", filter: "agTextColumnFilter", width: 100, cellRenderer: ({ data }: ICellRendererParams<FuelExpense>) => <span className="text-xs">{data?.volume ? `${data.volume} ${data.metric_unit ?? ""}` : <span className="text-muted-foreground">—</span>}</span> },
    { headerName: "Payment",    field: "payment_method", filter: "agTextColumnFilter", width: 110, cellRenderer: ({ value }: ICellRendererParams) => <span className="text-xs text-muted-foreground">{value || "—"}</span> },
    {
      headerName: "Status", field: "status", filter: "agTextColumnFilter", width: 120,
      cellRenderer: ({ value }: ICellRendererParams) => {
        const s = STATUS_GRID[value] ?? STATUS_GRID.pending
        return value ? (<span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${s.bg} ${s.border} ${s.text}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{value}</span>) : null
      },
    },
    {
      colId: "_action", headerName: "", width: 60, sortable: false, filter: false, resizable: false,
      cellRenderer: ({ data }: ICellRendererParams<FuelExpense>) => data ? (
        <button onClick={e => { e.stopPropagation(); actionsRef.current.onDelete(data.uuid) }} title="Delete"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [])

  const defaultColDef = React.useMemo<ColDef>(() => ({
    sortable: true, resizable: true,
    suppressHeaderMenuButton: !showFilters, suppressHeaderFilterButton: !showFilters, floatingFilter: false,
  }), [showFilters])

  React.useEffect(() => {
    const api = gridRef.current?.api
    if (!api) return
    api.setGridOption("defaultColDef", { sortable: true, resizable: true, suppressHeaderMenuButton: !showFilters, suppressHeaderFilterButton: !showFilters, floatingFilter: false })
    api.refreshHeader()
  }, [showFilters])

  React.useEffect(() => { gridRef.current?.api?.setGridOption("quickFilterText", search) }, [search])

  const [selectedCount, setSelectedCount] = React.useState(0)

  const activeFilters = Object.values(filters).filter(Boolean).length

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden px-6 pt-3 pb-2 md:px-8 lg:px-10">

      {/* KPI Cards — toggled by Stats button */}
      {showCards && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Records",    value: meta.total,                                                                           sub: "all time",        colour: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",           icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
            { label: "Cost (this page)", value: `£${records.reduce((a, r) => a + Number(r.amount ?? 0), 0).toFixed(2)}`,            sub: "excl. VAT",       colour: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20", icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: "Pending Approval", value: records.filter(r => r.status === "pending").length,                                  sub: "awaiting review", colour: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20",       icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: "Approved",         value: records.filter(r => r.status === "approved").length,                                 sub: "this page",       colour: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20",  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          ].map(k => (
            <div key={k.label} className="relative flex flex-col gap-2 rounded-xl border bg-card px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">{k.label}</span>
                <span className={`rounded-lg p-1.5 ${k.colour}`}>{k.icon}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums leading-none">
                {loading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-muted" /> : k.value}
              </p>
              <p className="text-[11px] text-muted-foreground">{k.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div data-help="toolbar" className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* LEFT anchor — matches Today/History tab style on trips */}
          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
            <span className="rounded-md px-3.5 py-1.5 text-sm font-medium bg-card shadow-sm text-foreground">{t.nav.fuelTracking}</span>
          </div>

          <div className="flex-1" />

          {selectedCount > 0 && (
            <button onClick={handleBulkDelete}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-500 px-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-600">
              <Trash2 className="h-3.5 w-3.5" /> Delete {selectedCount}
            </button>
          )}

          <div className={`relative transition-all duration-200 ${searchFocused ? "w-72" : "w-40"}`}>
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search vehicle, driver…" value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              className="h-8 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
          </div>

          <div className="flex items-center gap-0.5 rounded-lg border bg-muted/30 p-0.5">
            <button onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${showFilters ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}>
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" d="M2 4h12M4 8h8M6 12h4" /></svg>
              Filter
            </button>
            <button onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${activeFilters > 0 || showFilter ? "bg-violet-500 text-white shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}>
              <Filter className="h-3 w-3" /> Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}
            </button>
            <button onClick={() => setShowCards(v => !v)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${showCards ? "bg-blue-500 text-white shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}>
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2 13V8M6 13V5M10 13V7M14 13V3" /></svg>
              Stats
            </button>
          </div>

          <span className="h-6 w-px bg-border" />

          <button onClick={handleRefresh} title="Refresh" disabled={refreshing || loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowImport(true)} title="Import"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Upload className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleExport} disabled={exporting} title="Export"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          </button>

          <span className="h-6 w-px bg-border" />

          <button onClick={() => setSlideOver("new")}
            className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
            {f.addExpense}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Grid */}
      <div className="relative flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && records.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-16">
            <FileText className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No fuel expenses found</p>
          </div>
        ) : (
          <AgGridReact<FuelExpense>
            ref={gridRef}
            theme={isDark ? ftDarkTheme : ftLightTheme}
            rowData={records}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            rowSelection={{ mode: "multiRow", checkboxes: false }}
            onSelectionChanged={() => setSelectedCount(gridRef.current?.api?.getSelectedRows().length ?? 0)}
            suppressRowClickSelection
            animateRows
            className="h-full w-full"
          />
        )}
      </div>


      {slideOver !== null && (
        <ExpenseSlideOver
          record={slideOver === "new" ? null : slideOver}
          vehicles={vehicles}
          drivers={drivers}
          onClose={() => setSlideOver(null)}
          onSaved={() => fetchData(page)}
        />
      )}
      {showImport && <ImportWizard onClose={() => setShowImport(false)} onDone={() => fetchData(1)} />}
      <FilterPanel open={showFilter} onClose={() => setShowFilter(false)} filters={filters} setFilters={setFilters} vehicles={vehicles} />
    </div>
  )
}
