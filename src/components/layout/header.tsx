"use client"

import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { useAuth } from "../../hooks/use-auth"
import { Bell, LogOut, Settings, User, Search } from "lucide-react"
import { ThemeToggle } from "../theme-toggle"
import { Input } from "../ui/input"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white dark:bg-brand-dark border-b border-gray-200 dark:border-brand-primary/20 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-xl font-bold text-brand-dark dark:text-white">Business Management</h1>

          <div className="hidden md:flex items-center space-x-4 ml-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-dark/40" />
              <Input
                placeholder="Search anything..."
                className="pl-10 w-80 border-gray-200 focus:border-brand-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {/* <Button variant="ghost" size="sm" className="relative text-brand-dark hover:text-brand-primary">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-error text-white">3</Badge>
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full ring-2 ring-brand-primary/20 hover:ring-brand-primary/40 transition-all"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-semibold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-brand-dark">{user?.name || "User"}</p>
                  <p className="text-xs leading-none text-brand-dark/60">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-brand-dark hover:bg-brand-light">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-brand-dark hover:bg-brand-light">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-error hover:bg-error/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
