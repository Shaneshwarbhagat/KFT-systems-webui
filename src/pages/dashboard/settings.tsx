"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { authApi, currencyApi } from "@/lib/api"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { SettingsIcon, DollarSign, Lock, Globe, Eye, EyeOff } from "lucide-react"

const changePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
})

const currencySchema = Yup.object().shape({
  hkdToMop: Yup.number().positive("Rate must be positive").required("HKD to MOP rate is required"),
  hkdToCny: Yup.number().positive("Rate must be positive").required("HKD to CNY rate is required"),
})

export default function SettingsPage() {
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const { toast } = useToast()

  // Fetch current currency rates
  const { data: currencyData } = useQuery({
    queryKey: ["currencies"],
    queryFn: currencyApi.getCurrencies,
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
        className: "bg-success text-white",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      })
    },
  })

  // Update currency mutation
  const updateCurrencyMutation = useMutation({
    mutationFn: ({ hkdToMop, hkdToCny }: { hkdToMop: number; hkdToCny: number }) =>
      currencyApi.updateCurrency({ hkdToMop, hkdToCny }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Currency rates updated successfully",
        className: "bg-success text-white",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update currency rates",
        variant: "destructive",
      })
    },
  })

  const handlePasswordChange = (values: any, { resetForm }: any) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => resetForm(),
    })
  }

  const handleCurrencyUpdate = (values: any) => {
    updateCurrencyMutation.mutate({
      hkdToMop: Number.parseFloat(values.hkdToMop),
      hkdToCny: Number.parseFloat(values.hkdToCny),
    })
  }

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    // Here you would implement the localization logic
    localStorage.setItem("selectedLanguage", language)
    toast({
      title: "Language Updated",
      description: `Language changed to ${language === "en" ? "English" : language === "ko" ? "Korean" : "Chinese"}`,
      className: "bg-success text-white",
    })
  }

  // Mock current rates - replace with actual data from API
  const currentRates = {
    hkdToMop: currencyData?.hkdToMop || 1.03,
    hkdToCny: currencyData?.hkdToCny || 0.91,
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency Exchange Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{
                hkdToMop: "",
                hkdToCny: "",
              }}
              validationSchema={currencySchema}
              onSubmit={handleCurrencyUpdate}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hkdToMop">1 HKD = ___ MOP</Label>
                    <Field
                      as={Input}
                      id="hkdToMop"
                      name="hkdToMop"
                      type="number"
                      step="0.0001"
                      placeholder="Enter MOP rate"
                      className={errors.hkdToMop && touched.hkdToMop ? "border-red-500" : ""}
                    />
                    {errors.hkdToMop && touched.hkdToMop && <p className="text-sm text-red-500">{errors.hkdToMop}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hkdToCny">1 HKD = ___ CNY</Label>
                    <Field
                      as={Input}
                      id="hkdToCny"
                      name="hkdToCny"
                      type="number"
                      step="0.0001"
                      placeholder="Enter CNY rate"
                      className={errors.hkdToCny && touched.hkdToCny ? "border-red-500" : ""}
                    />
                    {errors.hkdToCny && touched.hkdToCny && <p className="text-sm text-red-500">{errors.hkdToCny}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={updateCurrencyMutation.isPending}
                    className="w-full bg-brand-primary hover:bg-brand-dark text-white"
                  >
                    {updateCurrencyMutation.isPending ? "Updating..." : "Update Rates"}
                  </Button>
                </Form>
              )}
            </Formik>

            {/* Currency List Display */}
            {currencyData && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Current Exchange Rates</h4>
                <div className="space-y-2">
                  {currencyData.currencies?.map((currency: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {currency.fromCurrency} to {currency.toCurrency}:
                      </span>
                      <span className="font-medium">{currency.rate}</span>
                    </div>
                  )) || (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>1 HKD = 1.03 MOP</p>
                      <p>1 HKD = 0.91 CNY</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
              }}
              validationSchema={changePasswordSchema}
              onSubmit={handlePasswordChange}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="oldPassword"
                        name="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        className={errors.oldPassword && touched.oldPassword ? "border-red-500 pr-10" : "pr-10"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.oldPassword && touched.oldPassword && (
                      <p className="text-sm text-red-500">{errors.oldPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className={errors.newPassword && touched.newPassword ? "border-red-500 pr-10" : "pr-10"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.newPassword && touched.newPassword && (
                      <p className="text-sm text-red-500">{errors.newPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className={errors.confirmPassword && touched.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="w-full bg-brand-primary hover:bg-brand-dark text-white"
                  >
                    {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        {/* Language Settings */}
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
      </div>
    </div>
  )
}
