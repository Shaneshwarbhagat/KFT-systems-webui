"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Truck,
  Calendar,
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
    name: "Delivery Order",
    href: "/dashboard/orders",
    icon: Truck,
  },
  {
    name: "Cash Receipt",
    href: "/dashboard/cash",
    icon: Receipt,
  },
  {
    name: "Add Customer",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    name: "Expected Payment Date",
    href: "/dashboard/expected-payments",
    icon: Calendar,
  },
]

export function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col bg-white dark:bg-brand-dark border-r border-gray-200 dark:border-brand-primary/20 transition-all duration-300 shadow-lg",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-primary to-brand-secondary">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img src="../../../public/KFT-logo.png" alt= "KFT management systems logo" className="w-[22%] bg-white border-2 border-[#c6c6c6] rounded-sm"/>
            <h2 className="text-lg font-bold text-white">KFT System</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/20"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-brand-menu-bg text-brand-primary border border-brand-primary/20 shadow-sm"
                    : "text-brand-dark hover:bg-brand-light hover:text-brand-primary",
                  collapsed && "justify-center px-2",
                )}
              >
                <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">KFT Management v1.0</div>
        </div>
      )}
    </div>
  )
}
