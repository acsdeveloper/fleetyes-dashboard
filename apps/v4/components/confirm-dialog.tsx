"use client"

/**
 * ConfirmDialog — Reusable destructive-action confirmation dialog.
 *
 * Usage (imperative hook pattern):
 *
 *   const confirm = useConfirm()
 *
 *   async function handleDelete() {
 *     const ok = await confirm({
 *       title: "Delete driver",
 *       description: "This will permanently remove the driver. This cannot be undone.",
 *       confirmLabel: "Delete",      // optional, defaults to "Delete"
 *       cancelLabel: "Cancel",       // optional
 *     })
 *     if (!ok) return
 *     // ... perform delete
 *   }
 *
 * Mount <ConfirmDialogProvider> once at the root layout (already done via dashboard layout).
 */

import * as React from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york-v4/ui/dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** "destructive" (default red) | "warning" (amber) */
  variant?: "destructive" | "warning"
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>

// ─── Context ──────────────────────────────────────────────────────────────────

const ConfirmContext = React.createContext<ConfirmFn | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<PendingConfirm | null>(null)

  const confirm: ConfirmFn = React.useCallback((opts) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...opts, resolve })
    })
  }, [])

  function handleClose(result: boolean) {
    pending?.resolve(result)
    setPending(null)
  }

  const variant = pending?.variant ?? "destructive"
  const isDestructive = variant === "destructive"

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <Dialog open={pending !== null} onOpenChange={(open) => { if (!open) handleClose(false) }}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md"
          // Prevent the ESC/backdrop close from auto-firing — we handle it above
        >
          <DialogHeader>
            <div className="flex items-start gap-4">
              {/* Icon */}
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isDestructive
                    ? "bg-red-100 dark:bg-red-950/40"
                    : "bg-amber-100 dark:bg-amber-950/40"
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${
                    isDestructive ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                  }`}
                />
              </span>

              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base">
                  {pending?.title ?? "Are you sure?"}
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  {pending?.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter className="mt-2 gap-2 sm:gap-0">
            {/* Cancel */}
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              {pending?.cancelLabel ?? "Cancel"}
            </button>

            {/* Confirm */}
            <button
              type="button"
              onClick={() => handleClose(true)}
              className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition-colors ${
                isDestructive
                  ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                  : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
              }`}
            >
              {pending?.confirmLabel ?? "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmDialogProvider>")
  return ctx
}
