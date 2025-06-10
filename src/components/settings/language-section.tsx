"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { Globe } from "lucide-react"

export function LanguageSection() {
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const { toast } = useToast()

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    localStorage.setItem("selectedLanguage", language)
    toast({
      title: "Language Updated",
      description: `Language changed to ${language === "en" ? "English" : language === "ko" ? "Korean" : "Chinese"}`,
      className: "bg-success text-white",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Select Language</Label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ko">Korean (한국어)</SelectItem>
                <SelectItem value="zh">Chinese (中文)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Language changes will be applied to the entire application interface.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
