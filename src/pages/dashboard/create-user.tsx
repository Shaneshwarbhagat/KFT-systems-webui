"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useToast } from "../../hooks/use-toast"
import { authApi } from "../../lib/api"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const createUserSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  role: Yup.string().required("Role is required"),
  phoneNo: Yup.string()
    .matches(/^[+]?[\d\s\-()]{10,}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  emailId: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain uppercase, lowercase, number, and special character",
    )
    .required("Password is required"),
})

export default function CreateUserPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: authApi.createUser,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      })
      navigate("/dashboard")
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      })
    },
  })

  const handleCreateUser = (values: any, { resetForm }: any) => {
    const payload = {
      ...values,
      username: values.phoneNo, // Add the username field based on phoneNo
    };
    createUserMutation.mutate(payload, {
      onSuccess: () => resetForm(),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mr-5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create New User</h1>
            <p className="text-gray-600 dark:text-gray-400">Add a new user to the system</p>
          </div>
        </div>
      </div>

      <Card className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <UserPlus className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              name: "",
              role: "",
              phoneNo: "",
              emailId: "",
              password: "",
            }}
            validationSchema={createUserSchema}
            onSubmit={handleCreateUser}
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                      Name *
                    </Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder="Enter full name"
                      className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                        errors.name && touched.name ? "border-red-500" : ""
                      }`}
                    />
                    {errors.name && touched.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">
                      Role *
                    </Label>
                    <Select value={values.role} onValueChange={(value) => setFieldValue("role", value)}>
                      <SelectTrigger
                        className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                          errors.role && touched.role ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="Admin" className="text-gray-900 dark:text-gray-100">
                          Admin
                        </SelectItem>
                        <SelectItem value="Executive" className="text-gray-900 dark:text-gray-100">
                          Executive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && touched.role && <p className="text-sm text-red-500">{errors.role}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNo" className="text-gray-700 dark:text-gray-300">
                      Phone Number *
                    </Label>
                    <Field
                      as={Input}
                      id="phoneNo"
                      name="phoneNo"
                      placeholder="Enter phone number"
                      className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                        errors.phoneNo && touched.phoneNo ? "border-red-500" : ""
                      }`}
                    />
                    {errors.phoneNo && touched.phoneNo && (
                      <p className="text-sm text-red-500">{errors.phoneNo}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailId" className="text-gray-700 dark:text-gray-300">
                      Email *
                    </Label>
                    <Field
                      as={Input}
                      id="emailId"
                      name="emailId"
                      type="email"
                      placeholder="Enter email address"
                      className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                        errors.emailId && touched.emailId ? "border-red-500" : ""
                      }`}
                    />
                    {errors.emailId && touched.emailId && <p className="text-sm text-red-500">{errors.emailId}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                    Password *
                  </Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 pr-10 ${
                        errors.password && touched.password ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 dark:text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && touched.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Password must contain at least 8 characters with uppercase, lowercase, number, and special
                    character.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="flex-1 bg-brand-primary hover:bg-brand-dark text-white"
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
