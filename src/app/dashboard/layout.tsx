"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Bot, CreditCard, LayoutDashboard, LogOut, Package, Settings, User, Plus, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useUser } from "@clerk/nextjs"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>
  }


  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-none">
            <div className="flex items-center gap-2 px-2 py-3">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">AutoAgent</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/agents"} tooltip="My Agents">
                  <Link href="/dashboard/agents">
                    <Bot className="h-4 w-4" />
                    <span>My Agents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/builder/custom"} tooltip="Earnings">
                  <Link href="/builder/custom">
                    <Wrench className="h-4 w-4 mt-0.5" />
                    <span>Build your own model</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/analytics"} tooltip="Analytics">
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/earnings"} tooltip="Earnings">
                  <Link href="/dashboard/earnings">
                    <CreditCard className="h-4 w-4" />
                    <span>Earnings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/marketplace"} tooltip="Marketplace">
                  <Link href="/dashboard/marketplace">
                    <Package className="h-4 w-4" />
                    <span>Marketplace</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"} tooltip="Settings">
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Profile">
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4" />
                    <span>{user.firstName}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout">
                  <Link href="/logout">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                {pathname === "/dashboard"
                  ? "Dashboard"
                  : pathname === "/dashboard/agents"
                    ? "My Agents"
                    : pathname === "/dashboard/analytics"
                      ? "Analytics"
                      : pathname === "/dashboard/earnings"
                        ? "Earnings"
                        : pathname === "/dashboard/marketplace"
                          ? "Marketplace"
                          : pathname === "/dashboard/settings"
                            ? "Settings"
                            : "Dashboard"}
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Link href={'/builder'}>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Agent
              </Button>
              </Link>
              <Button size="sm">Upgrade Plan</Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto  md:p-6 ml-40 pl-20">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

