"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { LangProvider } from "@/components/lang-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LangProvider>
      <div className="flex min-h-svh">
        <AppSidebar />
        <main className="flex flex-1 flex-col min-w-0">
          <TopBar />
          {children}
        </main>
      </div>
    </LangProvider>
  )
}
