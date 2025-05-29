"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  DollarSign,
  Settings,
  UserCog,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: Package,
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    name: "Cash Management",
    href: "/dashboard/cash",
    icon: DollarSign,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    name: "Admin Users",
    href: "/dashboard/admin",
    icon: UserCog,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div
      className={cn(
        "flex flex-col bg-white dark:bg-brand-dark border-r border-gray-200 dark:border-brand-primary/20 transition-all duration-300 shadow-lg",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-brand-primary/20 bg-gradient-to-r from-brand-primary to-brand-secondary">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-white" />
            <h2 className="text-lg font-bold text-white">KFT System</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-white hover:bg-white/20"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-200 h-11",
                    collapsed ? "px-2" : "px-3",
                    isActive
                      ? "bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 text-brand-primary border border-brand-primary/20 shadow-sm"
                      : "text-brand-dark hover:bg-brand-light hover:text-brand-primary",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                  {!collapsed && <span className="font-medium">{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-brand-primary/20">
          <div className="text-xs text-brand-dark/60 text-center">KFT Management v1.0</div>
        </div>
      )}
    </div>
  )
}
