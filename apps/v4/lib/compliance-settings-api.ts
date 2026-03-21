/**
 * OnTrack Compliance Settings API — Typed Client
 *
 * Base: /int/v1/fleet-ops/compliance-settings
 *
 * Endpoints:
 *  1. GET  /users              — list compliance manager candidates
 *  2. GET  /                   — get compliance settings
 *  3. POST /save               — save compliance settings
 *  4. GET  /alerts             — get alert configurations
 *  5. POST /alerts/save        — save alert configurations
 *  6. POST /test-notification  — send test notification
 */

import { ontrackFetch, buildQueryString } from "./ontrack-api"

const BASE = "/fleet-ops/compliance-settings"

// ═══════════════════════════════════════════════════════════════════════════════
// API TYPES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Users (Compliance Manager Candidates) ──────────────────────────────────

export interface ApiComplianceUser {
  uuid: string
  public_id: string
  name: string
  email: string
  phone: string | null
  avatar_uuid: string | null
  status: string
  created_at: string
}

export interface ApiComplianceUsersResponse {
  complianceManagers: ApiComplianceUser[]
  total: number
  role_used: string
}

// ─── Compliance Settings ────────────────────────────────────────────────────

export interface ApiComplianceManager {
  uuid: string
  name: string
  email: string
  phone: string | null
  avatar_uuid: string | null
}

export interface ApiComplianceSetting {
  uuid: string
  company_uuid: string
  compliance_manager_id: string
  escalation_days: number
  record_status: number
  created_at: string
  manager: ApiComplianceManager
}

export interface ApiNotificationChannel {
  uuid: string
  channel_type: "email" | "push"
  is_enabled: boolean
  recipient_uuids: string[]
}

export interface ApiDailyDigest {
  uuid: string
  is_active: boolean
  delivery_time: string
  include_operational_events: boolean
  created_at: string
}

export interface ApiGetSettingsResponse {
  complianceSetting: ApiComplianceSetting | null
  notificationChannels: ApiNotificationChannel[]
  dailyDigest: ApiDailyDigest | null
}

// ─── Save Settings ──────────────────────────────────────────────────────────

export interface ApiSaveSettingsRequest {
  compliance_manager_id?: string
  escalation_days?: number
  notification_channels?: {
    channel_type: "email" | "push"
    is_enabled: boolean
    recipient_uuids: string[]
  }[]
  daily_digest?: {
    is_active: boolean
    delivery_time: string
    include_operational_events: boolean
  }
}

export interface ApiSaveSettingsResponse {
  success: boolean
  complianceSetting: ApiComplianceSetting | null
  notificationChannels: ApiNotificationChannel[] | null
  dailyDigest: ApiDailyDigest | null
}

// ─── Alert Configurations ───────────────────────────────────────────────────

export interface ApiExpiryAlert {
  uuid: string
  company_uuid: string
  document_category: string
  document_type: string
  document_type_uuid: string | null
  early_warning_days: number
  reminder_days: number
  seven_day_enabled: boolean
  email_enabled: boolean
  mobile_enabled: boolean
  record_status: number
}

export interface ApiEventAlert {
  uuid: string
  event_category: string
  event_type: string
  when_type: string
  email_enabled: boolean
  mobile_enabled: boolean
}

export interface ApiGetAlertsResponse {
  expiryAlerts: ApiExpiryAlert[]
  eventAlerts: ApiEventAlert[]
}

// ─── Save Alerts ────────────────────────────────────────────────────────────

export interface ApiSaveAlertsRequest {
  expiry_alerts?: {
    document_category: string
    document_type: string
    early_warning_days: number
    reminder_days: number
    seven_day_enabled: number | boolean
    email_enabled: number | boolean
    mobile_enabled: number | boolean
  }[]
  event_alerts?: {
    event_category: string
    event_type: string
    when_type: string
    email_enabled: number | boolean
    mobile_enabled: number | boolean
  }[]
}

export interface ApiSaveAlertsResponse {
  success: boolean
  expiryAlerts: ApiExpiryAlert[]
  eventAlerts: ApiEventAlert[]
}

// ─── Test Notification ──────────────────────────────────────────────────────

export interface ApiTestNotificationRequest {
  channel: "email" | "push"
  email?: string | string[]
  phone?: string | string[]
}

export interface ApiTestNotificationResponse {
  success: boolean
  message: string
  errors: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function listComplianceManagerCandidates(params?: {
  search?: string
  paginate?: boolean
  per_page?: number
}) {
  const qs = buildQueryString(params ?? {})
  return ontrackFetch<ApiComplianceUsersResponse>(`${BASE}/users${qs}`)
}

export function getComplianceSettings() {
  return ontrackFetch<ApiGetSettingsResponse>(`${BASE}`)
}

export function saveComplianceSettings(data: ApiSaveSettingsRequest) {
  return ontrackFetch<ApiSaveSettingsResponse>(`${BASE}/save`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function getAlertConfigurations() {
  return ontrackFetch<ApiGetAlertsResponse>(`${BASE}/alerts`)
}

export function saveAlertConfigurations(data: ApiSaveAlertsRequest) {
  return ontrackFetch<ApiSaveAlertsResponse>(`${BASE}/alerts/save`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function sendTestNotification(data: ApiTestNotificationRequest) {
  return ontrackFetch<ApiTestNotificationResponse>(`${BASE}/test-notification`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}
