import { ontrackFetch } from "@/lib/ontrack-api"

const BASE = "/fleet-ops"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiDocumentType {
  uuid: string
  entity_type: "vehicle" | "driver"
  document_type: string
  is_static: boolean
  company_uuid: string | null
}

export interface ApiDocumentTypesResponse {
  success: boolean
  data: {
    vehicle: ApiDocumentType[]
    driver: ApiDocumentType[]
  }
}

export interface ApiBusinessCategory {
  uuid: string
  name: string
  is_static: boolean
  company_uuid: string | null
}

export interface ApiBusinessCategoriesResponse {
  success: boolean
  data: ApiBusinessCategory[]
}

export interface ApiEntity {
  uuid: string
  public_id?: string
  name: string
  // vehicle-specific
  vehicle_uuid?: string
  plate_number?: string
  make?: string
  model?: string
  year?: string
  // driver-specific
  driver_uuid?: string
}

export interface ApiEntitiesResponse {
  success: boolean
  data: ApiEntity[]
}

export interface ApiSignature {
  name: string
  signed_at: string
}

export interface ApiComplianceDocument {
  uuid: string
  company_uuid?: string
  title: string | null
  description: string | null
  notes: string | null
  entity_type: "vehicle" | "driver" | "business"
  vehicle_uuid: string | null
  driver_uuid: string | null
  documenttype_id: string | null
  document_type: { uuid: string; document_type: string; entity_type: string } | null
  category_id: string | null
  category: { uuid: string; name: string } | null
  expires_at: string | null
  days_remaining: number | null
  document_status: "valid" | "expiring_soon" | "expired" | "no_expiry"
  file_count: number
  file_uuid: string | null
  file_url: string | null
  file_name: string | null
  signer1_signature: ApiSignature | null
  signer2_signature: ApiSignature | null
  awaiting_signature: boolean
  uploaded_at: string | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface ApiDocumentTypeSummary {
  document_type: { uuid: string; document_type: string; entity_type: string }
  compliance: ApiComplianceDocument | null
}

export interface ApiEntityDocumentRow {
  entity: {
    uuid: string
    public_id: string
    name: string
    plate_number?: string
    make?: string
    model?: string
    year?: string
    status: string
  }
  document_types: ApiDocumentTypeSummary[]
}

export interface ApiCategoryDocumentRow {
  category: { uuid: string; name: string; is_static: boolean }
  compliance: ApiComplianceDocument | null
}

export interface ApiComplianceSummary {
  entity_type: string
  total: number
  with_documents: number
  without_documents: number
  expired: number
  expiring_soon: number
  awaiting_signatures: number
}

export interface ApiListComplianceDocsResponse {
  success: boolean
  summary: ApiComplianceSummary
  data: ApiEntityDocumentRow[] | ApiCategoryDocumentRow[]
  document_types?: ApiDocumentType[]
  categories?: ApiBusinessCategory[]
}

export interface ApiCreateComplianceDocRequest {
  company_uuid: string
  entity_type: "vehicle" | "driver" | "business"
  documenttype_id?: string
  vehicle_uuid?: string | null
  driver_uuid?: string | null
  category_id?: string
  custom_category_name?: string
  title?: string
  description?: string
  notes?: string
  expires_at?: string | null
  file_uuid?: string | null
  signer1_signature?: ApiSignature | null
  signer2_signature?: ApiSignature | null
}

export interface ApiUpdateComplianceDocRequest {
  title?: string
  description?: string
  notes?: string
  expires_at?: string | null
  file_uuid?: string | null
  documenttype_id?: string
  category_id?: string
  signer1_signature?: ApiSignature | null
  signer2_signature?: ApiSignature | null
}

// ─── Document Types API ───────────────────────────────────────────────────────

export function listDocumentTypes(params?: { company_uuid?: string }) {
  const qs = params?.company_uuid ? `?company_uuid=${params.company_uuid}` : ""
  return ontrackFetch<ApiDocumentTypesResponse>(
    `${BASE}/compliance-document-types${qs}`
  )
}

export function createDocumentType(body: {
  company_uuid: string
  entity_type: "vehicle" | "driver"
  document_type: string
}) {
  return ontrackFetch<{ success: boolean; data: ApiDocumentType }>(
    `${BASE}/compliance-document-types`,
    { method: "POST", body: JSON.stringify(body) }
  )
}

export function deleteDocumentType(id: string) {
  return ontrackFetch<{ success: boolean; message: string }>(
    `${BASE}/compliance-document-types/${id}`,
    { method: "DELETE" }
  )
}

// ─── Business Categories API ──────────────────────────────────────────────────

export function listBusinessCategories(params?: {
  company_uuid?: string
  for_filter?: boolean
}) {
  const p = new URLSearchParams()
  if (params?.company_uuid) p.set("company_uuid", params.company_uuid)
  if (params?.for_filter !== undefined) p.set("for_filter", String(params.for_filter))
  const qs = p.toString() ? `?${p.toString()}` : ""
  return ontrackFetch<ApiBusinessCategoriesResponse>(
    `${BASE}/compliance-business-categories${qs}`
  )
}

export function createBusinessCategory(body: {
  company_uuid: string
  name: string
}) {
  return ontrackFetch<{ success: boolean; data: ApiBusinessCategory }>(
    `${BASE}/compliance-business-categories`,
    { method: "POST", body: JSON.stringify(body) }
  )
}

export function deleteBusinessCategory(id: string) {
  return ontrackFetch<{ success: boolean; message: string }>(
    `${BASE}/compliance-business-categories/${id}`,
    { method: "DELETE" }
  )
}

// ─── Compliance Documents API ─────────────────────────────────────────────────

export function listEntities(params: {
  entity_type: "vehicle" | "driver" | "business"
  company_uuid?: string
}) {
  const p = new URLSearchParams({ entity_type: params.entity_type })
  if (params.company_uuid) p.set("company_uuid", params.company_uuid)
  return ontrackFetch<ApiEntitiesResponse>(
    `${BASE}/compliance-documents/entities?${p.toString()}`
  )
}

export function listComplianceDocs(params: {
  entity_type: "vehicle" | "driver" | "business"
  company_uuid?: string
  search?: string
  category_id?: string
  document_status?: "expired" | "expiring_soon" | "valid" | "no_expiry"
}) {
  const p = new URLSearchParams({ entity_type: params.entity_type })
  if (params.company_uuid) p.set("company_uuid", params.company_uuid)
  if (params.search) p.set("search", params.search)
  if (params.category_id) p.set("category_id", params.category_id)
  if (params.document_status) p.set("document_status", params.document_status)
  return ontrackFetch<ApiListComplianceDocsResponse>(
    `${BASE}/compliance-documents?${p.toString()}`
  )
}

export function getComplianceDoc(id: string) {
  return ontrackFetch<{ success: boolean; data: ApiComplianceDocument }>(
    `${BASE}/compliance-documents/${id}`
  )
}

export function createComplianceDoc(body: ApiCreateComplianceDocRequest) {
  return ontrackFetch<{ success: boolean; data: ApiComplianceDocument }>(
    `${BASE}/compliance-documents`,
    { method: "POST", body: JSON.stringify(body) }
  )
}

export function updateComplianceDoc(id: string, body: ApiUpdateComplianceDocRequest) {
  return ontrackFetch<{ success: boolean; data: ApiComplianceDocument }>(
    `${BASE}/compliance-documents/${id}`,
    { method: "PUT", body: JSON.stringify(body) }
  )
}

export function deleteComplianceDoc(id: string) {
  return ontrackFetch<{ success: boolean; message: string }>(
    `${BASE}/compliance-documents/${id}`,
    { method: "DELETE" }
  )
}
