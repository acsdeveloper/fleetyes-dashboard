"use client"
import * as React from "react"

export type Lang = "en" | "de"

// ─── SHAPE TYPE (declared first to avoid circular inference) ──────────────────

export type Translations = {
  nav: {
    trips: string; importHub: string; calendar: string; drivers: string
    fleetManagement: string; places: string; fuelTracking: string
    parkingMonitoring: string; tollExpenses: string; tollReceipts: string
    fuelReceipts: string; holidays: string; offShift: string
    maintenance: string; compliance: string; inventory: string
    allocationSettings: string
  }
  topbar: {
    profile: string; settings: string; logout: string
    lightMode: string; darkMode: string; systemMode: string; language: string
  }
  common: {
    save: string; cancel: string; upload: string; download: string
    search: string; new: string; edit: string; delete: string
    submit: string; back: string; loading: string
  }
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

export const translations: Record<Lang, Translations> = {
  en: {
    nav: {
      trips:              "Trips",
      importHub:          "Import Hub",
      calendar:           "Calendar",
      drivers:            "Drivers",
      fleetManagement:    "Fleet Management",
      places:             "Places",
      fuelTracking:       "Fuel Tracking",
      parkingMonitoring:  "Parking Monitoring",
      tollExpenses:       "Toll Expenses",
      tollReceipts:       "Toll Receipts",
      fuelReceipts:       "Fuel Receipts",
      holidays:           "Holidays",
      offShift:           "Off-shift",
      maintenance:        "Maintenance",
      compliance:         "Compliance",
      inventory:          "Inventory",
      allocationSettings: "Allocation Settings",
    },
    topbar: {
      profile:    "My Profile",
      settings:   "Settings",
      logout:     "Sign Out",
      lightMode:  "Light",
      darkMode:   "Dark",
      systemMode: "System",
      language:   "Language",
    },
    common: {
      save:     "Save",
      cancel:   "Cancel",
      upload:   "Upload",
      download: "Download",
      search:   "Search",
      new:      "New",
      edit:     "Edit",
      delete:   "Delete",
      submit:   "Submit",
      back:     "Back",
      loading:  "Loading…",
    },
  },
  de: {
    nav: {
      trips:              "Fahrten",
      importHub:          "Import-Hub",
      calendar:           "Kalender",
      drivers:            "Fahrer",
      fleetManagement:    "Flottenmanagement",
      places:             "Standorte",
      fuelTracking:       "Kraftstoffverfolgung",
      parkingMonitoring:  "Parküberwachung",
      tollExpenses:       "Mautkosten",
      tollReceipts:       "Mautquittungen",
      fuelReceipts:       "Tankquittungen",
      holidays:           "Urlaub",
      offShift:           "Schichtfrei",
      maintenance:        "Wartung",
      compliance:         "Compliance",
      inventory:          "Inventar",
      allocationSettings: "Zuweisungseinstellungen",
    },
    topbar: {
      profile:    "Mein Profil",
      settings:   "Einstellungen",
      logout:     "Abmelden",
      lightMode:  "Hell",
      darkMode:   "Dunkel",
      systemMode: "System",
      language:   "Sprache",
    },
    common: {
      save:     "Speichern",
      cancel:   "Abbrechen",
      upload:   "Hochladen",
      download: "Herunterladen",
      search:   "Suchen",
      new:      "Neu",
      edit:     "Bearbeiten",
      delete:   "Löschen",
      submit:   "Einreichen",
      back:     "Zurück",
      loading:  "Laden…",
    },
  },
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

type LangCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}

const LangContext = React.createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en")

  React.useEffect(() => {
    const stored = localStorage.getItem("fy-lang") as Lang | null
    if (stored === "en" || stored === "de") setLangState(stored)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem("fy-lang", l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return React.useContext(LangContext)
}
