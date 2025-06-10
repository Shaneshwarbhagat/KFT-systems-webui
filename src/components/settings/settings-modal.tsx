"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { UpdateCurrencySection } from "./update-currency-section"
import { MisReportSection } from "./mis-report-section"
import { ChangePasswordSection } from "./change-password-section"
import { LanguageSection } from "./language-section"
import { CreateUserSection } from "./create-user-section"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [selectedSetting, setSelectedSetting] = useState<string>("")

  const settingsOptions = [
    { value: "currency", label: "Update Currency" },
    { value: "mis", label: "MIS Report" },
    { value: "password", label: "Change Password" },
    { value: "language", label: "Language Settings" },
    { value: "createUser", label: "Create User" },
  ]

  const renderSettingComponent = () => {
    switch (selectedSetting) {
      case "currency":
        return <UpdateCurrencySection />
      case "mis":
        return <MisReportSection />
      case "password":
        return <ChangePasswordSection />
      case "language":
        return <LanguageSection />
      case "createUser":
        return <CreateUserSection />
      default:
        return (
          <div className="text-center py-8 text-gray-500">Please select a setting option from the dropdown above.</div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="settingType">Select Setting</Label>
            <Select value={selectedSetting} onValueChange={setSelectedSetting}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a setting option" />
              </SelectTrigger>
              <SelectContent>
                {settingsOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-6">{renderSettingComponent()}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
