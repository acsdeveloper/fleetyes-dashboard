"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Map,
  CalendarCheck,
  TableProperties,
  Truck,
  Container,
  MapPin,
  Fuel,
  ParkingSquare,
  Banknote,
  FileText,
  Receipt,
  ClipboardList,
  UserX,
  CalendarOff,
  Wrench,
  Settings2,
  ShieldCheck,
  Package,
  PanelLeft,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { title: "Trips", href: "/trips", icon: Map },
  { title: "Calendar", href: "/calendar", icon: CalendarCheck },
  { title: "Drivers", href: "/drivers", icon: TableProperties },
  { title: "Vehicles", href: "/vehicles", icon: Truck },
  { title: "Fleets", href: "/fleets", icon: Container },
  { title: "Places", href: "/places", icon: MapPin },
  { title: "Fuel Tracking", href: "/fuel-tracking", icon: Fuel },
  { title: "Parking Monitoring", href: "/parking", icon: ParkingSquare },
  { title: "Toll Expenses", href: "/toll-expenses", icon: Banknote },
  { title: "Toll Receipts", href: "/toll-receipts", icon: FileText },
  { title: "Fuel Receipts", href: "/fuel-receipts", icon: Receipt },

  { title: "Holidays", href: "/holidays", icon: UserX },
  { title: "Off-shift", href: "/off-shift", icon: CalendarOff },
  { title: "Maintenance", href: "/maintenance", icon: Wrench },
  { title: "Compliance", href: "/compliance", icon: ShieldCheck },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Allocation Settings", href: "/settings", icon: Settings2 },
]

export function AppSidebar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Keyboard shortcut to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (isMobile) {
          setMobileOpen((prev) => !prev)
        } else {
          setCollapsed((prev) => !prev)
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMobile])

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile trigger */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground shadow-sm md:hidden"
          aria-label="Open sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          collapsed && !isMobile ? "w-[3.5rem]" : "w-64",
          isMobile && !mobileOpen && "-translate-x-full",
          isMobile && mobileOpen && "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            {/* Collapsed: show just the leaf icon mark */}
            {collapsed && !isMobile ? (
              <svg width="28" height="28" viewBox="0 0 400 394" xmlns="http://www.w3.org/2000/svg" aria-label="FleetYes">
                <path d="M281.173 0.772 C 280.454 0.948,279.523 1.003,279.104 0.894 C 278.685 0.784,278.103 0.893,277.810 1.136 C 277.505 1.389,276.750 1.472,276.041 1.330 C 275.188 1.160,274.803 1.234,274.803 1.568 C 274.803 1.890,274.470 1.970,273.819 1.807 C 273.251 1.664,272.835 1.730,272.835 1.961 C 272.835 2.182,272.402 2.362,271.874 2.362 C 271.345 2.362,270.808 2.532,270.680 2.739 C 270.552 2.946,270.205 3.022,269.909 2.909 C 269.613 2.795,267.717 3.543,267.717 3.806 C 267.717 4.069,265.650 4.461,264.567 4.845 C 263.484 5.230,262.598 5.922,262.598 5.922 C 262.598 6.129,260.071 7.578,259.166 8.199 C 258.579 8.504,257.070 9.501,256.530 10.041 C 255.990 10.582,255.362 11.024,255.136 11.024 C 254.519 11.024,250.132 15.532,249.433 16.884 C 249.098 17.532,246.882 20.177,246.882 20.177 C 246.575 20.773,244.978 22.244,244.978 22.244 C 243.701 23.958,241.732 27.172,241.732 27.172 C 239.370 30.327,233.272 39.947,228.654 46.850 C 225.714 51.083,222.441 56.724,218.588 62.590 C 212.056 72.047,205.315 83.231,204.331 84.694 C 202.717 86.895,202.339 87.689,200.699 90.267 C 198.689 93.143,194.389 100.163,192.028 103.755 C 189.761 107.185,186.220 112.430,184.154 115.780 C 181.675 120.153,174.845 129.921,171.720 134.948 C 168.310 139.563,162.402 149.219,157.480 156.314 C 154.593 160.105,151.302 164.397,147.060 171.879 C 143.307 178.315,138.976 184.252,137.008 188.189 C 133.258 194.490,127.165 203.150,129.337 199.746 C 127.691 202.995,125.323 206.711,122.802 211.024 C 122.313 211.444,122.583 214.961,123.105 214.961 C 123.390 214.961,126.772 220.867,126.858 220.872 C 128.787 224.307,131.988 229.291,134.646 233.945 C 136.047 236.150,139.173 242.126,142.588 248.524 C 144.882 252.362,148.139 258.169,149.945 259.843 C 150.661 259.843,153.459 255.541,154.122 254.483 C 155.776 252.756,157.480 250.000,160.843 243.924 C 163.485 240.022,165.615 236.220,167.855 232.864 C 170.715 228.126,174.096 224.067,176.621 218.898 C 178.740 215.564,181.675 210.940,184.751 205.700 C 188.189 202.140,190.551 197.302,192.562 231.102 C 195.276 226.944,198.382 222.047,200.703 218.448 C 202.448 215.200,206.609 209.055,207.958 205.707 C 210.472 200.094,213.780 195.565,215.401 189.764 C 219.183 183.929,222.441 176.280,225.984 171.379 C 229.331 165.094,235.835 158.479,238.878 152.787 C 242.393 147.538,246.457 143.701,248.555 138.521 C 252.517 131.398,255.906 124.803,260.405 117.869 C 263.941 111.417,269.495 103.463,273.252 95.028 C 278.472 91.957,277.953 87.279,284.646 88.780 C 283.574 89.367,282.303 91.317,281.192 92.740 C 280.100 94.244,275.921 99.535,275.164 103.813 C 274.082 105.006,287.054 83.366,288.189 82.452 C 289.265 80.012,291.240 77.770,293.118 74.902 C 294.507 72.613,297.058 68.321,299.734 64.173 C 301.329 61.783,302.629 60.039,301.722 60.791 C 302.366 58.790,300.394 57.542,298.720 56.059 C 296.917 54.501,293.516 52.756,292.913 52.329 C 290.494 50.976,288.830 49.201,290.678 50.944 C 291.412 51.636,285.433 51.275,285.827 51.902 C 284.540 50.571,283.949 48.900,281.344 49.213 C 278.606 47.416,277.390 47.601,276.019 52.094 C 280.510 58.017,279.528 58.846,281.074 57.087 C 280.847 56.429,280.186 55.626,280.510 54.823 C 281.772 53.460,282.490 54.705,283.393 55.189 C 284.675 53.571,290.094 69.779,291.955 79.134 C 295.420 80.807,297.235 93.437,295.177 109.606 C 292.796 123.446,280.940 123.573,275.921 125.504 C 272.254 124.803,268.300 125.057,265.284 95.571 C 262.792 98.797,261.024 92.900,261.024 92.631 C 258.588 90.503,260.472 85.807,262.852 82.677 C 263.406 79.823,265.328 79.011,269.941 74.902 Z" fill="#496453"/>
              </svg>
            ) : (
              /* Expanded: full logo */
              <svg width="110" height="28" viewBox="0 0 400 394" xmlns="http://www.w3.org/2000/svg" aria-label="FleetYes" className="shrink-0">
                <path d="M0.722 0.883 C 0.054 1.417,0.432 3.937,1.180 3.937 C 1.384 3.937,3.883 9.449,3.883 9.449 C 5.064 11.127,7.087 14.764,8.268 16.745 C 9.604 18.504,14.173 26.688,14.952 27.943 C 16.703 31.358,18.898 35.752,22.441 41.657 C 25.886 46.386,28.559 51.229,30.315 54.140 C 33.679 60.039,38.344 67.946,42.150 74.526 C 46.473 83.465,53.937 95.519,59.055 104.166 C 63.279 113.412,69.291 121.795,74.016 129.650 C 78.027 138.386,84.063 147.441,88.685 154.724 C 94.882 165.748,101.181 177.390,108.492 188.386 C 110.157 189.291,110.630 189.091,112.205 187.543 C 113.878 184.648,117.924 177.706,121.876 171.301 C 125.992 164.961,131.496 155.851,136.614 145.743 C 140.404 138.976,147.075 128.346,153.543 121.680 C 157.086 116.240,163.780 105.906,168.228 99.661 C 172.074 92.658,181.437 79.921,186.220 71.247 C 192.520 60.236,200.699 49.540,209.197 38.301 C 216.527 27.165,226.378 13.780,237.402 3.987 C 239.370 1.969,240.003 0.748,237.660 0.748 C 234.646 0.373,229.721 0.748,222.717 0.748 C 214.615 0.748,209.506 2.315,207.480 6.466 C 203.304 12.841,198.031 21.095,192.913 30.327 C 188.458 38.976,184.509 46.850,181.675 52.405 C 177.619 59.852,169.685 74.803,165.508 83.071 C 160.036 92.913,153.543 104.331,148.825 113.142 C 143.307 123.228,133.071 140.157,126.392 151.544 C 122.835 157.874,117.868 165.748,112.822 174.016 C 109.308 181.260,107.395 187.008,107.087 187.402 C 106.274 184.950,102.900 179.601,100.000 175.061 C 96.457 169.120,90.603 158.241,86.220 151.498 C 82.767 145.743,74.761 130.967,68.209 120.489 C 64.173 113.142,58.397 103.698,53.937 95.519 C 48.812 85.866,40.945 73.594,34.252 61.708 C 27.165 49.940,18.898 35.752,11.114 22.515 C 7.087 14.173,2.362 7.177,0.722 0.883 M281.173 0.772 C 280.454 0.948,276.041 1.330,271.874 2.362 C 268.294 3.287,264.567 4.845,262.598 5.922 C 260.592 7.578,256.530 10.041,255.136 11.024 C 250.132 15.532,246.882 20.177,243.701 23.958 C 241.732 27.172,238.189 32.677,234.646 37.598 C 231.103 43.167,228.654 46.850,224.819 53.134 C 222.441 56.724,218.588 62.590,215.401 67.506 C 212.180 72.047,208.226 78.740,205.315 83.231 C 202.339 87.689,197.395 95.276,194.389 100.163 C 190.254 105.701,185.728 113.597,183.858 116.850 C 180.983 121.654,175.183 129.134,172.855 133.071 C 170.472 136.811,166.681 142.342,163.780 147.244 C 160.823 151.325,154.823 160.812,151.575 165.890 C 148.622 170.079,144.972 175.959,142.713 179.278 C 139.882 183.565,136.220 189.513,133.883 193.209 C 130.507 197.635,127.165 202.351,125.591 206.159 C 122.802 211.024,122.583 214.961,123.105 214.961 C 124.311 216.504,128.776 224.307,131.988 229.291 C 135.929 235.630,140.945 246.457,146.457 256.665 C 149.945 259.843,151.842 258.201,154.122 254.483 C 156.693 250.406,160.843 243.924,163.780 236.614 C 167.591 229.828,172.455 221.785,176.621 216.142 C 179.921 210.472,185.409 202.362,188.189 197.414 C 190.157 193.701,195.276 186.220,199.606 179.606 C 203.937 172.047,209.197 163.386,215.650 154.331 C 220.078 147.404,226.378 138.386,232.283 132.283 C 236.614 126.772,242.429 122.468,246.457 126.139 C 252.211 128.776,255.223 130.341,258.268 136.220 C 261.811 140.354,262.073 143.908,259.470 147.734 C 256.299 153.571,252.517 160.630,248.270 167.939 C 244.340 174.882,238.583 183.929,233.465 192.126 C 229.331 199.173,222.835 209.711,218.898 215.980 C 214.860 222.047,208.080 232.283,203.763 239.341 C 198.996 246.307,192.126 256.299,188.189 262.205 C 184.173 267.855,178.346 277.165,174.875 283.621 C 171.632 289.219,165.508 298.488,157.480 306.505 C 156.286 392.704,229.721 393.980,242.717 392.834 C 244.483 290.823,244.936 274.640,245.669 272.244 C 246.879 263.780,248.031 257.480,250.239 252.362 C 252.953 246.307,257.480 238.661,261.811 230.315 C 264.355 224.928,268.879 217.323,272.047 210.630 C 275.682 203.090,280.144 195.273,283.071 188.189 C 286.616 181.469,290.748 173.252,294.094 165.748 C 297.235 158.739,301.181 150.196,303.937 143.307 C 307.000 135.827,311.043 126.456,315.598 118.687 C 318.877 111.220,323.228 101.452,326.772 93.299 C 330.093 85.984,334.646 76.929,338.864 68.307 C 342.240 60.157,347.814 48.393,351.969 40.696 C 354.878 33.274,360.262 22.539,363.721 14.200 C 366.689 7.782,369.574 0.525,341.314 0.373 C 340.265 2.216,338.370 4.501,336.614 7.229 C 333.858 11.237,330.709 16.687,327.165 22.801 C 323.228 28.979,319.220 36.420,316.142 42.520 C 312.774 48.819,307.087 58.465,303.937 64.122 C 299.213 71.881,294.882 80.709,291.339 88.780 C 288.189 95.696,283.434 105.118,279.652 113.142 C 275.188 121.986,270.748 132.677,267.717 141.339 C 263.941 151.178,259.284 162.598,255.231 172.441 C 252.953 178.740,248.270 190.157,244.488 198.819 C 240.970 205.943,234.646 219.333,229.555 228.346 C 223.819 238.583,215.364 252.756,209.197 261.024 C 202.448 270.150,194.488 281.496,188.189 290.157 L 156.693 288.836 C 155.047 289.891,155.227 391.746,156.286 392.704 Z" fill="#496453"/>
              </svg>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                    title={collapsed && !isMobile ? item.title : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
                      )}
                    />
                    {(!collapsed || isMobile) && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer — collapse toggle (desktop only) */}
        {!isMobile && (
          <div className="border-t p-2">
            <button
              onClick={() => setCollapsed((prev) => !prev)}
              className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </button>
          </div>
        )}
      </aside>

      {/* Spacer for desktop layout */}
      <div
        className={cn(
          "hidden shrink-0 transition-all duration-300 ease-in-out md:block",
          collapsed ? "w-[3.5rem]" : "w-64"
        )}
      />
    </>
  )
}
