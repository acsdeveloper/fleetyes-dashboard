"use client"
import * as React from "react"
import {
  Building2, Phone, DollarSign, MapPin, Users, ImageIcon,
  Save, RefreshCw, AlertCircle, CheckCircle2, Upload, Loader2,
  ChevronDown, Car, CalendarDays, Clock, FlaskConical,
} from "lucide-react"
import {
  getCompanySettings, updateCompanySettings, uploadLogo,
  CURRENCIES, type CompanySettings, type CompanySettingsUpdatePayload,
} from "@/lib/company-settings-api"

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, description, icon: Icon, children }: {
  title: string
  description?: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b bg-muted/30 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

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
      role="switch"
      aria-checked={on}
      onClick={onChange}
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

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ type, message, onDismiss }: { type: "success" | "error"; message: string; onDismiss: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
      type === "success"
        ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
        : "bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
    }`}>
      {type === "success"
        ? <CheckCircle2 className="h-4 w-4 shrink-0" />
        : <AlertCircle className="h-4 w-4 shrink-0" />
      }
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-2 text-current/60 hover:text-current text-xs">✕</button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrgSettingsPage() {
  const [company, setCompany] = React.useState<CompanySettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  // Form state
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [currency, setCurrency] = React.useState("GBP")
  const [parkingZone, setParkingZone] = React.useState<number>(3)
  const [driverHoliday, setDriverHoliday] = React.useState(false)
  const [driverIssue, setDriverIssue] = React.useState(false)

  // Rota planning hours — local-only until API is ready
  const ROTA_LS_KEY = "fleetyes_rota_hours"
  const [drivingHours, setDrivingHours] = React.useState<number>(9)
  const [workingHours, setWorkingHours] = React.useState<number>(11)

  // Logo state
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [logoUuid, setLogoUuid] = React.useState<string | null>(null)
  const [logoUploading, setLogoUploading] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  // Load company settings
  async function load() {
    setLoading(true)
    setLoadError(null)
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

  // Load rota hours from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(ROTA_LS_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          if (typeof parsed.drivingHours === "number") setDrivingHours(parsed.drivingHours)
          if (typeof parsed.workingHours === "number") setWorkingHours(parsed.workingHours)
        } catch { /* ignore */ }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => { load() }, [])

  // Logo upload
  async function handleLogoFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Please select an image file (JPG, PNG, SVG)." })
      return
    }
    setLogoUploading(true)
    try {
      const uploaded = await uploadLogo(file)
      setLogoUuid(uploaded.uuid)
      setLogoUrl(uploaded.url)
      setToast({ type: "success", message: "Logo uploaded successfully." })
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Logo upload failed." })
    } finally {
      setLogoUploading(false)
    }
  }

  // Save
  async function handleSave() {
    setSaving(true)
    try {
      // Persist rota hours locally (no API yet)
      if (typeof window !== "undefined") {
        localStorage.setItem(ROTA_LS_KEY, JSON.stringify({ drivingHours, workingHours }))
      }

      const payload: CompanySettingsUpdatePayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
        currency,
        parking_zone_max_distance: parkingZone,
        driver_can_create_holiday: driverHoliday,
        driver_can_create_issue: driverIssue,
      }
      if (logoUuid) payload.logo_uuid = logoUuid
      const updated = await updateCompanySettings(payload)
      setCompany(updated)
      setToast({ type: "success", message: "Organisation settings saved successfully." })
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Save failed." })
    } finally {
      setSaving(false)
    }
  }

  // ── Loading / Error states ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading settings…</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="font-semibold">Failed to load settings</p>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Organisation Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your company profile, branding, currency, and driver permissions.
          </p>
          {company && (
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center rounded-[100px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 pl-1 pr-3 text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-[2]">
                <span className="mr-2 ml-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-slate-400" />
                {company.public_id}
              </span>
              <span className="inline-flex items-center rounded-[100px] border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 pl-1 pr-3 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 leading-[2]">
                <span className="mr-2 ml-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                {company.users_count} users
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* ── Branding & Logo ──────────────────────────────────────────────────── */}
      <SectionCard title="Branding & Logo" description="Upload your company logo and set display name." icon={ImageIcon}>
        <div className="flex items-start gap-6">
          {/* Logo preview + upload */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors group"
              onClick={() => !logoUploading && fileRef.current?.click()}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Company logo" className="h-full w-full object-contain p-1" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
              )}
              {logoUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                <Upload className="h-5 w-5 text-white" />
              </div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={logoUploading}
              className="text-xs text-primary hover:underline disabled:opacity-40"
            >
              {logoUploading ? "Uploading…" : "Change logo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }}
            />
          </div>

          {/* Name & Description */}
          <div className="flex-1 flex flex-col gap-4">
            <Field label="Company Name" hint="This name appears across the platform.">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Acme Transport Ltd"
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Description" hint="Optional short description of your organisation.">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. Fleet management for the UK's largest logistics network."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring resize-none"
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* ── Contact & Locale ─────────────────────────────────────────────────── */}
      <SectionCard title="Contact & Locale" description="Phone number and default currency for cost reporting." icon={Phone}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone Number" hint="Include country code, e.g. +44 800 000 0000">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+44 800 000 0000"
                className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
          </Field>
          <Field label="Default Currency" hint="Used for fuel costs, toll charges, and expense reporting.">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border bg-background pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* ── Operational Settings ─────────────────────────────────────────────── */}
      <SectionCard title="Operational Settings" description="Configure zone distances and operational defaults." icon={MapPin}>
        <Field
          label="Parking Zone Max Distance (km)"
          hint="Maximum distance in km from the depot that counts as an approved parking zone."
        >
          <div className="flex items-center gap-4">
            <div className="relative w-40">
              <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                min={1}
                max={100}
                value={parkingZone}
                onChange={e => setParkingZone(Number(e.target.value))}
                className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={parkingZone}
              onChange={e => setParkingZone(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm font-medium text-muted-foreground w-12 text-right">{parkingZone} km</span>
          </div>
        </Field>
      </SectionCard>

      {/* ── Rota Planning ────────────────────────────────────────────────────── */}
      <SectionCard
        title="Rota Planning"
        description="Default hours used when building and validating driver shift allocations."
        icon={Clock}
      >
        {/* Pending API notice */}
        <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5">
          <FlaskConical className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Stored locally</span> —  these values guide Rota planning in this browser session. A future API update will persist them server-side.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Assumed Driving Hours */}
          <Field
            label="Assumed Driving Hours per Shift"
            hint="Max hours a driver is expected to spend actively driving in a single shift. Used to flag over-allocation in Rota."
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="relative w-28">
                  <Clock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    min={1}
                    max={13}
                    step={0.5}
                    value={drivingHours}
                    onChange={e => setDrivingHours(Math.min(13, Math.max(1, Number(e.target.value))))}
                    className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <input
                  type="range"
                  min={1}
                  max={13}
                  step={0.5}
                  value={drivingHours}
                  onChange={e => setDrivingHours(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-14 text-right text-sm font-medium tabular-nums text-muted-foreground">{drivingHours}h</span>
              </div>
              {/* Visual bar */}
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all"
                  style={{ width: `${(drivingHours / 13) * 100}%` }}
                />
              </div>
            </div>
          </Field>

          {/* Assumed Working Hours */}
          <Field
            label="Assumed Working Hours per Shift"
            hint="Total working hours per shift including breaks, loading, and non-driving time. Must be ≥ driving hours."
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="relative w-28">
                  <Clock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    min={drivingHours}
                    max={16}
                    step={0.5}
                    value={workingHours}
                    onChange={e => setWorkingHours(Math.min(16, Math.max(drivingHours, Number(e.target.value))))}
                    className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <input
                  type="range"
                  min={drivingHours}
                  max={16}
                  step={0.5}
                  value={workingHours}
                  onChange={e => setWorkingHours(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-14 text-right text-sm font-medium tabular-nums text-muted-foreground">{workingHours}h</span>
              </div>
              {/* Visual bar — two-tone: driving portion + working overhead */}
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex">
                <div
                  className="h-full rounded-l-full bg-sky-500 transition-all"
                  style={{ width: `${(drivingHours / 16) * 100}%` }}
                />
                <div
                  className="h-full bg-violet-400 transition-all"
                  style={{ width: `${((workingHours - drivingHours) / 16) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-sky-500" /> Driving ({drivingHours}h)</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-violet-400" /> Non-driving ({(workingHours - drivingHours).toFixed(1)}h)</span>
              </div>
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* ── Driver Permissions ───────────────────────────────────────────────── */}
      <SectionCard
        title="Driver Permissions"
        description="Control what drivers are allowed to do from the driver app."
        icon={Users}
      >
        <div className="flex flex-col gap-3">
          <PermissionRow
            icon={CalendarDays}
            title="Driver Can Create Holiday Requests"
            description="When enabled, drivers can submit holiday and leave requests directly from the driver app. Requests require manager approval before they are applied."
            on={driverHoliday}
            onChange={() => setDriverHoliday(v => !v)}
          />
          <PermissionRow
            icon={Car}
            title="Driver Can Report Issues"
            description="When enabled, drivers can log vehicle or operational issues from the driver app. Issues are visible to managers in the Issues module."
            on={driverIssue}
            onChange={() => setDriverIssue(v => !v)}
          />
        </div>
      </SectionCard>

      {/* ── Metadata ────────────────────────────────────────────────────────── */}
      {company && (
        <div className="rounded-xl border bg-muted/20 px-6 py-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Record Info</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            {[
              { label: "Slug", value: company.slug },
              { label: "Users", value: String(company.users_count) },
              { label: "Currency", value: company.currency ?? "—" },
              { label: "Joined", value: company.joined_at ? new Date(company.joined_at).toLocaleDateString("en-GB") : "—" },
              { label: "Last Updated", value: company.updated_at ? new Date(company.updated_at).toLocaleString("en-GB") : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-xs font-medium mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save button (bottom for convenience) */}
      <div className="flex justify-end pb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
    </div>
  )
}
