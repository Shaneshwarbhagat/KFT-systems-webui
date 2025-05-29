"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useToast } from "../../hooks/use-toast"
import { LoadingSpinner } from "../../components/ui/loading-spinner"
import { Mail, ArrowLeft, Building2 } from "lucide-react"
import { authApi } from "../../lib/api"

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
})

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (values: { email: string }) => {
    setIsLoading(true)
    try {
      await authApi.forgotPassword(values.email)
      setIsSubmitted(true)
      toast({
        title: "Reset link sent!",
        description: "Please check your email for password reset instructions",
        className: "bg-success/10 border-success text-success-foreground",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-secondary/20 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-success to-success/80 rounded-2xl shadow-lg">
                <Mail className="h-10 w-10 text-white" aria-hidden="true" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-brand-dark">Check Your Email</CardTitle>
            <CardDescription className="text-brand-dark/70">
              We've sent password reset instructions to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-brand-dark/60">Didn't receive the email? Check your spam folder or try again.</p>
            <Link
              to="/login"
              className="inline-flex items-center text-brand-primary hover:text-brand-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
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
          <CardTitle className="text-3xl font-bold text-brand-dark">Forgot Password?</CardTitle>
          <CardDescription className="text-brand-dark/70 text-base">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Formik initialValues={{ email: "" }} validationSchema={forgotPasswordSchema} onSubmit={handleSubmit}>
            {({ errors, touched }) => (
              <Form className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-brand-dark font-medium">
                    Email Address
                  </Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    className={`h-12 border-2 transition-all duration-200 focus:border-brand-primary ${
                      errors.email && touched.email ? "border-error" : "border-gray-custom hover:border-brand-secondary"
                    }`}
                  />
                  {errors.email && touched.email && (
                    <p className="text-sm text-error font-medium" role="alert">
                      {errors.email}
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          <div className="text-center pt-4">
            <Link
              to="/login"
              className="inline-flex items-center text-brand-primary hover:text-brand-secondary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
