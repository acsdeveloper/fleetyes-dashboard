/**
 * Company Settings API — /int/v1/companies/{uuid}
 * File Upload API   — /int/v1/files/upload
 */
import { ontrackFetch, getCompanyUuid } from "./ontrack-api"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompanySettings {
  uuid: string
  public_id: string
  name: string
  description: string | null
  phone: string | null
  users_count: number
  timezone: string | null
  logo_url: string | null
  slug: string
  status: string | null
  joined_at: string
  updated_at: string
  created_at: string
  parking_zone_max_distance: number | null
  driver_can_create_holiday: boolean
  driver_can_create_issue: boolean
  currency: string | null
}

export interface CompanySettingsUpdatePayload {
  name?: string
  description?: string
  phone?: string
  currency?: string
  logo_uuid?: string
  parking_zone_max_distance?: number
  driver_can_create_holiday?: boolean
  driver_can_create_issue?: boolean
}

export interface UploadedFile {
  uuid: string
  url: string
  original_filename: string
  content_type: string
}

// ─── API functions ────────────────────────────────────────────────────────────

/** Fetch the company settings for the currently authenticated company. */
export async function getCompanySettings(): Promise<CompanySettings> {
  const uuid = getCompanyUuid()
  if (!uuid) throw new Error("No company UUID found in session.")
  const res = await ontrackFetch<{ company: CompanySettings }>(`/companies/${uuid}`)
  return res.company
}

/** Update company settings. */
export async function updateCompanySettings(
  payload: CompanySettingsUpdatePayload
): Promise<CompanySettings> {
  const uuid = getCompanyUuid()
  if (!uuid) throw new Error("No company UUID found in session.")
  const res = await ontrackFetch<{ company: CompanySettings }>(`/companies/${uuid}`, {
    method: "PUT",
    body: JSON.stringify({ company: payload }),
  })
  return res.company
}

/** Upload a logo file and return the file UUID. */
export async function uploadLogo(file: File): Promise<UploadedFile> {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("type", "logo")
  fd.append("path", "logo")
  const res = await ontrackFetch<{ file: UploadedFile }>("/files/upload", {
    method: "POST",
    body: fd,
  })
  return res.file
}

/** Common currencies list for the dropdown. */
export const CURRENCIES = [
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "USD", label: "US Dollar (USD)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "PLN", label: "Polish Zloty (PLN)" },
]
