"use client"

import { useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useToast } from "../../hooks/use-toast"
import { LoadingSpinner } from "../../components/ui/loading-spinner"
import { Lock, Eye, EyeOff, Building2 } from "lucide-react"
import { authApi } from "../../lib/api"

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
})

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const token = searchParams.get("token")

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (!token) {
      toast({
        title: "Invalid Reset Link",
        description: "The reset link is invalid or has expired.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await authApi.resetPassword(token, values.password)
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been updated. You can now sign in.",
        className: "bg-success/10 border-success text-success-foreground",
      })
      navigate("/login")
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset password. The link may have expired.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-secondary/20 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-error">Invalid Reset Link</CardTitle>
            <CardDescription>The password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/forgot-password" className="text-brand-primary hover:text-brand-secondary transition-colors">
              Request a new reset link
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-lg">
              <Building2 className="h-10 w-10 text-white" aria-hidden="true" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-brand-dark">Reset Password</CardTitle>
          <CardDescription className="text-brand-dark/70 text-base">Enter your new password below.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={resetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-brand-dark font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      className={`h-12 pr-12 border-2 transition-all duration-200 focus:border-brand-primary ${
                        errors.password && touched.password
                          ? "border-error"
                          : "border-gray-custom hover:border-brand-secondary"
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-brand-dark/60 hover:text-brand-primary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-sm text-error font-medium" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-brand-dark font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      className={`h-12 pr-12 border-2 transition-all duration-200 focus:border-brand-primary ${
                        errors.confirmPassword && touched.confirmPassword
                          ? "border-error"
                          : "border-gray-custom hover:border-brand-secondary"
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-brand-dark/60 hover:text-brand-primary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-sm text-error font-medium" role="alert">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" aria-hidden="true" />
                      Update Password
                    </>
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
