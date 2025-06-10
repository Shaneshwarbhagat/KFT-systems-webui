"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { authApi } from "../../lib/api"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { UserPlus, Eye, EyeOff } from "lucide-react"

const createUserSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  role: Yup.string().required("Role is required"),
  phoneNumber: Yup.string()
    .matches(/^[+]?[\d\s\-()]{10,}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain uppercase, lowercase, number, and special character",
    )
    .required("Password is required"),
})

export function CreateUserSection() {
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: authApi.createUser,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      })
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
    createUserMutation.mutate(values, {
      onSuccess: () => resetForm(),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create New User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            name: "",
            role: "",
            phoneNumber: "",
            email: "",
            password: "",
          }}
          validationSchema={createUserSchema}
          onSubmit={handleCreateUser}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Field
                  as={Input}
                  id="name"
                  name="name"
                  placeholder="Enter full name"
                  className={errors.name && touched.name ? "border-red-500" : ""}
                />
                {errors.name && touched.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={values.role} onValueChange={(value) => setFieldValue("role", value)}>
                  <SelectTrigger className={errors.role && touched.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && touched.role && <p className="text-sm text-red-500">{errors.role}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Field
                  as={Input}
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  className={errors.phoneNumber && touched.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && touched.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  className={errors.email && touched.email ? "border-red-500" : ""}
                />
                {errors.email && touched.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className={errors.password && touched.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && touched.password && <p className="text-sm text-red-500">{errors.password}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Password must contain at least 8 characters with uppercase, lowercase, number, and special character.
                </p>
              </div>

              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="w-full bg-brand-primary hover:bg-brand-dark text-white"
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  )
}
