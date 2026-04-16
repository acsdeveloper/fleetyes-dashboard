"use client"
import * as React from "react"
import {
  Building2, Phone, DollarSign, MapPin, Users, ImageIcon,
  Save, RefreshCw, AlertCircle, CheckCircle2, Upload, Loader2,
  ChevronDown, Car, CalendarDays, Clock, FlaskConical, Settings2,
  Plug, Eye, EyeOff, Wifi, WifiOff, PlugZap,
} from "lucide-react"
import {
  getCompanySettings, updateCompanySettings, uploadLogo,
  CURRENCIES, type CompanySettings, type CompanySettingsUpdatePayload,
} from "@/lib/company-settings-api"
import {
  getGeotabSettings, saveGeotabSettings, type GeotabSettings,
} from "@/lib/geotab-settings"

// ─── Util components ──────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch" aria-checked={on} onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${on ? "bg-green-500" : "bg-muted border"}`}
    >
      <span className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  )
}

function PermissionRow({ icon: Icon, title, description, on, onChange }: {
  icon: React.ElementType; title: string; description: string; on: boolean; onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground max-w-lg">{description}</p>
        </div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

function Toast({ type, message, onDismiss }: { type: "success" | "error"; message: string; onDismiss: () => void }) {
  React.useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t) }, [onDismiss])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ${
      type === "success"
        ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
        : "bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
    }`}>
      {type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-2 text-xs opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = "general" | "operations" | "rota" | "permissions" | "integrations"

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "general",      label: "General",      icon: Building2 },
  { id: "operations",   label: "Operations",   icon: MapPin    },
  { id: "rota",         label: "Rota",         icon: Clock     },
  { id: "permissions",  label: "Permissions",  icon: Users     },
  { id: "integrations", label: "Integrations", icon: Plug      },
]

// ─── Rota hours localStorage key ──────────────────────────────────────────────
const ROTA_LS_KEY = "fleetyes_rota_hours"

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrgSettingsPage() {
  const [tab, setTab] = React.useState<TabId>("general")

  // Remote state
  const [company, setCompany]     = React.useState<CompanySettings | null>(null)
  const [loading, setLoading]     = React.useState(true)
  const [saving, setSaving]       = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [toast, setToast]         = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  // General
  const [name, setName]               = React.useState("")
  const [description, setDescription] = React.useState("")
  const [phone, setPhone]             = React.useState("")
  const [currency, setCurrency]       = React.useState("GBP")

  // Logo
  const [logoUrl, setLogoUrl]         = React.useState<string | null>(null)
  const [logoUuid, setLogoUuid]       = React.useState<string | null>(null)
  const [logoUploading, setLogoUploading] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  // Operations
  const [parkingZone, setParkingZone] = React.useState<number>(3)

  // Rota (local-only)
  const [drivingHours, setDrivingHours] = React.useState<number>(9)
  const [workingHours, setWorkingHours] = React.useState<number>(11)

  // Permissions
  const [driverHoliday, setDriverHoliday] = React.useState(false)
  const [driverIssue, setDriverIssue]     = React.useState(false)

  // Integrations — Geotab (localStorage)
  const [geotab, setGeotab]               = React.useState<GeotabSettings>(() => getGeotabSettings())
  const [showPassword, setShowPassword]   = React.useState(false)
  const [geotabTesting, setGeotabTesting] = React.useState(false)
  const [geotabStatus, setGeotabStatus]   = React.useState<"idle" | "ok" | "error">("idle")
  const [geotabMsg, setGeotabMsg]         = React.useState("")

  // ── Load ─────────────────────────────────────────────────────────────────────
  async function load() {
    setLoading(true); setLoadError(null)
    try {
      const c = await getCompanySettings()
      setCompany(c)
      setName(c.name ?? "")
      setDescription(c.description ?? "")
      setPhone(c.phone ?? "")
      setCurrency(c.currency ?? "GBP")
      setParkingZone(c.parking_zone_max_distance ?? 3)
      setDriverHoliday(c.driver_can_create_holiday ?? false)
      setDriverIssue(c.driver_can_create_issue ?? false)
      setLogoUrl(c.logo_url ?? null)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load settings.")
    } finally {
      setLoading(false)
    }
  }

  // Load rota from localStorage
  React.useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(ROTA_LS_KEY) : null
    if (raw) {
      try {
        const p = JSON.parse(raw)
        if (typeof p.drivingHours === "number") setDrivingHours(p.drivingHours)
        if (typeof p.workingHours === "number") setWorkingHours(p.workingHours)
      } catch { /* ignore */ }
    }
  }, [])

  React.useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Logo upload ───────────────────────────────────────────────────────────────
  async function handleLogoFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Please select an image file." }); return
    }
    setLogoUploading(true)
    try {
      const up = await uploadLogo(file)
      setLogoUuid(up.uuid); setLogoUrl(up.url)
      setToast({ type: "success", message: "Logo uploaded." })
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Upload failed." })
    } finally { setLogoUploading(false) }
  }

  // ── Save ──────────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    try {
      // Persist rota hours locally
      if (typeof window !== "undefined") {
        localStorage.setItem(ROTA_LS_KEY, JSON.stringify({ drivingHours, workingHours }))
      }
      // Persist Geotab settings locally
      saveGeotabSettings(geotab)

      const payload: CompanySettingsUpdatePayload = {
        name: name.trim(), description: description.trim() || undefined,
        phone: phone.trim() || undefined, currency,
        parking_zone_max_distance: parkingZone,
        driver_can_create_holiday: driverHoliday,
        driver_can_create_issue: driverIssue,
      }
      if (logoUuid) payload.logo_uuid = logoUuid
      const updated = await updateCompanySettings(payload)
      setCompany(updated)
      setToast({ type: "success", message: "Settings saved successfully." })
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Save failed." })
    } finally { setSaving(false) }
  }

  // ── Loading / Error ───────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading settings…</p>
      </div>
    </div>
  )

  if (loadError) return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <p className="font-semibold">Failed to load settings</p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">

      {/* ── Top toolbar ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b bg-background px-6 py-3 shrink-0">

        {/* Page icon + title */}
        <div className="flex items-center gap-2 mr-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Organisation Settings</span>
        </div>

        {/* Tab pills — same style as trips Today/History */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Status pills */}
        {company && (
          <div className="flex items-center gap-2 ml-1">
            <span className="inline-flex items-center rounded-[100px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 pl-1 pr-3 text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-[2]">
              <span className="mr-2 ml-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-slate-400" />{company.public_id}
            </span>
            <span className="inline-flex items-center rounded-[100px] border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 pl-1 pr-3 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 leading-[2]">
              <span className="mr-2 ml-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500" />{company.users_count} users
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Save button */}
        <button
          onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* ── Tab content (no scroll, fills remaining height) ─────────────────── */}
      <div className="flex-1 overflow-hidden">

        {/* ── GENERAL ──────────────────────────────────────────────────────── */}
        {tab === "general" && (
          <div className="h-full overflow-auto p-6">
            <div className="flex flex-col gap-6">

              {/* Logo + name row */}
              <div className="rounded-xl border bg-card shadow-sm p-6">
                <div className="flex items-start gap-6">
                  {/* Logo */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div
                      onClick={() => !logoUploading && fileRef.current?.click()}
                      className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:bg-muted/60 group"
                    >
                      {logoUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                        : <ImageIcon className="h-7 w-7 text-muted-foreground/40" />
                      }
                      {logoUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <Upload className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <button onClick={() => fileRef.current?.click()} disabled={logoUploading} className="text-xs text-primary hover:underline disabled:opacity-40">
                      {logoUploading ? "Uploading…" : "Change"}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }} />
                  </div>

                  {/* Name + Description */}
                  <div className="flex-1 flex flex-col gap-4">
                    <Field label="Company Name" hint="Appears across the platform.">
                      <input value={name} onChange={e => setName(e.target.value)}
                        placeholder="e.g. Acme Transport Ltd"
                        className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
                    </Field>
                    <Field label="Description" hint="Optional short bio for your organisation.">
                      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                        placeholder="e.g. Fleet management for the UK's largest logistics network."
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring resize-none" />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Contact row */}
              <div className="rounded-xl border bg-card shadow-sm p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Phone Number" hint="Include country code.">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 800 000 0000"
                        className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
                    </div>
                  </Field>
                  <Field label="Default Currency" hint="Used for all cost reporting.">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <select value={currency} onChange={e => setCurrency(e.target.value)}
                        className="h-9 w-full appearance-none rounded-lg border bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring">
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Record info */}
              {company && (
                <div className="rounded-xl border bg-muted/20 px-6 py-4">
                  <p className="text-[10px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">Record Info</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
                    {[
                      { label: "Slug",         value: company.slug },
                      { label: "Users",        value: String(company.users_count) },
                      { label: "Joined",       value: company.joined_at ? new Date(company.joined_at).toLocaleDateString("en-GB") : "—" },
                      { label: "Last Updated", value: company.updated_at ? new Date(company.updated_at).toLocaleDateString("en-GB") : "—" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-xs font-medium mt-0.5 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── OPERATIONS ───────────────────────────────────────────────────── */}
        {tab === "operations" && (
          <div className="h-full overflow-auto p-6">
            <div>
              <div className="rounded-xl border bg-card shadow-sm p-6">

                <Field
                  label="Parking Zone Max Distance (km)"
                  hint="Maximum distance from the depot that counts as an approved overnight parking zone."
                >
                  <div className="flex items-center gap-4 mt-1">
                    <div className="relative w-32">
                      <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input type="number" min={1} max={100} value={parkingZone}
                        onChange={e => setParkingZone(Number(e.target.value))}
                        className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <input type="range" min={1} max={50} step={1} value={parkingZone}
                      onChange={e => setParkingZone(Number(e.target.value))}
                      className="flex-1 accent-primary" />
                    <span className="w-14 text-right text-sm font-medium tabular-nums text-muted-foreground">{parkingZone} km</span>
                  </div>
                  {/* Visual bar */}
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(parkingZone / 50) * 100}%` }} />
                  </div>
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* ── ROTA ─────────────────────────────────────────────────────────── */}
        {tab === "rota" && (
          <div className="h-full p-6">
            <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-6">

              {/* Two inputs side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Driving Hours</label>
                  <input
                    type="number" min={1} max={24} step={0.5}
                    value={drivingHours}
                    onChange={e => {
                      const v = Number(e.target.value)
                      setDrivingHours(v)
                      if (v > workingHours) setWorkingHours(v)
                    }}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Working Hours</label>
                  <input
                    type="number" min={1} max={24} step={0.5}
                    value={workingHours}
                    onChange={e => setWorkingHours(Number(e.target.value))}
                    className={`h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
                      workingHours < drivingHours ? "border-red-400 focus:ring-red-300" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Validation */}
              {workingHours < drivingHours && (
                <p className="flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Working hours cannot be less than driving hours.
                </p>
              )}

              {/* Pending API notice */}
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                <FlaskConical className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-700 dark:text-amber-400">Saved locally until an API is available.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── INTEGRATIONS ─────────────────────────────────────────────── */}
        {tab === "integrations" && (
          <div className="h-full overflow-auto p-6">
            <div className="flex flex-col gap-4">

              {/* Geotab card */}
              <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col gap-5">

                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted/40">
                      <PlugZap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">MyGeotab</p>
                      <p className="text-xs text-muted-foreground">Connect your Geotab fleet tracking account</p>
                    </div>
                  </div>
                  {/* Enable toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{geotab.enabled ? "Enabled" : "Disabled"}</span>
                    <Toggle on={geotab.enabled} onChange={() => setGeotab(g => ({ ...g, enabled: !g.enabled }))} />
                  </div>
                </div>

                {/* Connection status badge */}
                {geotabStatus !== "idle" && (
                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                    geotabStatus === "ok"
                      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                      : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                  }`}>
                    {geotabStatus === "ok" ? <Wifi className="h-3.5 w-3.5 shrink-0" /> : <WifiOff className="h-3.5 w-3.5 shrink-0" />}
                    {geotabMsg}
                  </div>
                )}

                {/* Fields */}
                <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 transition-opacity ${geotab.enabled ? "" : "opacity-40 pointer-events-none"}`}>
                  <Field label="Server" hint='e.g. my.geotab.com or my3.geotab.com'>
                    <input
                      value={geotab.server}
                      onChange={e => setGeotab(g => ({ ...g, server: e.target.value }))}
                      placeholder="my.geotab.com"
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                  <Field label="Company Database" hint="Your organisation's database name in MyGeotab">
                    <input
                      value={geotab.database}
                      onChange={e => setGeotab(g => ({ ...g, database: e.target.value }))}
                      placeholder="fleetyes"
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                  <Field label="Username" hint="Service account email address">
                    <input
                      type="email"
                      value={geotab.userName}
                      onChange={e => setGeotab(g => ({ ...g, userName: e.target.value }))}
                      placeholder="api@yourcompany.com"
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                  <Field label="Password" hint="Service account password">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={geotab.password}
                        onChange={e => setGeotab(g => ({ ...g, password: e.target.value }))}
                        placeholder="••••••••"
                        className="h-9 w-full rounded-lg border bg-background px-3 pr-9 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </Field>
                </div>

                {/* Test connection */}
                <div className="flex items-center gap-3">
                  <button
                    disabled={!geotab.enabled || geotabTesting || !geotab.server || !geotab.database || !geotab.userName || !geotab.password}
                    onClick={async () => {
                      setGeotabTesting(true); setGeotabStatus("idle")
                      // Save first so geotab.ts picks up the latest values
                      saveGeotabSettings(geotab)
                      try {
                        const { geotabApi } = await import("@/lib/geotab")
                        const devices = await geotabApi.getDevices()
                        setGeotabStatus("ok")
                        setGeotabMsg(`Connected — ${devices.length} device${devices.length !== 1 ? "s" : ""} found`)
                      } catch (err) {
                        setGeotabStatus("error")
                        setGeotabMsg(err instanceof Error ? err.message : "Connection failed")
                      } finally {
                        setGeotabTesting(false)
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted/70 disabled:opacity-40"
                  >
                    {geotabTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
                    {geotabTesting ? "Testing…" : "Test Connection"}
                  </button>
                </div>

                {/* Pending API notice */}
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                  <FlaskConical className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">Credentials are saved locally in this browser. Multi-device sync will be available once the API is ready.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── PERMISSIONS ──────────────────────────────────────────────────── */}
        {tab === "permissions" && (
          <div className="h-full overflow-auto p-6">
            <div>
              <div className="rounded-xl border bg-card shadow-sm p-6">
                <div className="flex flex-col gap-3">
                  <PermissionRow
                    icon={CalendarDays}
                    title="Driver Can Create Holiday Requests"
                    description="Drivers can submit holiday and leave requests from the app. Requests require manager approval before being applied."
                    on={driverHoliday} onChange={() => setDriverHoliday(v => !v)}
                  />
                  <PermissionRow
                    icon={Car}
                    title="Driver Can Report Issues"
                    description="Drivers can log vehicle or operational issues from the app. These are visible to managers in the Issues module."
                    on={driverIssue} onChange={() => setDriverIssue(v => !v)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </div>
  )
}
