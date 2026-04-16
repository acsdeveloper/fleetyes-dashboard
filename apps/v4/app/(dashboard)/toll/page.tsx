"use client"

import * as React from "react"
import {
  Search, Download, Plus, RefreshCw, X, Loader2,
  AlertCircle, Trash2, Upload, CheckCircle2, XCircle, FileText,
  Filter, Send, Eye, ImageIcon, Receipt, CreditCard,
  History, ChevronLeft, ChevronRight,
} from "lucide-react"
import { createOcrWorker, type OcrResult, ocrBadgeClass, ocrBadgeLabel, fileKey } from "@/lib/ocr-quality"
import { useLang } from "@/components/lang-context"
import { useConfirm } from "@/components/confirm-dialog"
import JSZip from "jszip"

// ── Toll Receipts API ─────────────────────────────────────────────────────────
import {
  listTollReceipts, uploadTollFile, importTollZip,
  processTollReceipts,
  TOLL_RECEIPT_STATUSES,
  type TollReceiptImage,
} from "@/lib/toll-receipts-api"

// ── Toll Expenses API ─────────────────────────────────────────────────────────
import {
  listTollReports, createTollReport, updateTollReport,
  deleteTollReport, bulkDeleteFuelReports, exportFuelReports,
  uploadReportFile, importTollReports,
  listTollImportHistory,
  TOLL_DIRECTIONS, AMAZON_STATUSES,
  type TollReport, type CreateTollPayload, type TollImportHistoryItem,
} from "@/lib/fuel-reports-api"

import {
  sendToAmazon,
} from "@/lib/fuel-reports-api"

import { listVehicles, type Vehicle } from "@/lib/vehicles-api"
import { listDrivers, type Driver } from "@/lib/drivers-api"

import { AgGridReact } from "ag-grid-react"
import {
  type ColDef, type ICellRendererParams,
  ModuleRegistry, AllCommunityModule, themeQuartz,
} from "ag-grid-community"
ModuleRegistry.registerModules([AllCommunityModule])

// ─── AG Grid themes ───────────────────────────────────────────────────────────

const _base = {
  fontFamily: "var(--font-sans, 'Montserrat', 'Inter', system-ui, sans-serif)",
  fontSize: 13, rowHeight: 39, headerHeight: 38,
  backgroundColor: "var(--background, #ffffff)", foregroundColor: "var(--foreground, #1a1a1a)",
  headerBackgroundColor: "var(--muted, #f5f5f5)", headerTextColor: "var(--muted-foreground, #666666)",
  borderColor: "var(--border, #e5e7eb)", rowBorder: false, wrapperBorder: false,
  headerRowBorder: false, columnBorder: false,
  cellHorizontalPaddingScale: 1.1, rowVerticalPaddingScale: 1,
  selectedRowBackgroundColor: "var(--accent, #f0f0f0)", gridSize: 5, scrollbarWidth: 6,
}
const lightTheme = themeQuartz.withParams({ ..._base, backgroundColor: "#ffffff", foregroundColor: "#1f2933", headerBackgroundColor: "#f9fafb", headerTextColor: "#39485d", borderColor: "#eff0f1", rowHoverColor: "#f5f7fb", selectedRowBackgroundColor: "#edf2ff" })
const darkTheme  = themeQuartz.withParams({ ..._base, backgroundColor: "#141414", foregroundColor: "#e5e5e5", headerBackgroundColor: "#1e2531", headerTextColor: "#c9d0da",  borderColor: "#2a2a2a",  rowHoverColor: "#1f2937", selectedRowBackgroundColor: "#1e3a5f" })

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso?: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
    + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Status pill style maps ───────────────────────────────────────────────────

const REC_STATUS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  pending:   { bg: "bg-amber-50 dark:bg-amber-900/20",    border: "border-amber-300/70",    text: "text-amber-800 dark:text-amber-300",    dot: "bg-amber-500" },
  processed: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-300/70", text: "text-emerald-800 dark:text-emerald-300", dot: "bg-emerald-500" },
  failed:    { bg: "bg-red-50 dark:bg-red-900/20",         border: "border-red-300/70",      text: "text-red-700 dark:text-red-400",         dot: "bg-red-500" },
  duplicate: { bg: "bg-slate-50 dark:bg-slate-800/40",     border: "border-slate-300/70",    text: "text-slate-700 dark:text-slate-300",     dot: "bg-slate-400" },
}

const AMZ_STATUS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  new:       { bg: "bg-amber-50 dark:bg-amber-900/20",    border: "border-amber-300/70",    text: "text-amber-800 dark:text-amber-300",    dot: "bg-amber-500" },
  unseen:    { bg: "bg-blue-50 dark:bg-blue-900/20",      border: "border-blue-300/70",     text: "text-blue-800 dark:text-blue-300",      dot: "bg-blue-500" },
  seen:      { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-300/70", text: "text-emerald-800 dark:text-emerald-300", dot: "bg-emerald-500" },
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECEIPTS TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Receipt Detail Drawer ────────────────────────────────────────────────────

function ReceiptDetailDrawer({ receipt, onClose }: { receipt: TollReceiptImage; onClose: () => void }) {
  const ext = receipt.extracted_data
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-bold">Toll Receipt Detail</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {receipt.driver?.name ?? receipt.driver_name ?? "Unknown driver"} · {fmt(receipt.captured_at ?? receipt.created_at)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex flex-1 gap-0 overflow-hidden">
          {/* Image / PDF */}
          <div className="flex w-1/2 flex-col items-center justify-center border-r bg-muted/20 p-4">
            {receipt.file?.url ? (
              (() => {
                const url = receipt.file!.url!
                const isPdf = url.toLowerCase().includes(".pdf") || (receipt.file_path ?? "").toLowerCase().endsWith(".pdf")
                return isPdf
                  ? <iframe src={url} title="Receipt PDF" className="h-full w-full rounded-lg border-0" style={{ minHeight: 400 }} />
                  : <img src={url} alt="Receipt" className="max-h-full max-w-full rounded-lg object-contain shadow" />
              })()
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-40" />
                <p className="text-sm">No image available</p>
              </div>
            )}
          </div>

          {/* Extracted data */}
          <div className="flex w-1/2 flex-col overflow-y-auto">
            <div className="border-b px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">OCR Extracted Data</p>
            </div>
            {ext ? (
              <div className="divide-y">
                {([
                  ["Entry Point",   ext.entry_point],
                  ["Exit Point",    ext.exit_point],
                  ["Date",          ext.transaction_date],
                  ["Time",          ext.transaction_time],
                  ["Total Amount",  ext.total_amount ? `${ext.currency ?? ""} ${ext.total_amount}` : undefined],
                  ["Vehicle Class", ext.vehicle_class],
                  ["Vehicle VRN",   ext.parsed_vehicle_vrn ?? ext.vehicle_number],
                  ["Raw Text",      undefined], // skip
                ] as [string, string | undefined][]).filter(([, v]) => v !== undefined).map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-right text-xs font-medium">{value ?? "—"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">No extraction data available</div>
            )}
            <div className="border-t px-4 py-3 mt-auto">
              <div className="flex items-center gap-2">
                {(() => {
                  const s = REC_STATUS[receipt.status] ?? REC_STATUS.pending
                  return (
                    <span className={`inline-flex items-center rounded-[100px] border pl-1 pr-3 text-[12px] font-medium capitalize leading-[2] ${s.bg} ${s.border} ${s.text}`}>
                      <span className={`mr-2 ml-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${s.dot}`} />{receipt.status}
                    </span>
                  )
                })()}
                {receipt.is_duplicate && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold dark:bg-slate-800">Duplicate</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Add Receipts Modal (drag-and-drop images → client-zip → API) ─────────────

type AddStep = "select" | "zipping" | "uploading" | "importing" | "processing" | "done" | "error"

const ACCEPTED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"]
const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

function AddReceiptsModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { t } = useLang()
  const [step, setStep] = React.useState<AddStep>("select")
  const [files, setFiles] = React.useState<File[]>([])
  const [dragging, setDragging] = React.useState(false)
  const [importedCount, setImportedCount] = React.useState(0)
  const [processedMsg, setProcessedMsg] = React.useState("")
  const [errMsg, setErrMsg] = React.useState("")
  const fileRef = React.useRef<HTMLInputElement>(null)

  // ── OCR quality state ────────────────────────────────────────────────────
  const [qualities, setQualities] = React.useState<Map<string, OcrResult>>(new Map())
  const workerRef = React.useRef<Awaited<ReturnType<typeof createOcrWorker>> | null>(null)

  // Initialise worker once, terminate on unmount
  React.useEffect(() => {
    createOcrWorker().then(w => { workerRef.current = w })
    return () => { workerRef.current?.terminate() }
  }, [])

  // Mark files as "checking" immediately, then resolve them in parallel
  const scanFiles = React.useCallback((incoming: File[]) => {
    const images = incoming.filter(
      f => f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")
    )
    // Instantly mark PDFs and images as "checking"
    setQualities(prev => {
      const next = new Map(prev)
      incoming.forEach(f => {
        const k = fileKey(f)
        if (!next.has(k)) {
          const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
          next.set(k, { status: isPdf ? "pdf" : "checking", confidence: 0 })
        }
      })
      return next
    })
    // Run image checks in parallel (don't block on each other)
    images.forEach(async f => {
      if (!workerRef.current) return
      const result = await workerRef.current.checkFile(f)
      setQualities(prev => new Map(prev).set(fileKey(f), result))
    })
  }, [])

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming)
    const valid = arr.filter(
      f => ACCEPTED_MIME.includes(f.type) || ACCEPTED_EXTS.some(ext => f.name.toLowerCase().endsWith(ext))
    )
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size))
      const added = valid.filter(f => !existing.has(f.name + f.size))
      // Kick off OCR scan for newly added files
      if (added.length) scanFiles(added)
      return [...prev, ...added]
    })
  }

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const STEPS: { key: AddStep; label: string }[] = [
    { key: "zipping",    label: t.tollReceipts.progressZipping },
    { key: "uploading",  label: t.tollReceipts.progressUploading },
    { key: "importing",  label: t.tollReceipts.progressImporting },
    { key: "processing", label: t.tollReceipts.progressProcessing },
  ]
  const stepIdx = STEPS.findIndex(s => s.key === step)

  const run = async () => {
    if (!files.length) return
    try {
      // 1. Client-side zip
      setStep("zipping")
      const zip = new JSZip()
      files.forEach(f => zip.file(f.name, f))
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } })
      const zipFile = new File([blob], `toll-receipts-${Date.now()}.zip`, { type: "application/zip" })

      // 2. Upload zip
      setStep("uploading")
      const uploaded = await uploadTollFile(zipFile)

      // 3. Import
      setStep("importing")
      const res = await importTollZip([uploaded.uuid])
      setImportedCount(res.inserted_count ?? 0)

      // 4. OCR
      setStep("processing")
      const processed = await processTollReceipts()
      setProcessedMsg(processed.message ?? "OCR processing complete")

      setStep("done")
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : "Upload failed")
      setStep("error")
    }
  }

  const isProcessing = ["zipping", "uploading", "importing", "processing"].includes(step)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={isProcessing ? undefined : onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex w-full max-w-lg flex-col rounded-2xl border bg-card shadow-2xl" style={{ maxHeight: "90vh" }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-base font-bold">{t.tollReceipts.addModalTitle}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.tollReceipts.addModalSubtitle}</p>
            </div>
            <button onClick={onClose} disabled={isProcessing} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            {step === "select" && (
              <>
                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition-all ${
                    dragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-muted-foreground/30 hover:border-primary/40 hover:bg-muted/20"
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    dragging ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Upload className={`h-5 w-5 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{dragging ? t.tollReceipts.dropActive : t.tollReceipts.dropTitle}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.tollReceipts.dropHint}</p>
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_EXTS.join(",")}
                  className="hidden"
                  onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = "" }}
                />

                {/* File list */}
                {files.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.tollReceipts.filesSelected.replace("{n}", String(files.length)).replace("{s}", files.length !== 1 ? "s" : "")}</p>
                    <div className="max-h-52 overflow-y-auto rounded-xl border divide-y">
                      {files.map((f, i) => {
                        const q = qualities.get(fileKey(f))
                        return (
                          <div key={i} className="flex items-center gap-3 px-3 py-2">
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate text-xs">{f.name}</span>
                            {/* OCR quality badge */}
                            {q && (
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                ocrBadgeClass(q.status)
                              }`}>
                                {q.status === "checking"
                                  ? <span className="inline-flex items-center gap-1">
                                      <svg className="h-2.5 w-2.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                      </svg>
                                      Scanning…
                                    </span>
                                  : ocrBadgeLabel(q.status, q.confidence)
                                }
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                            <button onClick={() => removeFile(i)} className="rounded p-0.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="flex flex-col gap-5 py-4">
                <div className="flex items-center gap-1">
                  {STEPS.map((s, i) => (
                    <React.Fragment key={s.key}>
                      <div className={`flex items-center gap-1 ${i <= stepIdx ? "text-primary" : "text-muted-foreground/40"}`}>
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          i < stepIdx ? "bg-green-500 text-white" : i === stepIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {i < stepIdx ? "✓" : i + 1}
                        </span>
                        <span className="text-[11px] font-medium hidden sm:inline">{s.label}</span>
                      </div>
                      {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-1 ${i < stepIdx ? "bg-green-400" : "bg-border"}`} />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="font-medium text-sm">
                    {step === "zipping" ? t.tollReceipts.stepZipping.replace("{n}", String(files.length)).replace("{s}", files.length !== 1 ? "s" : "")
                      : step === "uploading" ? t.tollReceipts.stepUploading
                      : step === "importing" ? t.tollReceipts.stepImporting
                      : t.tollReceipts.stepProcessing}
                  </p>
                  {step === "processing" && (
                    <p className="text-xs text-muted-foreground">{t.tollReceipts.processingNote}</p>
                  )}
                </div>
              </div>
            )}

            {/* Done */}
            {step === "done" && (
              <div className="flex items-start gap-3 rounded-xl bg-green-50 dark:bg-green-950/20 p-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">{t.tollReceipts.successTitle}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.tollReceipts.successCount.replace("{n}", String(importedCount)).replace("{s}", importedCount !== 1 ? "s" : "")}</p>
                  {processedMsg && <p className="mt-0.5 text-xs text-muted-foreground">{processedMsg}</p>}
                </div>
              </div>
            )}

            {/* Error */}
            {step === "error" && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 p-4">
                <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">{t.tollReceipts.errorTitle}</p>
                  <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errMsg}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 border-t p-4">
            {step === "select" && (
              <>
                <button onClick={onClose} className="flex-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">{t.common.cancel}</button>
                <button
                  onClick={run}
                  disabled={files.length === 0}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {(() => {
                    const flagged = files.filter(f => qualities.get(fileKey(f))?.status === "unreadable").length
                    const base = files.length > 0
                      ? t.tollReceipts.btnUpload.replace("{n}", String(files.length)).replace("{s}", files.length !== 1 ? "s" : "")
                      : t.tollReceipts.btnAdd
                    return flagged > 0 ? `${base} · ⚠ ${flagged} unreadable` : base
                  })()}
                </button>
              </>
            )}
            {step === "done" && (
              <button onClick={() => { onDone(); onClose() }} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {t.tollReceipts.btnDone}
              </button>
            )}
            {step === "error" && (
              <>
                <button onClick={() => { setStep("select"); setErrMsg("") }} className="flex-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">{t.tollReceipts.btnTryAgain}</button>
                <button onClick={onClose} className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted">{t.common.close}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Receipt Filters ──────────────────────────────────────────────────────────

type RecFilters = { driver_uuid: string; status: string; start_date: string; end_date: string }
const EMPTY_REC_FILTERS: RecFilters = { driver_uuid: "", status: "", start_date: "", end_date: "" }

function ReceiptFilterDrawer({ open, onClose, filters, setFilters, drivers }: {
  open: boolean; onClose: () => void
  filters: RecFilters; setFilters: (f: RecFilters) => void
  drivers: Driver[]
}) {
  const { t } = useLang()
  const [local, setLocal] = React.useState<RecFilters>(filters)
  const set = <K extends keyof RecFilters>(k: K, v: string) => setLocal(f => ({ ...f, [k]: v }))
  React.useEffect(() => { setLocal(filters) }, [filters])
  const active = Object.values(filters).filter(Boolean).length
  if (!open) return null
  const sel = "h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-bold">{t.tollReceipts.filterTitle}</h2>
          <button onClick={onClose} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.common.driver}</label>
            <select value={local.driver_uuid} onChange={e => set("driver_uuid", e.target.value)} className={sel}>
              <option value="">{t.tollReceipts.anyDriver}</option>
              {drivers.map(d => <option key={d.uuid} value={d.uuid}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.common.status}</label>
            <select value={local.status} onChange={e => set("status", e.target.value)} className={sel}>
              <option value="">{t.tollReceipts.anyStatus}</option>
              {TOLL_RECEIPT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.tollReceipts.capturedFrom}</label>
            <input type="date" value={local.start_date} onChange={e => set("start_date", e.target.value)} className={sel} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.tollReceipts.capturedTo}</label>
            <input type="date" value={local.end_date} onChange={e => set("end_date", e.target.value)} className={sel} />
          </div>
        </div>
        <div className="flex gap-2 border-t p-4">
          <button onClick={() => { setLocal(EMPTY_REC_FILTERS); setFilters(EMPTY_REC_FILTERS) }} className="flex-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">{t.common.clearAll}</button>
          <button onClick={() => { setFilters(local); onClose() }} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t.common.apply}{active > 0 ? ` (${active})` : ""}
          </button>
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPENSES TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Send to Amazon Modal ─────────────────────────────────────────────────────

function SendToAmazonModal({ onClose, onDone, vehicles }: {
  onClose: () => void; onDone: () => void; vehicles: Vehicle[]
}) {
  const { t } = useLang()
  const today = new Date().toISOString().slice(0, 10)
  const firstOfMonth = today.slice(0, 8) + "01"
  const [fromDate, setFromDate] = React.useState(firstOfMonth)
  const [toDate, setToDate] = React.useState(today)
  const [sending, setSending] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSend = async () => {
    setSending(true); setError("")
    try {
      await sendToAmazon({ from_date: fromDate, to_date: toDate })
      setDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally { setSending(false) }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportFuelReports({ report_type: "toll", format: "csv", from_date: fromDate, to_date: toDate })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Export failed")
    } finally { setExporting(false) }
  }

  const inp = "h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-base font-bold">{t.tollReceipts.sendTitle}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.tollReceipts.sendSubtitle}</p>
            </div>
            <button onClick={onClose} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>

          {!done ? (
            <div className="flex flex-col gap-4 p-5">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 px-3 py-2 text-xs text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.tollReceipts.sendFromDate}</label>
                  <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{t.tollReceipts.sendToDate}</label>
                  <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={inp} />
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                {t.tollReceipts.sendWarning}
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50"
                >
                  {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  {t.tollReceipts.sendPreviewBtn}
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !fromDate || !toDate}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  {sending ? t.tollReceipts.sendSending : t.tollReceipts.sendBtn}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-start gap-3 rounded-xl bg-green-50 dark:bg-green-950/20 p-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">{t.tollReceipts.sendSuccess}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.tollReceipts.sendSuccessMsg.replace("{from}", fromDate).replace("{to}", toDate)}</p>
                </div>
              </div>
              <button onClick={() => { onDone(); onClose() }} className="mt-4 w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {t.common.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Add/Edit Slide-Over ──────────────────────────────────────────────────────

// TollReport doesn't expose amazon_status / vehicle_class directly — we persist them in toll_json as a workaround
const EMPTY_FORM: CreateTollPayload = {
  driver_uuid: "", vehicle_uuid: "",
  amount: 0, currency: "GBP", direction: "North Bound",
}

function ExpenseSlideOver({
  record, vehicles, drivers, onClose, onSaved,
}: {
  record: TollReport | null
  vehicles: Vehicle[]
  drivers: Driver[]
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useLang()
  const c = t.common
  const isEdit = !!record
  const [form, setForm] = React.useState<CreateTollPayload>(
    record
      ? {
          driver_uuid: record.driver?.uuid ?? record.driver_uuid ?? "",
          vehicle_uuid: record.vehicle?.uuid ?? record.vehicle_uuid ?? "",
          amount: record.amount ?? 0,
          currency: record.currency ?? "GBP",
          direction: record.direction ?? "North Bound",
          entry_point: record.entry_point ?? "",
          exit_point: record.exit_point ?? "",
          vr_id: record.vr_id ?? "",
          trip_id: record.trip_id ?? "",
          crossing_date: record.crossing_date ? record.crossing_date.slice(0, 16) : "",
          toll_location: record.toll_location ?? "",
        }
      : { ...EMPTY_FORM }
  )
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  const set = <K extends keyof CreateTollPayload>(k: K, v: CreateTollPayload[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setError(""); setSaving(true)
    try {
      const payload: CreateTollPayload = {
        ...form,
        amount: Number(form.amount),
        crossing_date: form.crossing_date ? new Date(form.crossing_date).toISOString() : undefined,
      }
      if (isEdit && record) {
        await updateTollReport(record.uuid, payload)
      } else {
        await createTollReport(payload)
      }
      onSaved(); onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally { setSaving(false) }
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
            <h2 className="text-base font-bold">{isEdit ? "Edit Toll Expense" : "Add Toll Expense"}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isEdit ? `Editing ${record?.public_id}` : "Create a new toll expense record"}
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
              <select value={form.driver_uuid ?? ""} onChange={e => set("driver_uuid", e.target.value)} className={select}>
                <option value="">Select driver…</option>
                {drivers.map(d => <option key={d.uuid} value={d.uuid}>{d.name}</option>)}
              </select>
            </Field>
            <Field label="Vehicle *">
              <select value={form.vehicle_uuid ?? ""} onChange={e => set("vehicle_uuid", e.target.value)} className={select}>
                <option value="">Select vehicle…</option>
                {vehicles.map(v => <option key={v.uuid} value={v.uuid}>{v.plate_number}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount *">
              <input type="number" step="0.01" min="0" value={form.amount ?? ""} onChange={e => set("amount", e.target.value as unknown as number)} className={input} />
            </Field>
            <Field label="Currency *">
              <input value={form.currency ?? ""} onChange={e => set("currency", e.target.value)} className={input} placeholder="GBP" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Direction">
              <select value={form.direction ?? ""} onChange={e => set("direction", e.target.value)} className={select}>
                {TOLL_DIRECTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </Field>
            <Field label="Date / Time">
              <input type="datetime-local" value={form.crossing_date ?? ""} onChange={e => set("crossing_date", e.target.value)} className={input} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entry Point">
              <input value={form.entry_point ?? ""} onChange={e => set("entry_point", e.target.value)} className={input} placeholder="M25 J10" />
            </Field>
            <Field label="Exit Point">
              <input value={form.exit_point ?? ""} onChange={e => set("exit_point", e.target.value)} className={input} placeholder="M25 J15" />
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
          <Field label="Toll Location">
            <input value={form.toll_location ?? ""} onChange={e => set("toll_location", e.target.value)} className={input} placeholder="Dartford Crossing…" />
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

// ─── Import Wizard (Expenses) ─────────────────────────────────────────────────

type ImportStep = "upload" | "uploading" | "importing" | "done" | "error"

function ExpenseImportWizard({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [step, setStep] = React.useState<ImportStep>("upload")
  const [file, setFile] = React.useState<File | null>(null)
  const [result, setResult] = React.useState<Awaited<ReturnType<typeof importTollReports>> | null>(null)
  const [errMsg, setErrMsg] = React.useState("")
  const fileRef = React.useRef<HTMLInputElement>(null)

  const runImport = async () => {
    if (!file) return
    try {
      setStep("uploading")
      const uploaded = await uploadReportFile(file)
      setStep("importing")
      const res = await importTollReports([uploaded.uuid])
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
            <h2 className="text-base font-bold">Import Toll Expenses</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Upload a CSV or Excel file to bulk-import toll expenses</p>
          </div>
          <button onClick={onClose} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
          {step === "upload" && (
            <>
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accepted columns</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {[["VRID","vr_id"],["Date/Time","crossing_date"],["Vehicle","vehicle / reg"],["Driver","driver_name"],["Amount","amount"],["Currency","currency"],["Direction","direction"],["Entry","entry_point"],["Exit","exit_point"],["Location","toll_location"]].map(([col, hint]) => (
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
          {step === "done" && <button onClick={() => { onDone(); onClose() }} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Done — Refresh List</button>}
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

// ─── Expense Filters ──────────────────────────────────────────────────────────

type ExpFilters = { vehicle: string; seen_status: string; direction: string; from_date: string; to_date: string }
const EMPTY_EXP_FILTERS: ExpFilters = { vehicle: "", seen_status: "", direction: "", from_date: "", to_date: "" }

function ExpenseFilterDrawer({ open, onClose, filters, setFilters, vehicles }: {
  open: boolean; onClose: () => void
  filters: ExpFilters; setFilters: (f: ExpFilters) => void
  vehicles: Vehicle[]
}) {
  const [local, setLocal] = React.useState<ExpFilters>(filters)
  const set = <K extends keyof ExpFilters>(k: K, v: string) => setLocal(f => ({ ...f, [k]: v }))
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
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Amazon Status</label>
            <select value={local.seen_status} onChange={e => set("seen_status", e.target.value)} className={sel}>
              <option value="">Any status</option>
              {AMAZON_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Direction</label>
            <select value={local.direction} onChange={e => set("direction", e.target.value)} className={sel}>
              <option value="">Any direction</option>
              {TOLL_DIRECTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
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
          <button onClick={() => { setLocal(EMPTY_EXP_FILTERS); setFilters(EMPTY_EXP_FILTERS) }} className="flex-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Clear all</button>
          <button onClick={() => { setFilters(local); onClose() }} className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Apply{active > 0 ? ` (${active})` : ""}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Import History Drawer ────────────────────────────────────────────────────

function ImportHistoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = React.useState<TollImportHistoryItem[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    listTollImportHistory()
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open])

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-bold">Import History</h2>
          <button onClick={onClose} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">No import history found</p>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">{fmtDate(item.created_at)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {item.status}
                    </span>
                  </div>
                  {item.inserted_count != null && <p className="text-xs font-medium mt-0.5">{item.inserted_count} records inserted</p>}
                  {item.original_filename && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.original_filename}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECEIPTS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ReceiptsTab({ isDark, drivers }: { isDark: boolean; drivers: Driver[] }) {
  const [records, setRecords] = React.useState<TollReceiptImage[]>([])
  const [meta, setMeta] = React.useState({ total: 0, last_page: 1, current_page: 1 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [filters, setFilters] = React.useState<RecFilters>(EMPTY_REC_FILTERS)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [showUpload, setShowUpload] = React.useState(false)
  const [showFilter, setShowFilter] = React.useState(false)
  const [detailRecord, setDetailRecord] = React.useState<TollReceiptImage | null>(null)
  const gridRef = React.useRef<AgGridReact<TollReceiptImage>>(null)

  React.useEffect(() => { gridRef.current?.api?.setGridOption("quickFilterText", search) }, [search])

  const fetchData = React.useCallback(async (p = page) => {
    setLoading(true); setError("")
    try {
      const res = await listTollReceipts({
        page: p, limit: 50,
        driver_uuid: filters.driver_uuid || undefined,
        status: filters.status || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      })
      setRecords(res.expense_receipt_images)
      setMeta({ total: res.meta.total, last_page: res.meta.last_page, current_page: res.meta.current_page })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally { setLoading(false) }
  }, [page, filters])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { setPage(1); fetchData(1) }, [filters])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { fetchData(page) }, [page])

  const handleRefresh = async () => { setRefreshing(true); await fetchData(page); setRefreshing(false) }

  const activeFilters = Object.values(filters).filter(Boolean).length

  const columns: ColDef<TollReceiptImage>[] = React.useMemo(() => [
    {
      headerName: "Status", field: "status", width: 130,
      cellRenderer: ({ value }: ICellRendererParams) => {
        const s = REC_STATUS[value] ?? REC_STATUS.pending
        return (
          <span className={`inline-flex items-center rounded-[100px] border pl-1 pr-3 text-[11px] font-medium capitalize leading-[2] ${s.bg} ${s.border} ${s.text}`}>
            <span className={`mr-2 ml-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />{value}
          </span>
        )
      },
    },
    { headerName: "Driver",      field: "driver_name", flex: 1, minWidth: 140, valueFormatter: ({ value, data }) => data?.driver?.name ?? value ?? "—" },
    { headerName: "Entry Point", field: "toll_location", flex: 1, minWidth: 140, valueFormatter: ({ value, data }) => data?.extracted_data?.entry_point ?? value ?? "—" },
    { headerName: "Exit Point",  field: "crossing_date", flex: 1, minWidth: 140, valueFormatter: ({ data }) => data?.extracted_data?.exit_point ?? "—" },
    { headerName: "Amount",      field: "amount", width: 110, valueFormatter: ({ value, data }) => value ? `${data?.currency ?? ""} ${value}` : "—" },
    { headerName: "Captured",    field: "captured_at", width: 160, valueFormatter: ({ value, data }) => fmt(value ?? data?.created_at) },
    {
      headerName: "", width: 48, pinned: "right", sortable: false, filter: false,
      cellRenderer: ({ data }: ICellRendererParams<TollReceiptImage>) =>
        data ? <button onClick={() => setDetailRecord(data)} className="flex h-full items-center justify-center text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></button> : null,
    },
  ], [])

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex-1" />

        <div className={`relative transition-all duration-200 ${searchFocused ? "w-72" : "w-40"}`}>
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-8 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            placeholder="Search receipts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <button onClick={handleRefresh} disabled={refreshing} title="Refresh"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
        <button onClick={() => setShowFilter(true)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors hover:bg-accent ${
            activeFilters > 0 ? "border-primary bg-primary/5 text-primary" : "bg-background text-muted-foreground hover:text-foreground"
          }`}>
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filter{activeFilters > 0 ? ` (${activeFilters})` : ""}</span>
        </button>
        <button onClick={() => setShowUpload(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
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
        <div className="h-full w-full">
          <AgGridReact
            ref={gridRef}
            rowData={records}
            columnDefs={columns}
            theme={isDark ? darkTheme : lightTheme}
            defaultColDef={{ sortable: true, resizable: true, filter: true }}
            animateRows
            suppressCellFocus
            domLayout="autoHeight"
          />
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{meta.total} receipt{meta.total !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.current_page <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs">Page {meta.current_page} of {meta.last_page}</span>
          <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={meta.current_page >= meta.last_page}
            className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showUpload && <AddReceiptsModal onClose={() => setShowUpload(false)} onDone={() => fetchData(1)} />}
      <ReceiptFilterDrawer open={showFilter} onClose={() => setShowFilter(false)} filters={filters} setFilters={f => { setFilters(f); setPage(1) }} drivers={drivers} />
      {detailRecord && <ReceiptDetailDrawer receipt={detailRecord} onClose={() => setDetailRecord(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPENSES TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ExpensesTab({ isDark, vehicles, drivers }: { isDark: boolean; vehicles: Vehicle[]; drivers: Driver[] }) {
  const { t } = useLang()
  const confirm = useConfirm()

  const [records, setRecords] = React.useState<TollReport[]>([])
  const [meta, setMeta] = React.useState({ total: 0, last_page: 1, current_page: 1 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [filters, setFilters] = React.useState<ExpFilters>(EMPTY_EXP_FILTERS)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [selected, setSelected] = React.useState<string[]>([])
  const [refreshing, setRefreshing] = React.useState(false)
  const [showSlideOver, setShowSlideOver] = React.useState(false)
  const [editRecord, setEditRecord] = React.useState<TollReport | null>(null)
  const [showImport, setShowImport] = React.useState(false)
  const [showFilter, setShowFilter] = React.useState(false)
  const [showHistory, setShowHistory] = React.useState(false)
  const [showSendToAmazon, setShowSendToAmazon] = React.useState(false)
  const gridRef = React.useRef<AgGridReact<TollReport>>(null)

  React.useEffect(() => { gridRef.current?.api?.setGridOption("quickFilterText", search) }, [search])

  const fetchData = React.useCallback(async (p = page) => {
    setLoading(true); setError("")
    try {
      const res = await listTollReports({
        page: p, limit: 50,
        vehicle: filters.vehicle || undefined,
        seen_status_of_amazon: filters.seen_status || undefined,
        start_date: filters.from_date || undefined,
        end_date: filters.to_date || undefined,
      })
      setRecords(res.fuel_reports)
      setMeta({ total: res.meta.total, last_page: res.meta.last_page, current_page: res.meta.current_page })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally { setLoading(false) }
  }, [page, filters])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { setPage(1); fetchData(1) }, [filters])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { fetchData(page) }, [page])

  const handleRefresh = async () => { setRefreshing(true); await fetchData(page); setRefreshing(false) }

  const handleExport = async () => {
    try {
      await exportFuelReports({
        report_type: "toll",
        format: "xlsx",
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Export failed")
    }
  }

  const handleDelete = async (uuid: string) => {
    const ok = await confirm({ title: "Delete toll expense?", description: "This action cannot be undone." })
    if (!ok) return
    try {
      await deleteTollReport(uuid)
      setRecords(r => r.filter(x => x.uuid !== uuid))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed")
    }
  }

  const handleBulkDelete = async () => {
    if (!selected.length) return
    const ok = await confirm({ title: `Delete ${selected.length} record${selected.length > 1 ? "s" : ""}?`, description: "This action cannot be undone." })
    if (!ok) return
    try {
      await bulkDeleteFuelReports(selected)
      setSelected([])
      await fetchData(page)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bulk delete failed")
    }
  }

  const activeFilters = Object.values(filters).filter(Boolean).length

  const columns: ColDef<TollReport>[] = React.useMemo(() => [
    {
      headerCheckboxSelection: true, checkboxSelection: true,
      width: 44, pinned: "left" as const, sortable: false, filter: false,
    },
    { headerName: "ID",        field: "public_id",   width: 100, valueFormatter: ({ value }) => value ?? "—" },
    { headerName: "Driver",    field: "driver_uuid",  flex: 1, minWidth: 130, valueFormatter: ({ data }) => data?.driver?.name ?? "—" },
    { headerName: "Vehicle",   field: "vehicle_uuid", flex: 1, minWidth: 110, valueFormatter: ({ data }) => data?.vehicle?.plate_number ?? "—" },
    { headerName: "Entry",     field: "entry_point",  flex: 1, minWidth: 130, valueFormatter: ({ value }) => value ?? "—" },
    { headerName: "Exit",      field: "exit_point",   flex: 1, minWidth: 130, valueFormatter: ({ value }) => value ?? "—" },
    { headerName: "Direction", field: "direction",    width: 120 },
    { headerName: "Amount",    field: "amount",       width: 110, valueFormatter: ({ value, data }) => value != null ? `${data?.currency ?? "GBP"} ${Number(value).toFixed(2)}` : "—" },
    {
      headerName: "Amazon", field: "seen_status_of_amazon", width: 120,
      cellRenderer: ({ value }: ICellRendererParams) => {
        if (!value) return <span className="text-muted-foreground">—</span>
        const s = AMZ_STATUS[value] ?? AMZ_STATUS.new
        return (
          <span className={`inline-flex items-center rounded-[100px] border pl-1 pr-3 text-[11px] font-medium capitalize leading-[2] ${s.bg} ${s.border} ${s.text}`}>
            <span className={`mr-2 ml-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />{value}
          </span>
        )
      },
    },
    { headerName: "Date", field: "crossing_date", width: 150, valueFormatter: ({ value }) => fmt(value) },
    {
      headerName: "", width: 80, pinned: "right" as const, sortable: false, filter: false,
      cellRenderer: ({ data }: ICellRendererParams<TollReport>) => data ? (
        <div className="flex h-full items-center gap-1">
          <button onClick={() => { setEditRecord(data); setShowSlideOver(true) }} className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"><FileText className="h-3.5 w-3.5" /></button>
          <button onClick={() => handleDelete(data.uuid)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ) : null,
    },
  ], []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex-1" />

        {selected.length > 0 && (
          <button onClick={handleBulkDelete} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 px-2.5 text-sm text-red-700 dark:text-red-400 hover:bg-red-100">
            <Trash2 className="h-3.5 w-3.5" /> Delete ({selected.length})
          </button>
        )}

        <div className={`relative transition-all duration-200 ${searchFocused ? "w-72" : "w-40"}`}>
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-8 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            placeholder="Search expenses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <button onClick={handleRefresh} disabled={refreshing} title="Refresh"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
        <button onClick={() => setShowFilter(true)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors hover:bg-accent ${
            activeFilters > 0 ? "border-primary bg-primary/5 text-primary" : "bg-background text-muted-foreground hover:text-foreground"
          }`}>
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filter{activeFilters > 0 ? ` (${activeFilters})` : ""}</span>
        </button>
        <button onClick={handleExport}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Download className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setShowHistory(true)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <History className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setShowImport(true)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Upload className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => { setEditRecord(null); setShowSlideOver(true) }}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
        <button
          onClick={() => setShowSendToAmazon(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#FF9900] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#e68a00]"
        >
          <Send className="h-3.5 w-3.5" /> Send to Amazon
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
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
        <div className="h-full w-full">
          <AgGridReact
            ref={gridRef}
            rowData={records}
            columnDefs={columns}
            theme={isDark ? darkTheme : lightTheme}
            defaultColDef={{ sortable: true, resizable: true, filter: true }}
            rowSelection="multiple"
            onSelectionChanged={e => setSelected(e.api.getSelectedRows().map((r: TollReport) => r.uuid))}
            animateRows
            suppressCellFocus
            domLayout="autoHeight"
          />
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{meta.total} record{meta.total !== 1 ? "s" : ""}{selected.length > 0 ? ` · ${selected.length} selected` : ""}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.current_page <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs">Page {meta.current_page} of {meta.last_page}</span>
          <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={meta.current_page >= meta.last_page}
            className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showSlideOver && (
        <ExpenseSlideOver
          record={editRecord}
          vehicles={vehicles}
          drivers={drivers}
          onClose={() => { setShowSlideOver(false); setEditRecord(null) }}
          onSaved={() => fetchData(page)}
        />
      )}
      {showImport && <ExpenseImportWizard onClose={() => setShowImport(false)} onDone={() => fetchData(1)} />}
      <ExpenseFilterDrawer open={showFilter} onClose={() => setShowFilter(false)} filters={filters} setFilters={f => { setFilters(f); setPage(1) }} vehicles={vehicles} />
      <ImportHistoryDrawer open={showHistory} onClose={() => setShowHistory(false)} />
      {showSendToAmazon && <SendToAmazonModal onClose={() => setShowSendToAmazon(false)} onDone={() => fetchData(page)} vehicles={vehicles} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE ROOT
// ═══════════════════════════════════════════════════════════════════════════════

type Tab = "receipts" | "expenses"

export default function TollPage() {
  const { t } = useLang()
  const [activeTab, setActiveTab] = React.useState<Tab>("receipts")
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [drivers, setDrivers] = React.useState<Driver[]>([])
  const [isDark, setIsDark] = React.useState(false)

  // Detect dark mode
  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const update = () => setIsDark(document.documentElement.classList.contains("dark") || mql.matches)
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  // Fetch shared reference data once at page level
  React.useEffect(() => {
    Promise.all([listVehicles(), listDrivers()]).then(([va, da]) => {
      setVehicles(Array.isArray(va) ? va : (va as { vehicles?: Vehicle[] }).vehicles ?? [])
      setDrivers(Array.isArray(da) ? da : (da as { drivers?: Driver[] }).drivers ?? [])
    })
  }, [])

  const tabs: { key: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: "receipts", label: "Receipts", icon: (props) => <Receipt {...props} /> },
    { key: "expenses", label: "Expenses", icon: (props) => <CreditCard {...props} /> },
  ]

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden px-6 pt-3 pb-2 md:px-8 lg:px-10">
      {/* Tab switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        {activeTab === "receipts" ? (
          <ReceiptsTab isDark={isDark} drivers={drivers} />
        ) : (
          <ExpensesTab isDark={isDark} vehicles={vehicles} drivers={drivers} />
        )}
      </div>
    </div>
  )
}
