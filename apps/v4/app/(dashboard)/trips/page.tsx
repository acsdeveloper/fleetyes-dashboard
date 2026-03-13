"use client"
import { PageHeader } from "@/components/page-header"

import * as React from "react"
import { MoreHorizontal, Search, Filter, Download } from "lucide-react"

type TripStatus = "Created" | "Completed" | "Confirmed" | "Dispatched"

type Trip = {
  blockId: string
  tripId: string
  tripHashId: string
  driver: string
  vehicle: string
  pickup: string
  dropoff: string
  startDate: string
  estEndDate: string
  fleet: string
  status: TripStatus
}

const trips: Trip[] = [
  { blockId: "1Oya9qH", tripId: "-", tripHashId: "S-lxAM", driver: "", vehicle: "", pickup: "DNR1", dropoff: "DXN1", startDate: "Mar 12, 2026 05:41", estEndDate: "Mar 16, 2026 05:41", fleet: "Solo", status: "Created" },
  { blockId: "bqTnWFj", tripId: "-", tripHashId: "S-v0cs", driver: "Henry", vehicle: "NUX9VAM", pickup: "DIP1", dropoff: "STN7", startDate: "Mar 3, 2026 10:57", estEndDate: "Mar 3, 2026 23:57", fleet: "Solo", status: "Created" },
  { blockId: "AK-F7PLJJ6BZ", tripId: "T-1147ZBQ4W", tripHashId: "S-I6BG", driver: "Akila", vehicle: "LIFLLJW", pickup: "LBA4", dropoff: "LBA4", startDate: "Dec 27, 2025 20:00", estEndDate: "Dec 28, 2025 07:30", fleet: "Solo", status: "Completed" },
  { blockId: "AK-7XWM519L2", tripId: "T-111MGR33V", tripHashId: "S-uMjG", driver: "Akila", vehicle: "LIFLLJW", pickup: "EMA43", dropoff: "AMAZON MANSFIELD EMA2", startDate: "Oct 8, 2025 00:30", estEndDate: "Oct 8, 2025 08:10", fleet: "Solo", status: "Completed" },
  { blockId: "AK-SPH7NZLPC", tripId: "T-115MZJPYQ", tripHashId: "T-qDzd", driver: "Akila", vehicle: "LIFLLJW", pickup: "LBA4", dropoff: "DPE2", startDate: "Dec 29, 2025 15:00", estEndDate: "Dec 30, 2025 23:34", fleet: "Tramper", status: "Completed" },
  { blockId: "AK-PZQJ93VSH", tripId: "T-115P8XDD4", tripHashId: "T-HTUn", driver: "Akila", vehicle: "LIFLLJW", pickup: "RUGELEY", dropoff: "LONDON", startDate: "Dec 14, 2025 19:00", estEndDate: "Dec 19, 2025 09:37", fleet: "Tramper", status: "Completed" },
  { blockId: "AK-M6T9Q7L2X", tripId: "T-1138VPPYV", tripHashId: "S-k644", driver: "Akila", vehicle: "LIFLLJW", pickup: "EMA43", dropoff: "EMA43", startDate: "Sep 29, 2025 21:30", estEndDate: "Sep 30, 2025 07:45", fleet: "Solo", status: "Completed" },
  { blockId: "AK-N4Z7Q8M2P", tripId: "T-1126D77CS", tripHashId: "S-mnWW", driver: "Akila", vehicle: "LIFLLJW", pickup: "EMA43", dropoff: "AMAZON MANSFIELD EMA2", startDate: "Dec 21, 2025 20:30", estEndDate: "Dec 22, 2025 04:10", fleet: "Solo", status: "Completed" },
  { blockId: "AK-Q9F7K2M8L", tripId: "T-1116LVD2P", tripHashId: "S-VZHr", driver: "Akila", vehicle: "LIFLLJW", pickup: "EMA43", dropoff: "EMA43", startDate: "Dec 15, 2025 11:45", estEndDate: "Dec 15, 2025 19:30", fleet: "Solo", status: "Completed" },
  { blockId: "AK-K4R9MZ2TP", tripId: "T-113YQB7SG", tripHashId: "S-cXUF", driver: "Akila", vehicle: "LIFLLJW", pickup: "EMA43", dropoff: "AMAZON CHESTERFIELD MAN4", startDate: "Dec 30, 2025 17:50", estEndDate: "Dec 31, 2025 00:40", fleet: "Solo", status: "Completed" },
  { blockId: "AK-Z6Q9M2L8K", tripId: "T-116DXVF2P", tripHashId: "S-OXfl", driver: "Akila", vehicle: "LIFLLJW", pickup: "AMAZON CHESTERFIELD MAN4", dropoff: "EMA43", startDate: "Dec 1, 2025 20:10", estEndDate: "Dec 2, 2025 04:30", fleet: "Solo", status: "Completed" },
  { blockId: "AK-9XK2LM7QF", tripId: "T-112ND4QX9", tripHashId: "S-50ym", driver: "Akila", vehicle: "LIFLLJW", pickup: "EMA43", dropoff: "AMAZON MANSFIELD EMA2", startDate: "Dec 23, 2025 21:05", estEndDate: "Dec 24, 2025 04:10", fleet: "Solo", status: "Completed" },
  { blockId: "AK-A7PLJJ6BZ", tripId: "T-1147ZBQ4W", tripHashId: "S-7CA1", driver: "Akila", vehicle: "", pickup: "EMA43", dropoff: "DNG2", startDate: "Oct 16, 2025 20:15", estEndDate: "Oct 17, 2025 03:30", fleet: "Solo", status: "Completed" },
  { blockId: "dcYoW2v", tripId: "-", tripHashId: "F-xgQB", driver: "", vehicle: "", pickup: "4PLINKS__IP3_0AY_526", dropoff: "AMAZON DUNSTABLE LCY5", startDate: "Feb 19, 2026 00:00", estEndDate: "Feb 20, 2026 00:00", fleet: "FleetX", status: "Confirmed" },
  { blockId: "pQ8JsNF", tripId: "-", tripHashId: "S-LfJq", driver: "", vehicle: "", pickup: "HADLEIGH_IP2_0UF_477", dropoff: "AMAZON HEMEL HEMPSTEAD LTN2", startDate: "Dec 2, 2025 00:00", estEndDate: "Dec 5, 2025 00:00", fleet: "Solo", status: "Created" },
  { blockId: "MK-CN0J5XX31", tripId: "T-111VGQGHD", tripHashId: "F-019R", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Nov 13, 2025 23:00", estEndDate: "Nov 15, 2025 08:58", fleet: "FleetX", status: "Dispatched" },
  { blockId: "MK-PBGF48C37", tripId: "T-113R12HTN", tripHashId: "S-019P", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Nov 13, 2025 16:30", estEndDate: "Nov 14, 2025 03:02", fleet: "Solo", status: "Created" },
  { blockId: "MK-TD8LDJXJ6", tripId: "T-115DD5QNN", tripHashId: "S-019Q", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Nov 13, 2025 17:30", estEndDate: "Nov 14, 2025 04:46", fleet: "Solo", status: "Created" },
  { blockId: "MK-GL11JL4363", tripId: "T-113NX7GPT", tripHashId: "S-019O", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Nov 13, 2025 00:30", estEndDate: "Nov 13, 2025 05:38", fleet: "Solo", status: "Created" },
  { blockId: "MK-JPT1HLSDL", tripId: "T-114X6DXSD", tripHashId: "S-019N", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Nov 13, 2025 00:30", estEndDate: "Nov 13, 2025 04:42", fleet: "Solo", status: "Created" },
  { blockId: "MK-DZMRXDVN1", tripId: "T-116HZFS8S", tripHashId: "T-019L", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Dec 11, 2025 17:30", estEndDate: "Nov 13, 2025 04:07", fleet: "Tramper", status: "Created" },
  { blockId: "MK-0HBXVFKLV", tripId: "T-1128TS2M2", tripHashId: "T-019M", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Dec 11, 2025 23:00", estEndDate: "Nov 13, 2025 05:20", fleet: "Tramper", status: "Created" },
  { blockId: "MK-7QLVXMF04", tripId: "T-116115DL36", tripHashId: "S-019J", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Dec 11, 2025 00:30", estEndDate: "Dec 11, 2025 11:30", fleet: "Solo", status: "Created" },
  { blockId: "MK-211MPQHCVX", tripId: "T-116VT11Y62", tripHashId: "T-019K", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Dec 11, 2025 16:30", estEndDate: "Nov 13, 2025 00:31", fleet: "Tramper", status: "Created" },
  { blockId: "MK-JKX3KVN7X", tripId: "T-1117KGB17", tripHashId: "T-019H", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Nov 11, 2025 23:00", estEndDate: "Dec 11, 2025 08:58", fleet: "Tramper", status: "Created" },
  { blockId: "MK-K8BB5VDDZ", tripId: "T-111DF8K7K", tripHashId: "S-019I", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Dec 11, 2025 00:30", estEndDate: "Dec 11, 2025 11:22", fleet: "Solo", status: "Created" },
  { blockId: "MK-DN11ZWJJKT", tripId: "T-113SZY1VJ", tripHashId: "T-019G", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Nov 11, 2025 17:30", estEndDate: "Dec 11, 2025 04:37", fleet: "Tramper", status: "Created" },
  { blockId: "MK-77RTS11PSB", tripId: "T-113V11YQHT", tripHashId: "T-019F", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Nov 11, 2025 16:30", estEndDate: "Dec 11, 2025 02:28", fleet: "Tramper", status: "Created" },
  { blockId: "MK-ML5NZSQ4N", tripId: "T-116PV7X31", tripHashId: "S-019E", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Nov 11, 2025 00:30", estEndDate: "Nov 11, 2025 11:30", fleet: "Solo", status: "Created" },
  { blockId: "MK-J34LX4ZZL", tripId: "T-116BZRNXP", tripHashId: "S-019D", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Nov 11, 2025 00:30", estEndDate: "Nov 11, 2025 12:17", fleet: "Solo", status: "Created" },
  { blockId: "MK-DMMRMMTBH", tripId: "T-115P113F4N", tripHashId: "T-019B", driver: "", vehicle: "", pickup: "RUGELEY", dropoff: "RUGELEY", startDate: "Dec 11, 2025 17:30", estEndDate: "Nov 11, 2025 04:47", fleet: "Tramper", status: "Created" },
]

const statusStyles: Record<TripStatus, string> = {
  Created:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Confirmed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Dispatched:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
}

const statusDot: Record<TripStatus, string> = {
  Created: "bg-yellow-500",
  Completed: "bg-green-500",
  Confirmed: "bg-blue-500",
  Dispatched: "bg-purple-500",
}

export default function TripsPage() {
  const [search, setSearch] = React.useState("")
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set()
  )
  const [statusFilter, setStatusFilter] = React.useState<TripStatus | "All">(
    "All"
  )

  const filtered = trips.filter((t) => {
    const matchesSearch =
      !search ||
      t.blockId.toLowerCase().includes(search.toLowerCase()) ||
      t.tripId.toLowerCase().includes(search.toLowerCase()) ||
      t.driver.toLowerCase().includes(search.toLowerCase()) ||
      t.pickup.toLowerCase().includes(search.toLowerCase()) ||
      t.dropoff.toLowerCase().includes(search.toLowerCase()) ||
      t.fleet.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === "All" || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const allSelected =
    filtered.length > 0 && filtered.every((t) => selectedRows.has(t.blockId))

  const toggleAll = () => {
    if (allSelected) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filtered.map((t) => t.blockId)))
    }
  }

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader pageKey="trips" />
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          + New Trip
        </button>
      </div>


      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TripStatus | "All")
              }
              className="h-9 appearance-none rounded-lg border bg-background pl-9 pr-8 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="All">All Status</option>
              <option value="Created">Created</option>
              <option value="Completed">Completed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Dispatched">Dispatched</option>
            </select>
          </div>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {trips.length} trips
        {selectedRows.size > 0 && (
          <span className="ml-2 font-medium text-foreground">
            · {selectedRows.size} selected
          </span>
        )}
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Block ID
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Trip ID
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Trip Hash ID
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Driver
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pickup
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dropoff
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Start Date
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Est. End Date
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fleet
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((trip) => (
                <tr
                  key={trip.blockId}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(trip.blockId)}
                      onChange={() => toggleRow(trip.blockId)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <a
                      href={`/trips/${trip.blockId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {trip.blockId}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {trip.tripId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {trip.tripHashId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {trip.driver ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-medium uppercase">
                          {trip.driver[0]}
                        </div>
                        <span>{trip.driver}</span>
                        {trip.vehicle && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                            {trip.vehicle}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        No driver assigned
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {trip.pickup}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2.5 text-muted-foreground">
                    {trip.dropoff}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {trip.startDate}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {trip.estEndDate}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {trip.fleet}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[trip.status]}`}
                    >
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot[trip.status]}`}
                      />
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    className="px-3 py-12 text-center text-sm text-muted-foreground"
                  >
                    No trips match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
