"use client"


import * as React from "react"
import {
  Search, Download, Plus, RefreshCw, X, Loader2,
  AlertCircle, Trash2, Filter, Pencil, FileText,
} from "lucide-react"
import { useLang } from "@/components/lang-context"
import { useConfirm } from "@/components/confirm-dialog"
import {
  listParkingReports, createParkingReport, updateParkingReport,
  deleteParkingReport, bulkDeleteFuelReports, exportFuelReports,
  REPORT_STATUSES, PARKING_PAYMENT_METHODS,
  type ParkingReport, type CreateParkingPayload,
} from "@/lib/fuel-reports-api"
import { listVehicles, type Vehicle } from "@/lib/vehicles-api"
import { listDrivers, type Driver } from "@/lib/drivers-api"

import { AgGridReact } from "ag-grid-react"
import {
  type ColDef, type ICellRendererParams,
  ModuleRegistry, AllCommunityModule, themeQuartz,
} from "ag-grid-community"
ModuleRegistry.registerModules([AllCommunityModule])

const _pkBase = {
  fontFamily: "var(--font-sans, 'Montserrat', 'Inter', system-ui, sans-serif)",
  fontSize: 13, rowHeight: 39, headerHeight: 38,
  backgroundColor: "var(--background)", foregroundColor: "var(--foreground)",
  headerBackgroundColor: "var(--muted)", headerTextColor: "var(--muted-foreground)",
  borderColor: "var(--border)", rowBorder: false, wrapperBorder: false,
  headerRowBorder: false, columnBorder: false,
  cellHorizontalPaddingScale: 1.1, rowVerticalPaddingScale: 1,
  selectedRowBackgroundColor: "var(--accent)", gridSize: 5, scrollbarWidth: 6,
}
const pkLightTheme = themeQuartz.withParams({ ..._pkBase, backgroundColor: "#ffffff", foregroundColor: "#1f2933", headerBackgroundColor: "#f9fafb", headerTextColor: "#39485d", borderColor: "#eff0f1", rowHoverColor: "#f5f7fb", selectedRowBackgroundColor: "#edf2ff" })
const pkDarkTheme  = themeQuartz.withParams({ ..._pkBase, backgroundColor: "#141414", foregroundColor: "#e5e5e5", headerBackgroundColor: "#1e2531", headerTextColor: "#c9d0da",  borderColor: "#2a2a2a",  rowHoverColor: "#1f2937", selectedRowBackgroundColor: "#1e3a5f" })

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso?: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
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

const EMPTY_FORM: CreateParkingPayload = {
  report_type: "Parking",
  driver_uuid: "", vehicle_uuid: "", reported_by_uuid: "me",
  status: "pending", amount: 0, currency: "GBP", payment_method: "Card",
}

// Defined at module level — NOT inside a component — so its identity stays
// stable across renders and React doesn't remount the children (which loses focus).
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function ParkingSlideOver({ record, vehicles, drivers, onClose, onSaved }: {
  record: ParkingReport | null
  vehicles: Vehicle[]
  drivers: Driver[]
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useLang()
  const c = t.common
  const isEdit = !!record
  const [form, setForm] = React.useState<CreateParkingPayload>(
    record
      ? {
          report_type: "Parking",
          driver_uuid: record.driver?.uuid ?? record.driver_uuid ?? "",
          vehicle_uuid: record.vehicle?.uuid ?? record.vehicle_uuid ?? "",
          reported_by_uuid: record.reported_by_uuid ?? "me",
          status: record.status,
          amount: record.amount,
          currency: record.currency,
          payment_method: (record.payment_method as "Card" | "Other") ?? "Card",
          card_type: record.card_type ?? "",
          odometer: record.odometer ?? "",
          report: record.report ?? "",
        }
      : { ...EMPTY_FORM }
  )
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  const set = <K extends keyof CreateParkingPayload>(k: K, v: CreateParkingPayload[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setError("")
    setSaving(true)
    try {
      const payload = { ...form, amount: Number(form.amount) }
      if (isEdit && record) {
        await updateParkingReport(record.uuid, payload)
      } else {
        await createParkingReport(payload)
      }
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const input = "h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
  const sel = "h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-bold">{isEdit ? c.edit : c.addNew} Parking</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{isEdit ? `Editing ${record?.public_id}` : c.createRecord}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 px-3 py-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label={`${c.driver} *`}>
              <select value={form.driver_uuid} onChange={e => set("driver_uuid", e.target.value)} className={sel}>
                <option value="">Select driver…</option>
                {drivers.map(d => <option key={d.uuid} value={d.uuid}>{d.name}</option>)}
              </select>
            </Field>
            <Field label={`${c.vehicle} *`}>
              <select value={form.vehicle_uuid} onChange={e => set("vehicle_uuid", e.target.value)} className={sel}>
                <option value="">Select vehicle…</option>
                {vehicles.map(v => <option key={v.uuid} value={v.uuid}>{v.plate_number}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`${c.amount} *`}><input type="number" step="0.01" min="0" value={form.amount} onChange={e => set("amount", Number(e.target.value))} className={input} /></Field>
            <Field label="Currency *"><input value={form.currency} onChange={e => set("currency", e.target.value)} className={input} placeholder="GBP" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`${c.method} *`}>
              <select value={form.payment_method} onChange={e => set("payment_method", e.target.value as "Card" | "Other")} className={sel}>
                {PARKING_PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Card Type"><input value={form.card_type ?? ""} onChange={e => set("card_type", e.target.value)} className={input} placeholder="Visa, Mastercard…" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`${c.status} *`}>
              <select value={form.status} onChange={e => set("status", e.target.value as "pending" | "approved" | "rejected")} className={sel}>
                {REPORT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label={c.odometer}><input value={form.odometer ?? ""} onChange={e => set("odometer", e.target.value)} className={input} placeholder="45200" /></Field>
          </div>
          <Field label={`${c.notes} / ${c.location}`}>
            <textarea value={form.report ?? ""} onChange={e => set("report", e.target.value)} className="h-16 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="Parking at Manchester depot, Bay 12…" />
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

// ─── Filter Panel ─────────────────────────────────────────────────────────────

type Filters = { vehicle: string; status: string; start_date: string; end_date: string }
const EMPTY_FILTERS: Filters = { vehicle: "", status: "", start_date: "", end_date: "" }

function FilterPanel({ open, onClose, filters, setFilters, vehicles }: {
  open: boolean; onClose: () => void
  filters: Filters; setFilters: (f: Filters) => void
  vehicles: Vehicle[]
}) {
  const { t } = useLang()
  const c = t.common
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
          <h2 className="font-bold">{c.filter} Parking</h2>
          <button onClick={onClose} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{c.vehicle}</label>
            <select value={local.vehicle} onChange={e => set("vehicle", e.target.value)} className={sel}>
              <option value="">Any vehicle</option>
              {vehicles.map(v => <option key={v.uuid} value={v.uuid}>{v.plate_number}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{c.status}</label>
            <select value={local.status} onChange={e => set("status", e.target.value)} className={sel}>
              <option value="">Any status</option>
              {REPORT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date from</label>
            <input type="date" value={local.start_date} onChange={e => set("start_date", e.target.value)} className={sel} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date to</label>
            <input type="date" value={local.end_date} onChange={e => set("end_date", e.target.value)} className={sel} />
          </div>
        </div>
        <div className="flex gap-2 border-t p-4">
          <button onClick={() => { setLocal(EMPTY_FILTERS); setFilters(EMPTY_FILTERS) }} className="flex-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">{c.clearAll}</button>
          <button onClick={() => { setFilters(local); onClose() }} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {c.apply}{active > 0 ? ` (${active})` : ""}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ParkingPage() {
  const { t } = useLang()
  const confirm = useConfirm()
  const c = t.common

  const [records, setRecords] = React.useState<ParkingReport[]>([])
  const [meta, setMeta] = React.useState({ total: 0, last_page: 1, current_page: 1 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  const [search, setSearch] = React.useState("")
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS)
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [slideOver, setSlideOver] = React.useState<ParkingReport | null | "new">(null)
  const [showFilter, setShowFilter] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(false)
  const [showCards, setShowCards] = React.useState(false)
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [selectedCount, setSelectedCount] = React.useState(0)

  const [isDark, setIsDark] = React.useState(false)
  React.useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"))
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  const gridRef = React.useRef<AgGridReact<ParkingReport>>(null)

  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [drivers, setDrivers] = React.useState<Driver[]>([])

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
      const res = await listParkingReports({
        page: p, limit: 15,
        query: debouncedSearch || undefined,
        vehicle: filters.vehicle || undefined,
        status: filters.status || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      })
      const raw = res as unknown as Record<string, unknown>
      const rows = (raw.fuel_reports ?? raw.data ?? []) as ParkingReport[]
      setRecords(rows)
      const m = res.meta ?? { total: 0, last_page: 1, current_page: 1 }
      setMeta({ total: m.total, last_page: m.last_page, current_page: m.current_page })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filters])

  React.useEffect(() => {
    listVehicles({ limit: 999 }).then(r => setVehicles(r.vehicles)).catch(() => {})
    listDrivers({ limit: 999 }).then(r => setDrivers(r.drivers ?? [])).catch(() => {})
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { setPage(1); fetchData(1) }, [debouncedSearch, filters])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { fetchData(page) }, [page])

  const handleDelete = async (uuid: string) => {
    const ok = await confirm({ title: "Delete parking record", description: "This will permanently remove the parking record." })
    if (!ok) return
    try { await deleteParkingReport(uuid); fetchData(page) }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Delete failed") }
  }

  const handleBulkDelete = async () => {
    const sel = gridRef.current?.api?.getSelectedRows() ?? []
    if (!sel.length) return
    const ok = await confirm({ title: `Delete ${sel.length} record${sel.length !== 1 ? "s" : ""}`, description: "This action is permanent and cannot be undone." })
    if (!ok) return
    try { await bulkDeleteFuelReports(sel.map(r => r.uuid)); fetchData(page) }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Delete failed") }
  }

  const handleRefresh = async () => { setRefreshing(true); await fetchData(page); setRefreshing(false) }

  const handleExport = async () => {
    setExporting(true)
    try { await exportFuelReports({ report_type: "parking", format: "xlsx", from_date: filters.start_date || undefined, to_date: filters.end_date || undefined }) }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Export failed") }
    finally { setExporting(false) }
  }

  const handleApprove = async (uuid: string, newStatus: "approved" | "rejected") => {
    try { await updateParkingReport(uuid, { status: newStatus }); fetchData(page) }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Update failed") }
  }

  const PK_STATUS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    pending:  { bg: "bg-amber-50 dark:bg-amber-900/20",   border: "border-amber-300/70",   text: "text-amber-800 dark:text-amber-300",   dot: "bg-amber-500" },
    approved: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-300/70", text: "text-emerald-800 dark:text-emerald-300", dot: "bg-emerald-500" },
    rejected: { bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-300/70",       text: "text-red-700 dark:text-red-400",       dot: "bg-red-500" },
  }

  const actionsRef = React.useRef({ onEdit: (r: ParkingReport) => setSlideOver(r), onDelete: handleDelete, onApprove: handleApprove })
  React.useEffect(() => { actionsRef.current = { onEdit: (r: ParkingReport) => setSlideOver(r), onDelete: handleDelete, onApprove: handleApprove } })

  const colDefs = React.useMemo<ColDef<ParkingReport>[]>(() => [
    {
      colId: "_edit", headerName: "", width: 40, minWidth: 40, maxWidth: 40,
      sortable: false, filter: false, resizable: false, pinned: "left" as const, suppressMovable: true,
      cellRenderer: ({ data }: ICellRendererParams<ParkingReport>) => data ? (
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); actionsRef.current.onEdit(data) }}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
          </svg>
        </button>
      ) : null,
    },
    { headerName: "Driver",   valueGetter: ({ data }) => data?.driver?.name ?? "",          filter: "agTextColumnFilter", flex: 1.2, minWidth: 140, cellRenderer: ({ value }: ICellRendererParams) => <span className="font-medium">{value || <span className="text-muted-foreground">—</span>}</span> },
    { headerName: "Vehicle",  valueGetter: ({ data }) => data?.vehicle?.plate_number ?? "",  filter: "agTextColumnFilter", width: 130, cellRenderer: ({ value }: ICellRendererParams) => <span className="font-mono text-xs">{value || <span className="text-muted-foreground">—</span>}</span> },
    { headerName: "Date",     field: "created_at", filter: "agDateColumnFilter", width: 130, sort: "desc", cellRenderer: ({ data }: ICellRendererParams<ParkingReport>) => <span className="text-xs text-muted-foreground">{fmt(data?.created_at)}</span> },
    { headerName: "Amount",   valueGetter: ({ data }) => data?.amount ?? 0, filter: "agNumberColumnFilter", width: 110,
      cellRenderer: ({ data }: ICellRendererParams<ParkingReport>) => Number(data?.amount ?? 0) === 0
        ? <span className="font-semibold text-green-600 dark:text-green-400">Free</span>
        : <span className="font-semibold tabular-nums">{data?.currency} {Number(data?.amount ?? 0).toFixed(2)}</span> },
    { headerName: "Payment",  field: "payment_method", filter: "agTextColumnFilter", width: 110, cellRenderer: ({ value }: ICellRendererParams) => <span className="text-xs text-muted-foreground">{value || "—"}</span> },
    { headerName: "Odometer", field: "odometer",       filter: "agTextColumnFilter", width: 110, cellRenderer: ({ value }: ICellRendererParams) => <span className="text-xs text-muted-foreground">{value || "—"}</span> },
    { headerName: "Notes",    field: "report",         filter: "agTextColumnFilter", flex: 1,   cellRenderer: ({ value }: ICellRendererParams) => <span className="truncate text-xs text-muted-foreground">{value || "—"}</span> },
    {
      headerName: "Status", field: "status", filter: "agTextColumnFilter", width: 120,
      cellRenderer: ({ value }: ICellRendererParams) => { const s = PK_STATUS[value] ?? PK_STATUS.pending; return value ? (<span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${s.bg} ${s.border} ${s.text}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{value}</span>) : null },
    },
    {
      colId: "_action", headerName: "", width: 110, sortable: false, filter: false, resizable: false,
      cellRenderer: ({ data }: ICellRendererParams<ParkingReport>) => data ? (
        <div className="flex items-center gap-1">
          {data.status === "pending" && (<>
            <button onClick={() => actionsRef.current.onApprove(data.uuid, "approved")}
              className="inline-flex h-6 items-center gap-1 rounded-md border border-green-200 bg-green-50 px-1.5 text-[10px] font-medium text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">Approve</button>
            <button onClick={() => actionsRef.current.onApprove(data.uuid, "rejected")}
              className="inline-flex h-6 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-1.5 text-[10px] font-medium text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">Reject</button>
          </>)}
          {data.status !== "pending" && (
            <button onClick={() => actionsRef.current.onDelete(data.uuid)} title="Delete"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
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

  const activeFilters = Object.values(filters).filter(Boolean).length
  const totalCost = records.reduce((a, r) => a + Number(r.amount ?? 0), 0)
  const pendingCount = records.filter(r => r.status === "pending").length
  const freeCount = records.filter(r => r.amount === 0).length

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden px-6 pt-3 pb-2 md:px-8 lg:px-10">

      {/* KPI Cards — toggled by Stats button */}
      {showCards && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Records",    value: meta.total,       sub: "all time",        colour: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",           icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
            { label: "Cost (this page)", value: `£${totalCost.toFixed(2)}`,              sub: "excl. VAT",        colour: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20", icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: "Pending Approval", value: pendingCount,     sub: "awaiting review", colour: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20",       icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: "Free Nights",      value: freeCount,        sub: "no charge",        colour: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20",  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> },
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
            <span className="rounded-md px-3.5 py-1.5 text-sm font-medium bg-card shadow-sm text-foreground">{t.nav.parkingMonitoring}</span>
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
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" d="M2 4h12M4 8h8M6 12h4" /></svg>
              Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}
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
          <button onClick={handleExport} disabled={exporting} title="Export"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          </button>

          <span className="h-6 w-px bg-border" />

          <button onClick={() => setSlideOver("new")}
            className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
            {c.addNew}
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
            <p className="text-sm text-muted-foreground">No parking records found</p>
          </div>
        ) : (
          <AgGridReact<ParkingReport>
            ref={gridRef}
            theme={isDark ? pkDarkTheme : pkLightTheme}
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
        <ParkingSlideOver
          record={slideOver === "new" ? null : slideOver}
          vehicles={vehicles} drivers={drivers}
          onClose={() => setSlideOver(null)}
          onSaved={() => fetchData(page)}
        />
      )}
      <FilterPanel open={showFilter} onClose={() => setShowFilter(false)} filters={filters} setFilters={setFilters} vehicles={vehicles} />
    </div>
  )
}
