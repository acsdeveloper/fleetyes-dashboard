/**
 * Toll Receipt Images API — /int/v1/expense-receipt-images
 */
import { ontrackFetch, buildQueryString, getToken } from "./ontrack-api"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TollReceiptExtractedData {
  total_amount?: string
  currency?: string
  transaction_date?: string
  transaction_time?: string
  parsed_date?: string
  parsed_time?: string
  parsed_vehicle_vrn?: string
  vehicle_number?: string
  entry_point?: string
  exit_point?: string
  vehicle_class?: string
  raw_text?: string
}

export interface TollReceiptImage {
  uuid: string
  company_uuid?: string
  driver_uuid?: string
  driver_name?: string
  reference_id?: number
  file_path?: string
  file_uuid?: string
  is_duplicate?: boolean
  geofence_status?: string | null
  captured_at?: string
  status: "pending" | "processed" | "failed" | "duplicate"
  sync_status?: "online" | "offline_synced" | null
  latitude?: string | number
  longitude?: string | number
  location_name?: string
  toll_location?: string
  crossing_date?: string
  extracted_data?: TollReceiptExtractedData
  product?: string
  amount?: string
  currency?: string
  product_volume?: string
  driver?: { uuid: string; name: string }
  file?: { uuid: string; path?: string; url?: string }
  created_at: string
  updated_at: string
}

export interface TollReceiptListResponse {
  expense_receipt_images: TollReceiptImage[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface TollZipImportResult {
  success: boolean
  partial_success?: boolean
  message?: string
  inserted_count?: number
  total_processed?: number
  errors?: [string, string, string][]
  processed_files?: {
    filename: string
    processed: number
    created: number
    status?: string
    message?: string
  }[]
  status?: string
}

// ─── List / Filter ────────────────────────────────────────────────────────────

export async function listTollReceipts(params: {
  page?: number
  limit?: number
  sort?: string
  driver_uuid?: string
  status?: string
  sync_status?: string
  start_date?: string
  end_date?: string
  deleted?: 0 | 1
} = {}): Promise<TollReceiptListResponse> {
  const merged = { page: 1, limit: 50, sort: "-created_at", ...params }
  const qs = buildQueryString(merged as Record<string, string | number | boolean | undefined | null>)
  return ontrackFetch<TollReceiptListResponse>(`/expense-receipt-images${qs}`)
}

// ─── Single Record ────────────────────────────────────────────────────────────

export async function getTollReceipt(id: string): Promise<{ expense_receipt_image: TollReceiptImage }> {
  return ontrackFetch<{ expense_receipt_image: TollReceiptImage }>(`/expense-receipt-images/${id}`)
}

// ─── Upload Single Image or PDF ───────────────────────────────────────────────

export async function uploadTollFile(file: File): Promise<{ uuid: string; original_filename?: string; url?: string }> {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("type", "toll_import")
  const token = getToken()
  const res = await fetch("https://ontrack-api.agilecyber.com/int/v1/files/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!res.ok) throw new Error("File upload failed")
  const body = await res.json()
  // API returns either { uuid, url } (flat) or { file: { uuid, url, ... } } (nested)
  const fileObj = body?.file ?? body
  if (!fileObj?.uuid) throw new Error("Upload response missing file UUID")
  return { uuid: fileObj.uuid, original_filename: fileObj.original_filename, url: fileObj.url }
}

// ─── Import Single Image/PDF (via fuel-reports/import) ───────────────────────

export async function importTollImage(fileUuids: string[]): Promise<TollZipImportResult> {
  return ontrackFetch<TollZipImportResult>("/fuel-reports/import", {
    method: "POST",
    body: JSON.stringify({ files: fileUuids }),
  })
}

// ─── Bulk Upload ZIP ──────────────────────────────────────────────────────────

export async function importTollZip(
  fileUuids: string[],
  parentUuid?: string
): Promise<TollZipImportResult> {
  return ontrackFetch<TollZipImportResult>("/toll-zip-import/import", {
    method: "POST",
    body: JSON.stringify({
      files: fileUuids,
      ...(parentUuid ? { uuid: parentUuid } : {}),
    }),
  })
}

// ─── Process Toll Receipts ────────────────────────────────────────────────────
// Triggers OCR processing for pending toll receipt images (including those
// linked from manually-entered toll expense records).

export interface ProcessTollReceiptsResult {
  status: string
  message: string
  data?: {
    processed: number
    created: number
    skipped: number
    total_errors?: number
    errors?: [string, string][]
  }
}

export async function processTollReceipts(params: {
  driver_uuid?: string
  date_from?: string
  date_to?: string
  limit?: number
} = {}): Promise<ProcessTollReceiptsResult> {
  return ontrackFetch<ProcessTollReceiptsResult>(
    "/expense-reports/process-toll-receipt-images",
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  )
}

// ─── Static Values ────────────────────────────────────────────────────────────

export const TOLL_RECEIPT_STATUSES = [
  { value: "pending",   label: "Pending"   },
  { value: "processed", label: "Processed" },
  { value: "failed",    label: "Failed"    },
  { value: "duplicate", label: "Duplicate" },
]

export const TOLL_SYNC_STATUSES = [
  { value: "online",         label: "Online"         },
  { value: "offline_synced", label: "Offline Synced" },
]
