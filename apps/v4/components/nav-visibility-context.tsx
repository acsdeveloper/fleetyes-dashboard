"use client"
import * as React from "react"

type NavVisibilityContextType = {
  showHidden: boolean
  toggleHidden: () => void
}

const NavVisibilityContext = React.createContext<NavVisibilityContextType>({
  showHidden: false,
  toggleHidden: () => {},
})

export function NavVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [showHidden, setShowHidden] = React.useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("nav_show_hidden") === "true"
  })

  const toggleHidden = () => {
    setShowHidden((v) => {
      const next = !v
      localStorage.setItem("nav_show_hidden", String(next))
      return next
    })
  }

  return (
    <NavVisibilityContext.Provider value={{ showHidden, toggleHidden }}>
      {children}
    </NavVisibilityContext.Provider>
  )
}

export function useNavVisibility() {
  return React.useContext(NavVisibilityContext)
}
