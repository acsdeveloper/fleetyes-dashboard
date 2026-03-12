"use client"

import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
