"use client"
import { PageHeader } from "@/components/page-header"

import * as React from "react"
import {
  Search, RefreshCw, Plus, Upload, Download,
  MoreHorizontal, List, Map as MapIcon, MapPin,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────

type Place = {
  id: string
  code: string
  address: string
  publicId: string
  postcode: string
  country: string
  lat: number
  lng: number
}

const places: Place[] = [
  { id:  "1", code: "Web - humber bridge",       address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "n07Z3Er", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.762, lng: -1.937 },
  { id:  "2", code: "DXM4",                       address: "CROSSWAYS BUSINESS PARK, DARTFORD, DA1 5FD",            publicId: "ewF2B05", postcode: "DA1 5FD",  country: "United Kingdom", lat: 51.446, lng:  0.260 },
  { id:  "3", code: "DXS1",                       address: "201 UPWELL ST, SHEFFIELD, S4 8AL",                      publicId: "xnWHZcO", postcode: "S4 8AL",   country: "United Kingdom", lat: 53.400, lng: -1.459 },
  { id:  "4", code: "EMA43",                      address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "lNuxDHw", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.759, lng: -1.940 },
  { id:  "5", code: "EMSA",                       address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "z3TXn2a", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.756, lng: -1.943 },
  { id:  "6", code: "DLU2",                       address: "UNIT 2, BEDFORDSHIRE, LU5 6JH",                         publicId: "vlPSxRE", postcode: "LU5 6JH",  country: "United Kingdom", lat: 51.895, lng: -0.497 },
  { id:  "7", code: "XLH3",                       address: "MAERSK, UNIT 49 YORKSHIRE WAY, DONCASTER, DN3 3FT",     publicId: "dcYlNX9", postcode: "DN3 3FT",  country: "United Kingdom", lat: 53.545, lng: -1.055 },
  { id:  "8", code: "DLS4",                       address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "oySdaLi", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.753, lng: -1.947 },
  { id:  "9", code: "DSN1",                       address: "WOODSIDE RD, SWINDON, SN3 4WA",                         publicId: "0dJ31wI", postcode: "SN3 4WA",  country: "United Kingdom", lat: 51.564, lng: -1.757 },
  { id: "10", code: "DDN1",                       address: "UNIT 2A ONTARIO DRIVE, SOUTH YORKSHIRE, DN11 0BF",      publicId: "wGpB9d8", postcode: "DN11 0BF", country: "United Kingdom", lat: 53.484, lng: -1.175 },
  { id: "11", code: "DXM2",                       address: "FIFTH AVENUE, GREATER MANCHESTER, M17 1TN",             publicId: "qRgKsvn", postcode: "M17 1TN",  country: "United Kingdom", lat: 53.473, lng: -2.332 },
  { id: "12", code: "DCE1",                       address: "DEESIDE INDUSTRIAL PARK, CH5 2FN",                      publicId: "ksepQSZ", postcode: "CH5 2FN",  country: "United Kingdom", lat: 53.198, lng: -3.063 },
  { id: "13", code: "DNR1",                       address: "2 CALEY CL, NORWICH, NR3 2BU",                          publicId: "gbneVP7", postcode: "NR3 2BU",  country: "United Kingdom", lat: 52.637, lng:  1.291 },
  { id: "14", code: "IMC_UKBH_B24",               address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "uKA3m90", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.765, lng: -1.933 },
  { id: "15", code: "TBS_DIST_CO7",               address: "FRATING, COLCHESTER CO7 7DW",                           publicId: "xnWt3iD", postcode: "CO7 7DW",  country: "United Kingdom", lat: 51.884, lng:  0.975 },
  { id: "16", code: "YLCY8",                      address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "vM3aqli", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.771, lng: -1.928 },
  { id: "17", code: "XUK6",                       address: "UPS WAREHOUSE DUNSTABLE, LU5 6JH",                      publicId: "darDyjw", postcode: "LU56JH",   country: "United Kingdom", lat: 51.892, lng: -0.502 },
  { id: "18", code: "MURRAY_A_BN27",              address: "HAILSHAM BN27 4EL",                                     publicId: "tSmuvGU", postcode: "BN27 4EL", country: "United Kingdom", lat: 50.843, lng:  0.260 },
  { id: "19", code: "DBR2",                       address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "sxihlkK", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.750, lng: -1.950 },
  { id: "20", code: "DRM2",                       address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "s6VM7sz", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.747, lng: -1.953 },
  { id: "21", code: "BHX8",                       address: "FAR MOOR LANE, WORCESTERSHIRE, B98 9AY",                publicId: "xnW7rXj", postcode: "B98 9AY",  country: "United Kingdom", lat: 52.291, lng: -1.955 },
  { id: "22", code: "DEX2",                       address: "SKYPARK, EXETER, EX5 2FL",                              publicId: "n2hfKNT", postcode: "EX5 2FL",  country: "United Kingdom", lat: 50.734, lng: -3.396 },
  { id: "23", code: "DNG2",                       address: "PLOT 8 HALL FARM RD, DERBY, DE74 2BF",                  publicId: "ewFpREJ", postcode: "DE74 2BF", country: "United Kingdom", lat: 52.828, lng: -1.328 },
  { id: "24", code: "DOX2",                       address: "3 SOUTHAM RD, BANBURY, OX16 2DJ",                       publicId: "kARsbzp", postcode: "OX16 2DJ", country: "United Kingdom", lat: 52.065, lng: -1.339 },
  { id: "25", code: "STN7",                       address: "AMAZON WOOTTON, BEDFORD, MK43 9QJ",                     publicId: "xnWqOGV", postcode: "MK43 9QJ", country: "United Kingdom", lat: 52.162, lng: -0.537 },
  { id: "26", code: "HIG3",                       address: "ALPHA ROAD, ENFIELD, EN3 7FU",                          publicId: "586RMuK", postcode: "EN3 7FU",  country: "United Kingdom", lat: 51.669, lng: -0.024 },
  { id: "27", code: "DHW1",                       address: "THIRD AVENUE, HARLOW, CM19 5AW",                        publicId: "7JyaxR1", postcode: "CM19 5AW", country: "United Kingdom", lat: 51.774, lng:  0.101 },
  { id: "28", code: "DPE2",                       address: "UNIT 3, CAMBRIDGESHIRE, PE7 3AG",                       publicId: "cmlxuMy", postcode: "PE7 3AG",  country: "United Kingdom", lat: 52.546, lng: -0.178 },
  { id: "29", code: "DBS2",                       address: "POPLAR WAY E, AVONMOUTH, BRISTOL, BS11 0YH",            publicId: "vM3n4Fg", postcode: "BS11 0YH", country: "United Kingdom", lat: 51.514, lng: -2.693 },
  { id: "30", code: "DHU2",                       address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "7JyaxRT", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.744, lng: -1.956 },
  { id: "31", code: "HRM2",                       address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "yIxvzba", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.741, lng: -1.959 },
  { id: "32", code: "NCL2",                       address: "NORTH CHAPELL LANE, COUNTY DURHAM, TS22 5TH",           publicId: "3147C5n", postcode: "TS22 5TH", country: "United Kingdom", lat: 54.591, lng: -1.307 },
  { id: "33", code: "MME1",                       address: "SYMMETRY PARK, DARLINGTON, DL1 4PG",                    publicId: "l5sQVPG", postcode: "DL1 4PG",  country: "United Kingdom", lat: 54.520, lng: -1.567 },
  { id: "34", code: "DLS2",                       address: "LOGIC LEEDS DISTRIBUTION PARK, LS9 0PS",                publicId: "uKA5HDF", postcode: "LS9 0PS",  country: "United Kingdom", lat: 53.797, lng: -1.499 },
  { id: "35", code: "CUK8",                       address: "ASTON LANE NORTH, CHESHIRE, WA7 3BN",                   publicId: "8gXHWhA", postcode: "WA7 3BN",  country: "United Kingdom", lat: 53.350, lng: -2.703 },
  { id: "36", code: "DNE2",                       address: "FOLLINGSBY LANE, NORTH EAST, NE10 8YA",                 publicId: "oySrigd", postcode: "NE10 8YA", country: "United Kingdom", lat: 54.942, lng: -1.543 },
  { id: "37", code: "DWN2",                       address: "TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",               publicId: "hZqMd96", postcode: "WS15 1LX", country: "United Kingdom", lat: 52.738, lng: -1.962 },
  { id: "38", code: "DCR2",                       address: "PETERWOOD WAY, CROYDON, CR0 4UQ",                       publicId: "sxio2nr", postcode: "CR0 4UQ",  country: "United Kingdom", lat: 51.379, lng: -0.087 },
  { id: "39", code: "DSO2",                       address: "UNIT 8, HAMPSHIRE, SO40 9LR",                           publicId: "iz2cf7o", postcode: "SO40 9LR", country: "United Kingdom", lat: 50.890, lng: -1.617 },
  { id: "40", code: "DSS2",                       address: "CHRISTOPHER MARTIN ROAD, BASILDON, SS14 9AA",           publicId: "z3TWaLV", postcode: "SS14 9AA", country: "United Kingdom", lat: 51.572, lng:  0.468 },
  { id: "41", code: "LPL2",                       address: "MARL ROAD, MERSEYSIDE, L33 7AP",                        publicId: "9LKpeoj", postcode: "L33 7AP",  country: "United Kingdom", lat: 53.473, lng: -2.879 },
  { id: "42", code: "BHX5",                       address: "UNIT 3, RUGBY, CV23 0XF",                               publicId: "2Bfjkyz", postcode: "CV23 0XF", country: "United Kingdom", lat: 52.356, lng: -1.234 },
  { id: "43", code: "DBI7",                       address: "236 HAWKE WAY, LEICESTERSHIRE, LE17 4XR",               publicId: "aCvSPV4", postcode: "LE17 4XR", country: "United Kingdom", lat: 52.461, lng: -1.094 },
  { id: "44", code: "SBS2",                       address: "POPLAR WAY EAST, BRISTOL, BS11 0YH",                    publicId: "rvomcZa", postcode: "BS11 0YH", country: "United Kingdom", lat: 51.511, lng: -2.696 },
  { id: "45", code: "XLH4",                       address: "UNIT 1 HURRICANE WAY, SHERBURN, LS25 6PT",              publicId: "cmlxuMt", postcode: "LS25 6PT", country: "United Kingdom", lat: 53.783, lng: -1.226 },
  { id: "46", code: "DIP1",                       address: "SPROUGHTON ENTERPRISE PARK, IPSWICH, IP1 5BL",          publicId: "l5sQVPF", postcode: "IP1 5BL",  country: "United Kingdom", lat: 52.066, lng:  1.115 },
  { id: "47", code: "DSA2",                       address: "BRICKYARD LANE, NORTH FERRIBY, HU14 3FT",               publicId: "oPcNjTv", postcode: "HU14 3FT", country: "United Kingdom", lat: 53.728, lng: -0.525 },
  { id: "48", code: "DSA6",                       address: "NEWMARKET LANE, WEST YORKSHIRE, LS26 9DP",              publicId: "fUkLRxB", postcode: "LS26 9DP", country: "United Kingdom", lat: 53.749, lng: -1.479 },
  { id: "49", code: "XLB4",                       address: "GROVEHALL LN, YORKSHIRE, WF11 0AB",                     publicId: "hZqMd9e", postcode: "WF11 0AB", country: "United Kingdom", lat: 53.683, lng: -1.261 },
  { id: "50", code: "SNG1",                       address: "INTERLINK WAY EAST, COALVILLE, LE67 1LD",               publicId: "puE2F4l", postcode: "LE67 1LD", country: "United Kingdom", lat: 52.728, lng: -1.374 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {id} {copied ? "✓" : "⎘"}
    </button>
  )
}

// ─── OpenStreetMap via Leaflet in iframe ──────────────────────────────────────

function OSMMap({ places, selectedId, onSelect }: {
  places: Place[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  // Build the self-contained Leaflet HTML page
  const buildHtml = (ps: Place[], selId: string | null) => {
    const markersJs = ps.map(p => {
      const isSelected = p.id === selId
      const colour = isSelected ? "#4f46e5" : "#6366f1"
      const radius = isSelected ? 10 : 7
      return `
        (function(){
          var m = L.circleMarker([${p.lat}, ${p.lng}], {
            radius: ${radius},
            fillColor: '${colour}',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.95
          }).addTo(map);
          m.bindPopup('<b>${p.code.replace(/'/g, "\\'")}</b><br/><span style="font-size:11px;color:#555">${p.postcode}</span><br/><span style="font-size:10px;color:#888">${p.address.replace(/'/g, "\\'").substring(0, 60)}</span>');
          m.on('click', function(){ window.parent.postMessage({type:'place-click',id:'${p.id}'},'*'); m.openPopup(); });
          ${isSelected ? "m.openPopup();" : ""}
          markers['${p.id}'] = m;
        })();`
    }).join("\n")

    const focusLat = selId ? ps.find(p => p.id === selId)?.lat ?? 52.5 : 52.5
    const focusLng = selId ? ps.find(p => p.id === selId)?.lng ?? -1.5 : -1.5
    const zoom = selId ? 12 : 6

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #map { width:100%; height:100%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: true, attributionControl: true })
    .setView([${focusLat}, ${focusLng}], ${zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);
  var markers = {};
  ${markersJs}
</script>
</body>
</html>`
  }

  // Re-render the iframe whenever places or selection changes
  const htmlRef = React.useRef<string>("")
  const newHtml = buildHtml(places, selectedId)

  React.useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    if (newHtml === htmlRef.current) return
    htmlRef.current = newHtml
    const blob = new Blob([newHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    iframe.src = url
    return () => URL.revokeObjectURL(url)
  })

  // Listen for marker clicks from inside the iframe
  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "place-click") {
        onSelect(e.data.id === selectedId ? null : e.data.id)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [selectedId, onSelect])

  return (
    <div className="flex gap-4 h-[620px]">
      {/* Map */}
      <div className="flex-1 rounded-xl border bg-card overflow-hidden">
        <iframe
          ref={iframeRef}
          title="FleetYes depot map"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Sidebar */}
      <div className="w-72 flex flex-col gap-1 overflow-y-auto pr-1">
        {places.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id === selectedId ? null : p.id)}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
              p.id === selectedId
                ? "border-primary bg-primary/5"
                : "bg-card hover:bg-muted"
            }`}
          >
            <MapPin className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${p.id === selectedId ? "text-primary" : "text-indigo-500"}`} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{p.code}</p>
              <p className="truncate text-muted-foreground">{p.postcode}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlacesPage() {
  const [search, setSearch]     = React.useState("")
  const [tab, setTab]           = React.useState<"list" | "map">("list")
  const [selected, setSelected] = React.useState<string | null>(null)
  const [checked, setChecked]   = React.useState<Set<string>>(new Set())
  const [allChecked, setAllChecked] = React.useState(false)

  const filtered = places.filter(p => {
    const q = search.toLowerCase()
    return !q ||
      p.code.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.postcode.toLowerCase().includes(q)
  })

  function toggleAll() {
    if (allChecked) { setChecked(new Set()); setAllChecked(false) }
    else { setChecked(new Set(filtered.map(p => p.id))); setAllChecked(true) }
  }

  function toggleOne(id: string) {
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6 md:p-8 lg:p-10">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader pageKey="places" />
          <p className="mt-1 text-sm text-muted-foreground">
            Manage depots and delivery locations across the UK.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Places..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:max-w-xs"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 rounded-lg border bg-muted p-0.5">
          <button
            onClick={() => setTab("list")}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${tab === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button
            onClick={() => setTab("map")}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${tab === "map" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <MapIcon className="h-3.5 w-3.5" /> Map
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setSearch("")} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted" title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted">
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {places.length} places
      </p>

      {/* ── List view ── */}
      {tab === "list" && (
        <div className="overflow-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="rounded border-border" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Code</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Address</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Postal Code</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Country</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={checked.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      <span className="font-medium whitespace-nowrap">{p.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground max-w-xs lg:max-w-sm">
                    <span className="line-clamp-1">{p.address}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <CopyId id={p.publicId} />
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap font-mono text-xs">{p.postcode}</td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap uppercase text-xs">
                    {p.country !== "-" ? p.country : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => { setTab("map"); setSelected(p.id) }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Show on map"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/20">
                <td colSpan={7} className="px-4 py-3 text-xs text-muted-foreground">
                  Showing {filtered.length} of {places.length} results
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── Map view ── */}
      {tab === "map" && (
        <OSMMap places={filtered} selectedId={selected} onSelect={setSelected} />
      )}
    </div>
  )
}
