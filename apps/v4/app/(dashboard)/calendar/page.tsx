"use client"
import { PageHeader } from "@/components/page-header"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarIcon,
  Users,
  IdCard,
  Car,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type TripStatus = "Created" | "Completed" | "Confirmed" | "Dispatched"

type Trip = {
  id: string
  blockId: string
  status: TripStatus
  scheduled: string   // ISO
  estEnd: string      // ISO
  created: string     // ISO
  fleet: string
  driver: string
  vehicle: string
  destination: string
  assigned: boolean
}

type Maintenance = {
  id: string
  vehicle: string
  reg: string
  type: string
  technician: string
  notes: string
  date: string   // ISO date (yyyy-MM-dd)
  estCompletion: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const trips: Trip[] = [
  { id: "1", blockId: "1Oya9qH",         status: "Created",    scheduled: "2026-03-12T05:41", estEnd: "2026-03-16T05:41", created: "2026-03-12T05:45", fleet: "Solo",    driver: "",      vehicle: "",         destination: "DNR1",                           assigned: false },
  { id: "2", blockId: "dcYoW2v",         status: "Confirmed",  scheduled: "2026-02-19T00:00", estEnd: "2026-02-20T00:00", created: "2026-02-19T11:43", fleet: "FleetX",  driver: "",      vehicle: "",         destination: "4PLINKS__IP3_0AY_526",            assigned: false },
  { id: "3", blockId: "pQ8JsNF",         status: "Created",    scheduled: "2025-12-02T00:00", estEnd: "2025-12-05T00:00", created: "2025-12-01T05:44", fleet: "Solo",    driver: "",      vehicle: "",         destination: "HADLEIGH_IP2_0UF_477",            assigned: false },
  { id: "4", blockId: "MK-CN0J5XX31",    status: "Dispatched", scheduled: "2025-11-13T23:00", estEnd: "2025-11-15T08:58", created: "2025-11-14T07:45", fleet: "FleetX",  driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id: "5", blockId: "MK-TD8LDJXJ6",   status: "Created",    scheduled: "2025-11-13T17:30", estEnd: "2025-11-14T04:46", created: "2025-11-14T07:45", fleet: "Solo",    driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id: "6", blockId: "MK-PBGF48C37",   status: "Created",    scheduled: "2025-11-13T16:30", estEnd: "2025-11-14T03:02", created: "2025-11-14T07:45", fleet: "Solo",    driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id: "7", blockId: "MK-GL11JL4363",  status: "Created",    scheduled: "2025-11-13T00:30", estEnd: "2025-11-13T05:38", created: "2025-11-14T07:45", fleet: "Solo",    driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id: "8", blockId: "MK-JPT1HLSDL",   status: "Created",    scheduled: "2025-11-13T00:30", estEnd: "2025-11-13T04:42", created: "2025-11-14T07:45", fleet: "Solo",    driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id: "9", blockId: "MK-DZMRXDVN1",   status: "Created",    scheduled: "2025-12-11T17:30", estEnd: "2025-11-13T04:07", created: "2025-11-14T07:45", fleet: "Tramper", driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id:"10", blockId: "MK-0HBXVFKLV",   status: "Created",    scheduled: "2025-12-11T23:00", estEnd: "2025-11-13T05:20", created: "2025-11-14T07:45", fleet: "Tramper", driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id:"11", blockId: "MK-7QLVXMF04",   status: "Created",    scheduled: "2025-12-11T00:30", estEnd: "2025-12-11T11:30", created: "2025-11-14T07:45", fleet: "Solo",    driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id:"12", blockId: "MK-211MPQHCVX",  status: "Created",    scheduled: "2025-12-11T16:30", estEnd: "2025-11-13T00:31", created: "2025-11-14T07:45", fleet: "Tramper", driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id:"13", blockId: "MK-JKX3KVN7X",   status: "Created",    scheduled: "2025-11-11T23:00", estEnd: "2025-12-11T08:58", created: "2025-11-14T07:45", fleet: "Tramper", driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id:"14", blockId: "MK-K8BB5VDDZ",   status: "Created",    scheduled: "2025-12-11T00:30", estEnd: "2025-12-11T11:22", created: "2025-11-14T07:45", fleet: "Solo",    driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id:"15", blockId: "MK-DN11ZWJJKT",  status: "Created",    scheduled: "2025-11-11T17:30", estEnd: "2025-12-11T04:37", created: "2025-11-14T07:45", fleet: "Tramper", driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id:"16", blockId: "MK-77RTS11PSB",  status: "Created",    scheduled: "2025-11-11T16:30", estEnd: "2025-12-11T02:28", created: "2025-11-14T07:45", fleet: "Tramper", driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id:"17", blockId: "MK-ML5NZSQ4N",   status: "Created",    scheduled: "2025-11-11T00:30", estEnd: "2025-11-11T11:30", created: "2025-11-14T07:45", fleet: "Solo",    driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  { id:"18", blockId: "MK-J34LX4ZZL",   status: "Created",    scheduled: "2025-11-11T00:30", estEnd: "2025-11-11T12:17", created: "2025-11-14T07:45", fleet: "Solo",    driver: "",      vehicle: "",         destination: "RUGELEY",                        assigned: false },
  // Assigned orders
  { id:"19", blockId: "bqTnWFj",         status: "Created",    scheduled: "2026-03-03T10:57", estEnd: "2026-03-03T23:57", created: "2026-03-03T10:57", fleet: "Solo",    driver: "Henry", vehicle: "NUX9VAM",  destination: "STN7",                           assigned: true  },
  { id:"20", blockId: "AK-F7PLJJ6BZ",   status: "Completed",  scheduled: "2025-12-27T20:00", estEnd: "2025-12-28T07:30", created: "2025-12-27T20:00", fleet: "Solo",    driver: "Akila", vehicle: "LIFLLJW",  destination: "LBA4",                           assigned: true  },
  { id:"21", blockId: "AK-7XWM519L2",   status: "Completed",  scheduled: "2025-10-08T00:30", estEnd: "2025-10-08T08:10", created: "2025-10-08T00:30", fleet: "Solo",    driver: "Akila", vehicle: "LIFLLJW",  destination: "AMAZON MANSFIELD EMA2",          assigned: true  },
  { id:"22", blockId: "AK-SPH7NZLPC",   status: "Completed",  scheduled: "2025-12-29T15:00", estEnd: "2025-12-30T23:34", created: "2025-12-29T15:00", fleet: "Tramper", driver: "Akila", vehicle: "LIFLLJW",  destination: "DPE2",                           assigned: true  },
  { id:"23", blockId: "AK-PZQJ93VSH",   status: "Completed",  scheduled: "2025-12-14T19:00", estEnd: "2025-12-19T09:37", created: "2025-12-14T19:00", fleet: "Tramper", driver: "Akila", vehicle: "LIFLLJW",  destination: "LONDON",                         assigned: true  },
  { id:"24", blockId: "AK-M6T9Q7L2X",   status: "Completed",  scheduled: "2025-09-29T21:30", estEnd: "2025-09-30T07:45", created: "2025-09-29T21:30", fleet: "Solo",    driver: "Akila", vehicle: "LIFLLJW",  destination: "EMA43",                          assigned: true  },
  { id:"25", blockId: "AK-N4Z7Q8M2P",   status: "Completed",  scheduled: "2025-12-21T20:30", estEnd: "2025-12-22T04:10", created: "2025-12-21T20:30", fleet: "Solo",    driver: "Akila", vehicle: "LIFLLJW",  destination: "AMAZON MANSFIELD EMA2",          assigned: true  },
  { id:"26", blockId: "AK-Q9F7K2M8L",   status: "Completed",  scheduled: "2025-12-15T11:45", estEnd: "2025-12-15T19:30", created: "2025-12-15T11:45", fleet: "Solo",    driver: "Akila", vehicle: "LIFLLJW",  destination: "EMA43",                          assigned: true  },
  { id:"27", blockId: "AK-K4R9MZ2TP",   status: "Completed",  scheduled: "2025-12-30T17:50", estEnd: "2025-12-31T00:40", created: "2025-12-30T17:50", fleet: "Solo",    driver: "Akila", vehicle: "LIFLLJW",  destination: "AMAZON CHESTERFIELD MAN4",       assigned: true  },
  { id:"28", blockId: "AK-Z6Q9M2L8K",   status: "Completed",  scheduled: "2025-12-01T20:10", estEnd: "2025-12-02T04:30", created: "2025-12-01T20:10", fleet: "Solo",    driver: "Akila", vehicle: "LIFLLJW",  destination: "EMA43",                          assigned: true  },
  { id:"29", blockId: "AK-9XK2LM7QF",   status: "Completed",  scheduled: "2025-12-23T21:05", estEnd: "2025-12-24T04:10", created: "2025-12-23T21:05", fleet: "Solo",    driver: "Akila", vehicle: "LIFLLJW",  destination: "AMAZON MANSFIELD EMA2",          assigned: true  },
  { id:"30", blockId: "AK-A7PLJJ6BZ",   status: "Completed",  scheduled: "2025-10-16T20:15", estEnd: "2025-10-17T03:30", created: "2025-10-16T20:15", fleet: "Solo",    driver: "Akila", vehicle: "",         destination: "DNG2",                           assigned: true  },
]

// ─── Maintenance events ───────────────────────────────────────────────────────

const maintenanceEvents: Maintenance[] = [
  {
    id: "m1",
    vehicle: "Volvo FH 500",
    reg: "NUX9VAM",
    type: "Annual Service & MOT",
    technician: "Gareth Williams",
    notes: "Full 6-weekly inspection. Check brake pads, replace engine oil & filter, tyre rotation.",
    date: "2026-03-17",
    estCompletion: "2026-03-17",
  },
  {
    id: "m2",
    vehicle: "DAF XF 480",
    reg: "TB67KLM",
    type: "Ad-hoc Repair – DPF Fault",
    technician: "Sandra Okafor",
    notes: "DPF warning light triggered on A50. Forced regen & pressure sensor replacement scheduled.",
    date: "2026-03-26",
    estCompletion: "2026-03-26",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<TripStatus, { badge: string; dot: string; event: string }> = {
  Created:    { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",  dot: "bg-yellow-500",  event: "bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-400" },
  Completed:  { badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",      dot: "bg-green-500",   event: "bg-green-500/20 border-green-500 text-green-700 dark:text-green-400"   },
  Confirmed:  { badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",          dot: "bg-blue-500",    event: "bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400"     },
  Dispatched: { badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",  dot: "bg-purple-500",  event: "bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-400" },
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ trip }: { trip: Trip }) {
  const colors = statusColors[trip.status]
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
        <span className="text-xs font-semibold tracking-tight">{trip.blockId}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
          {trip.status}
        </span>
      </div>
      {/* Body */}
      <div className="space-y-1.5 p-3 text-xs">
        <Row icon={<Clock className="h-3 w-3" />} label="Scheduled"   value={fmtDate(trip.scheduled)} />
        <Row icon={<Clock className="h-3 w-3" />} label="Est. End"    value={fmtDate(trip.estEnd)} />
        <Row icon={<CalendarIcon className="h-3 w-3" />} label="Created" value={fmtDate(trip.created)} />
        <Row icon={<Users className="h-3 w-3" />}  label="Fleet"      value={trip.fleet} />
        <Row icon={<IdCard className="h-3 w-3" />} label="Driver"     value={trip.driver || "No Driver"} muted={!trip.driver} />
        <Row icon={<Car className="h-3 w-3" />}    label="Vehicle"    value={trip.vehicle || "No Vehicle"} muted={!trip.vehicle} />
        <Row icon={<MapPin className="h-3 w-3" />} label="Destination" value={trip.destination} />
      </div>
    </div>
  )
}

function Row({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-1 text-muted-foreground shrink-0">
        {icon}
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <span className={`text-right truncate max-w-[140px] ${muted ? "text-muted-foreground" : ""}`}>{value}</span>
    </div>
  )
}

// ─── Collapsible Panel ────────────────────────────────────────────────────────

function Panel({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-semibold">{title}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
        </div>
      </button>
      {open && (
        <div className="border-t p-3 space-y-3 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function getCalendarDays(year: number, month: number) {
  const firstDay  = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const cells: { date: Date; current: boolean }[] = []

  // Leading days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), current: false })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true })
  }
  // Trailing days to fill grid (always 6 rows = 42 cells)
  let trailing = 1
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, trailing++), current: false })
  }
  return cells
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear]   = React.useState(today.getFullYear())
  const [month, setMonth] = React.useState(today.getMonth())
  const [selected, setSelected] = React.useState<Date | null>(null)

  const cells = getCalendarDays(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const tripsForDay = (date: Date) =>
    trips.filter(t => isSameDay(new Date(t.scheduled), date))

  const maintForDay = (date: Date) =>
    maintenanceEvents.filter(m => m.date === date.toISOString().slice(0, 10))

  const selectedDayTrips = selected ? tripsForDay(selected) : []
  const selectedDayMaint = selected ? maintForDay(selected) : []

  const unassigned = trips.filter(t => !t.assigned)
  const assigned   = trips.filter(t => t.assigned)

  return (
    <div className="flex flex-1 flex-col gap-4 p-6 md:p-8 lg:p-10 min-h-0">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <PageHeader pageKey="calendar" />
          <p className="mt-1 text-sm text-muted-foreground">
            View and schedule trips on the calendar.
          </p>
        </div>
      </div>

      {/* Body: sidebar + calendar */}
      <div className="flex flex-1 gap-4 min-h-0 flex-col lg:flex-row">

        {/* ── Left Sidebar ────────────────────────────────────── */}
        <div className="flex flex-col gap-3 lg:w-80 xl:w-96 shrink-0 overflow-y-auto">
          <Panel title="Unassigned Orders" count={unassigned.length}>
            {unassigned.map(t => <OrderCard key={t.id} trip={t} />)}
          </Panel>
          <Panel title="Assigned Orders" count={assigned.length}>
            {assigned.map(t => <OrderCard key={t.id} trip={t} />)}
          </Panel>
        </div>

        {/* ── Calendar ────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-4 min-w-0">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm flex flex-col flex-1">
            {/* Month nav */}
            <div className="flex items-center justify-between border-b px-5 py-3">
              <button
                onClick={prevMonth}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold">
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b bg-muted/30">
              {DAYS.map(d => (
                <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid flex-1 grid-cols-7 grid-rows-6">
              {cells.map((cell, i) => {
                const dayTrips = tripsForDay(cell.date)
                const isToday  = isSameDay(cell.date, today)
                const isSel    = selected && isSameDay(cell.date, selected)
                return (
                  <div
                    key={i}
                    onClick={() => setSelected(isSel ? null : cell.date)}
                    className={[
                      "relative flex flex-col gap-0.5 border-b border-r p-1.5 cursor-pointer transition-colors min-h-[80px]",
                      !cell.current ? "bg-muted/20" : "hover:bg-muted/30",
                      isSel ? "ring-2 ring-inset ring-primary" : "",
                    ].join(" ")}
                  >
                    {/* Date number */}
                    <span className={[
                      "flex h-6 w-6 items-center justify-center self-start rounded-full text-xs font-medium",
                      isToday ? "bg-primary text-primary-foreground" : !cell.current ? "text-muted-foreground" : "text-foreground",
                    ].join(" ")}>
                      {cell.date.getDate()}
                    </span>

                    {/* Trip chips */}
                    <div className="flex flex-col gap-0.5">
                      {dayTrips.slice(0, 3).map(t => (
                        <div
                          key={t.id}
                          className={`truncate rounded border-l-2 px-1.5 py-0.5 text-[10px] font-medium leading-tight ${statusColors[t.status].event}`}
                        >
                          {fmtTime(t.scheduled)} {t.blockId}
                        </div>
                      ))}
                      {/* Maintenance chips */}
                      {maintForDay(cell.date).map(m => (
                        <div
                          key={m.id}
                          className="truncate rounded border-l-2 border-red-500 bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-red-700 dark:text-red-400"
                        >
                          🔧 {m.reg}
                        </div>
                      ))}
                      {dayTrips.length > 3 && (
                        <div className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          +{dayTrips.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selected && (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b px-5 py-3">
                <h3 className="text-sm font-semibold">
                  {selected.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedDayTrips.length === 0 && selectedDayMaint.length === 0
                    ? "No events scheduled"
                    : [
                        selectedDayTrips.length > 0 ? `${selectedDayTrips.length} trip${selectedDayTrips.length > 1 ? "s" : ""}` : "",
                        selectedDayMaint.length > 0 ? `${selectedDayMaint.length} maintenance` : "",
                      ].filter(Boolean).join(" · ")
                  }
                </p>
              </div>

              {/* Trip cards */}
              {selectedDayTrips.length > 0 && (
                <div className="flex flex-wrap gap-3 p-4">
                  {selectedDayTrips.map(t => (
                    <div key={t.id} className="min-w-[220px] flex-1">
                      <OrderCard trip={t} />
                    </div>
                  ))}
                </div>
              )}

              {/* Maintenance cards */}
              {selectedDayMaint.length > 0 && (
                <div className="flex flex-wrap gap-3 border-t p-4">
                  {selectedDayMaint.map(m => (
                    <div key={m.id} className="min-w-[260px] flex-1 overflow-hidden rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 shadow-sm">
                      <div className="flex items-center justify-between border-b border-red-200 dark:border-red-900/40 bg-red-100/60 dark:bg-red-900/20 px-3 py-2">
                        <span className="text-xs font-semibold text-red-800 dark:text-red-300">🔧 Scheduled Maintenance</span>
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-400">maintenance</span>
                      </div>
                      <div className="space-y-1.5 p-3 text-xs">
                        <div className="flex justify-between"><span className="font-medium text-red-900 dark:text-red-200">Vehicle</span><span className="text-red-800 dark:text-red-300">{m.vehicle}</span></div>
                        <div className="flex justify-between"><span className="font-medium text-red-900 dark:text-red-200">Reg</span><span className="font-mono text-red-800 dark:text-red-300">{m.reg}</span></div>
                        <div className="flex justify-between"><span className="font-medium text-red-900 dark:text-red-200">Type</span><span className="text-right max-w-[180px] text-red-800 dark:text-red-300">{m.type}</span></div>
                        <div className="flex justify-between"><span className="font-medium text-red-900 dark:text-red-200">Technician</span><span className="text-red-800 dark:text-red-300">{m.technician}</span></div>
                        <div className="flex justify-between"><span className="font-medium text-red-900 dark:text-red-200">Est. Completion</span><span className="text-red-800 dark:text-red-300">{m.estCompletion}</span></div>
                        <p className="pt-1 text-red-700/80 dark:text-red-400/80 border-t border-red-200 dark:border-red-900/40">{m.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
