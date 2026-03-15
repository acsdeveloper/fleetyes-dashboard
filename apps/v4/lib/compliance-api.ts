/**
 * FleetYes Compliance Hub — API Client
 * Base URL: /api/v1
 * Auth: Bearer token injected by apiFetch helper
 * All functions are async and throw on non-2xx responses.
 */

// ─── Base fetch helper ─────────────────────────────────────────────────────────

const BASE = "/api/v1"

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined"
    ? (window as Window & { __fleetyes_token?: string }).__fleetyes_token ?? ""
    : ""

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...((options.headers as Record<string, string>) ?? {}),
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err?.message ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/** Multipart/form-data POST — no Content-Type header (browser sets boundary) */
async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  const token = typeof window !== "undefined"
    ? (window as Window & { __fleetyes_token?: string }).__fleetyes_token ?? ""
    : ""

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err?.message ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── Shared types ──────────────────────────────────────────────────────────────

export interface LicenceEntitlement {
  category: string
  expiryDate: string
  restrictions: string
}

export interface DriverEndorsement {
  code: string
  offence: string
  points: number
  convictionDate: string
  expiryDate: string
}

export interface LicenceCheck {
  date: string
  result: "clear" | "points_added" | "disqualified"
  approvedBy: string
  notes: string
}

export interface CpcModule {
  id: string
  date: string
  subject: string
  provider: string
  atpRef: string
  hours: number
}

export interface TrainingRecord {
  id?: string
  type: string
  heldSince: string
  expiry: string | null
  certNumber: string
  issuer: string
  detail: string
}

export interface Driver {
  id: string
  name: string
  licence: string
  licenceNumber: string
  licenceStatus: "valid" | "expired" | "revoked" | "disqualified"
  photoCardExpiry: string
  points: number
  expiry: string
  tachoCardRef: string
  tachoCardExpiry: string
  davisRiskScore: number
  risk: "low" | "medium" | "high"
  recheckFrequency: string
  lastChecked: string
  nextCheckDue: string
  consentDate: string
  dqcNumber: string
  dqcExpiry: string
  cpcCycleStart: string
  cpcCycleEnd: string
  cpcHours: number
  cpcDeadline: string
  rtwRequires: boolean
  rtw: string | null
  visaType: string | null
  visaExp: string | null
  shareCodeVerified: string | null
  adr: boolean
  adrExp: string
  // Sub-arrays — only present in GET /drivers/{id}
  entitlements?: LicenceEntitlement[]
  endorsements?: DriverEndorsement[]
  checkHistory?: LicenceCheck[]
  cpcModules?: CpcModule[]
  training?: TrainingRecord[]
}

export interface Vehicle {
  reg: string
  make: string
  mot: string
  tacho: string
  loler: string | null
  lolerType: string | null
}

export interface FileRecord {
  id: string
  name: string
  uploadedAt: string
  url?: string
}

export interface CellData {
  expiry: string
  sigA: boolean
  sigB: boolean
  files: FileRecord[]
}

export type CellMap = Record<string, Record<string, CellData>>

export interface DocColumn {
  id: string
  name: string
}

export interface WalkaroundCheckItem {
  name: string
  result: "ok" | "advisory" | "fail"
  note: string | null
  photoUrl: string | null
  severity: string | null
}

export interface WalkaroundCheckSection {
  section: string
  items: WalkaroundCheckItem[]
}

export interface WalkaroundCheckSummary {
  id: string
  reg: string
  driverId: string
  driverName: string
  date: string
  time: string
  elapsedSeconds: number
  defects: number
  status: "clear" | "defect"
  latitude: number
  longitude: number
}

export interface WalkaroundCheckDetail extends WalkaroundCheckSummary {
  antiCheatPhoto: { prompt: string; url: string }
  location: string
  signature: string
  signedAt: string
  sections: WalkaroundCheckSection[]
}

export interface PmiSummary {
  id: string
  reg: string
  scheduledDate: string
  status: "scheduled" | "in_progress" | "completed" | "overdue"
  technicianId: string
  technicianName: string
  intervalWeeks: number
}

export interface PmiDetail extends PmiSummary {
  startedAt: string | null
  completedAt: string | null
  signature: string | null
  location: string
  checklistSections: WalkaroundCheckSection[]
  brakeTest: { efficiency: number; imbalance: number; result: "pass" | "fail" } | null
}

export interface Incident {
  id: string
  date: string
  driverId: string
  driverName: string
  reg: string
  type: string
  status: string
  desc: string
  fnolReportUrl: string | null
}

export interface TachoInfringement {
  id: string
  driverId: string
  driverName: string
  date: string
  type: string
  hours: string
  severity: "Minor" | "Serious" | "Very Serious"
}

export interface CompanyDocument {
  id: string
  cat: string
  name: string
  expiry: string | null
  signed: boolean
  status: "ok" | "expiring" | "pending" | "expired"
  files?: FileRecord[]
}

export interface Organisation {
  id: string
  name: string
  olicenceLimit: number
  forsEnabled: boolean
  earnedRecognitionEnabled: boolean
}

export interface ExpiryAlertRule {
  id: string
  categoryId: string
  name: string
  earlyWarning: string
  reminder: string
  who: "cm_first" | "all"
  emailEnabled: boolean
  mobileEnabled: boolean
}

export interface EventAlertRule {
  id: string
  categoryId: string
  name: string
  who: "cm_first" | "all"
  emailEnabled: boolean
  mobileEnabled: boolean
}

export interface NotificationSettings {
  complianceManagerId: string | null
  emailEnabled: boolean
  mobileEnabled: boolean
  dailyDigestEnabled: boolean
  dailyDigestTime: string
  expiryRules: ExpiryAlertRule[]
  eventRules: EventAlertRule[]
}

export interface IntegrationConfig {
  id: string
  status: "connected" | "disconnected" | "coming_soon"
  lastSync?: string
  config: Record<string, string>
}

export type AuditSeverity = "create" | "edit" | "upload" | "delete" | "sign" | "alert" | "approve"
export type AuditCategory = "vehicle" | "driver" | "document" | "walkaround" | "pmi" | "settings" | "system"

export interface AuditEvent {
  id: string
  ts: string
  userId: string
  userName: string
  userInitials: string
  action: string
  desc: string
  category: AuditCategory
  categoryLabel: string
  severity: AuditSeverity
  before: string | null
  after: string | null
}

export interface AdminUser {
  id: string
  name: string
  initials: string
  email: string
  mobile: string
  isComplianceManager: boolean
}

export interface WalkaroundStats {
  todayChecked: number
  todayDefects: number
  avgElapsedSeconds: number
  pendingVehicles: string[]
}

// ─── 1. Drivers ───────────────────────────────────────────────────────────────

export const driversApi = {
  list: () =>
    apiFetch<Driver[]>("/drivers"),

  get: (id: string) =>
    apiFetch<Required<Driver>>(`/drivers/${id}`),

  create: (data: Partial<Driver>) =>
    apiFetch<Driver>("/drivers", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Driver>) =>
    apiFetch<Driver>(`/drivers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  /** Trigger a DAVIS DVLA check via backend proxy */
  dvlaCheck: (id: string) =>
    apiFetch<{
      licenceStatus: Driver["licenceStatus"]
      points: number
      endorsements: DriverEndorsement[]
      entitlements: LicenceEntitlement[]
      photoCardExpiry: string
      davisRiskScore: number
      risk: Driver["risk"]
      recheckFrequency: string
      nextCheckDue: string
      checkedAt: string
      approvedBy: string
    }>(`/drivers/${id}/dvla-check`, { method: "POST" }),

  addCpcModule: (id: string, module: Omit<CpcModule, "id">) =>
    apiFetch<CpcModule>(`/drivers/${id}/cpc-modules`, {
      method: "POST",
      body: JSON.stringify(module),
    }),

  addTraining: (id: string, record: Omit<TrainingRecord, "id">) =>
    apiFetch<TrainingRecord>(`/drivers/${id}/training`, {
      method: "POST",
      body: JSON.stringify(record),
    }),

  deleteTraining: (id: string, trainingId: string) =>
    apiFetch<void>(`/drivers/${id}/training/${trainingId}`, { method: "DELETE" }),

  uploadRtwDocument: (id: string, file: File, meta: { documentType: string; verifiedBy: string; verifiedAt: string }) => {
    const form = new FormData()
    form.append("file", file)
    form.append("documentType", meta.documentType)
    form.append("verifiedBy", meta.verifiedBy)
    form.append("verifiedAt", meta.verifiedAt)
    return apiUpload<{ url: string; uploadedAt: string }>(`/drivers/${id}/rtw-documents`, form)
  },
}

// ─── 2. Vehicles ──────────────────────────────────────────────────────────────

export const vehiclesApi = {
  list: () =>
    apiFetch<Vehicle[]>("/vehicles"),

  create: (data: Omit<Vehicle, "reg"> & { reg: string }) =>
    apiFetch<Vehicle>("/vehicles", { method: "POST", body: JSON.stringify(data) }),

  update: (reg: string, data: Partial<Vehicle>) =>
    apiFetch<Vehicle>(`/vehicles/${reg}`, { method: "PATCH", body: JSON.stringify(data) }),
}

// ─── 3. Compliance Document Matrix ────────────────────────────────────────────

export const matrixApi = {
  getVehicles: () =>
    apiFetch<{ columns: DocColumn[]; cells: CellMap }>("/compliance-matrix/vehicles"),

  getDrivers: () =>
    apiFetch<{ columns: DocColumn[]; cells: CellMap }>("/compliance-matrix/drivers"),

  saveVehicleCell: (reg: string, colId: string, data: Pick<CellData, "expiry" | "sigA" | "sigB">) =>
    apiFetch<CellData>(`/compliance-matrix/vehicles/${reg}/${colId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  saveDriverCell: (driverId: string, colId: string, data: Pick<CellData, "expiry" | "sigA" | "sigB">) =>
    apiFetch<CellData>(`/compliance-matrix/drivers/${driverId}/${colId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  uploadVehicleFile: (reg: string, colId: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiUpload<FileRecord>(`/compliance-matrix/vehicles/${reg}/${colId}/files`, form)
  },

  uploadDriverFile: (driverId: string, colId: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiUpload<FileRecord>(`/compliance-matrix/drivers/${driverId}/${colId}/files`, form)
  },

  deleteVehicleFile: (reg: string, colId: string, fileId: string) =>
    apiFetch<{ success: boolean; newCurrent: FileRecord | null }>(
      `/compliance-matrix/vehicles/${reg}/${colId}/files/${fileId}`,
      { method: "DELETE" }
    ),

  addVehicleColumn: (name: string) =>
    apiFetch<DocColumn>("/compliance-matrix/columns/vehicles", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  addDriverColumn: (name: string) =>
    apiFetch<DocColumn>("/compliance-matrix/columns/drivers", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  deleteVehicleColumn: (colId: string) =>
    apiFetch<{ success: boolean }>(`/compliance-matrix/columns/vehicles/${colId}`, { method: "DELETE" }),

  deleteDriverColumn: (colId: string) =>
    apiFetch<{ success: boolean }>(`/compliance-matrix/columns/drivers/${colId}`, { method: "DELETE" }),
}

// ─── 4. Walkaround Checks ─────────────────────────────────────────────────────

export const walkaroundApi = {
  list: (date?: string) =>
    apiFetch<WalkaroundCheckSummary[]>(`/walkaround-checks${date ? `?date=${date}` : ""}`),

  get: (id: string) =>
    apiFetch<WalkaroundCheckDetail>(`/walkaround-checks/${id}`),

  /** Aggregated KPIs: today's count, defects, avg elapsed, pending vehicles */
  stats: (date?: string) =>
    apiFetch<WalkaroundStats>(`/walkaround-checks/stats${date ? `?date=${date}` : ""}`),

  /** Download PDF report for a completed check */
  downloadPdf: (id: string) =>
    fetch(`${BASE}/walkaround-checks/${id}/pdf`, {
      headers: { Authorization: `Bearer ${(window as Window & { __fleetyes_token?: string }).__fleetyes_token ?? ""}` },
    }).then(r => r.blob()),

  submit: (payload: {
    reg: string
    driverId: string
    startedAt: string
    elapsedSeconds: number
    latitude: number
    longitude: number
    signature: string
    antiCheatPhotoPrompt: string
    sections: WalkaroundCheckSection[]
  }) =>
    apiFetch<{ id: string; status: "clear" | "defect"; defects: number; vorRaised: boolean; alertsSent: string[] }>(
      "/walkaround-checks",
      { method: "POST", body: JSON.stringify(payload) }
    ),

  uploadPhoto: (checkId: string, file: File, itemName: string, type: "evidence" | "anticheat") => {
    const form = new FormData()
    form.append("file", file)
    form.append("itemName", itemName)
    form.append("type", type)
    return apiUpload<{ url: string; itemName: string; uploadedAt: string }>(
      `/walkaround-checks/${checkId}/photos`,
      form
    )
  },
}

// ─── 5. PMI Inspections ───────────────────────────────────────────────────────

export const pmiApi = {
  list: (reg?: string) =>
    apiFetch<PmiSummary[]>(`/pmi-inspections${reg ? `?reg=${reg}` : ""}`),

  get: (id: string) =>
    apiFetch<PmiDetail>(`/pmi-inspections/${id}`),

  schedule: (payload: { reg: string; scheduledDate: string; technicianId: string; intervalWeeks: number }) =>
    apiFetch<PmiSummary>("/pmi-inspections", { method: "POST", body: JSON.stringify(payload) }),

  submit: (
    id: string,
    payload: {
      signature: string
      signedAt: string
      checklistSections: WalkaroundCheckSection[]
      brakeTest: { efficiency: number; imbalance: number }
      status: "completed"
    }
  ) => apiFetch<{ id: string; status: string; nextDueDate: string }>(`/pmi-inspections/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }),

  uploadPhoto: (id: string, file: File, itemName: string, sectionName: string) => {
    const form = new FormData()
    form.append("file", file)
    form.append("itemName", itemName)
    form.append("sectionName", sectionName)
    return apiUpload<{ url: string; uploadedAt: string }>(`/pmi-inspections/${id}/photos`, form)
  },
}

// ─── 6. Company Documents ─────────────────────────────────────────────────────

export const documentsApi = {
  list: (category?: string) =>
    apiFetch<CompanyDocument[]>(`/documents${category ? `?category=${encodeURIComponent(category)}` : ""}`),

  update: (id: string, data: Partial<Pick<CompanyDocument, "expiry" | "signed" | "status">>) =>
    apiFetch<CompanyDocument>(`/documents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  uploadFile: (id: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiUpload<FileRecord>(`/documents/${id}/files`, form)
  },
}

// ─── 7. Accidents / FNOL ──────────────────────────────────────────────────────

export const incidentsApi = {
  list: () =>
    apiFetch<Incident[]>("/incidents"),

  report: (payload: {
    date: string
    driverId: string
    reg: string
    type: string
    desc: string
    thirdPartyInvolved: boolean
    injuries: boolean
    location: string
    latitude?: number
    longitude?: number
  }) => apiFetch<Incident>("/incidents", { method: "POST", body: JSON.stringify(payload) }),

  uploadPhoto: (incidentId: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiUpload<FileRecord>(`/incidents/${incidentId}/photos`, form)
  },

  /** Download the generated FNOL PDF report */
  downloadReport: (incidentId: string) =>
    fetch(`${BASE}/incidents/${incidentId}/report`, {
      headers: { Authorization: `Bearer ${(window as Window & { __fleetyes_token?: string }).__fleetyes_token ?? ""}` },
    }).then(r => r.blob()),
}

// ─── 8. Tachograph Infringements ──────────────────────────────────────────────

export const tachoApi = {
  infringements: (days = 30) =>
    apiFetch<TachoInfringement[]>(`/tachograph/infringements?days=${days}`),
}

// ─── 9. Organisation ──────────────────────────────────────────────────────────

export const organisationApi = {
  get: () =>
    apiFetch<Organisation>("/organisation"),

  update: (data: Partial<Organisation>) =>
    apiFetch<Organisation>("/organisation", { method: "PATCH", body: JSON.stringify(data) }),
}

// ─── 10. Notification Settings ────────────────────────────────────────────────

export const notificationSettingsApi = {
  get: () =>
    apiFetch<NotificationSettings>("/notification-settings"),

  save: (settings: NotificationSettings) =>
    apiFetch<NotificationSettings>("/notification-settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  testSend: (channel: "email" | "mobile", recipientId: string) =>
    apiFetch<{ sent: boolean; deliveredTo: string }>("/notification-settings/test-send", {
      method: "POST",
      body: JSON.stringify({ channel, recipientId }),
    }),
}

// ─── 11. Integrations ─────────────────────────────────────────────────────────

export const integrationsApi = {
  list: () =>
    apiFetch<IntegrationConfig[]>("/integrations"),

  save: (id: string, config: Record<string, string>) =>
    apiFetch<IntegrationConfig>(`/integrations/${id}`, {
      method: "PUT",
      body: JSON.stringify(config),
    }),

  test: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/integrations/${id}/test`, { method: "POST" }),

  disconnect: (id: string) =>
    apiFetch<{ id: string; status: "disconnected" }>(`/integrations/${id}`, { method: "DELETE" }),
}

// ─── 12. Audit Log ────────────────────────────────────────────────────────────

export interface AuditLogFilters {
  category?: AuditCategory
  severity?: AuditSeverity
  userId?: string
  from?: string   // YYYY-MM-DD
  to?: string     // YYYY-MM-DD
  q?: string
}

export const auditLogApi = {
  list: (filters: AuditLogFilters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString()
    return apiFetch<AuditEvent[]>(`/audit-log${qs ? `?${qs}` : ""}`)
  },

  write: (event: {
    action: string
    desc: string
    category: AuditCategory
    severity: AuditSeverity
    before?: string | null
    after?: string | null
    entityType?: string
    entityId?: string
  }) =>
    apiFetch<AuditEvent>("/audit-log", { method: "POST", body: JSON.stringify(event) }),

  export: (format: "csv" | "pdf", filters: AuditLogFilters = {}) => {
    const qs = new URLSearchParams({
      format,
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined)),
    }).toString()
    return fetch(`${BASE}/audit-log/export?${qs}`, {
      headers: { Authorization: `Bearer ${(window as Window & { __fleetyes_token?: string }).__fleetyes_token ?? ""}` },
    }).then(r => r.blob())
  },
}

// ─── 13. Reports ──────────────────────────────────────────────────────────────

export const reportsApi = {
  /** Generate a FORS / Earned Recognition self-assessment report */
  generateFors: () =>
    fetch(`${BASE}/reports/fors`, {
      method: "POST",
      headers: { Authorization: `Bearer ${(window as Window & { __fleetyes_token?: string }).__fleetyes_token ?? ""}` },
    }).then(r => r.blob()),
}

// ─── 14. Admin Users ──────────────────────────────────────────────────────────

export const adminUsersApi = {
  list: () =>
    apiFetch<AdminUser[]>("/admin-users"),
}
