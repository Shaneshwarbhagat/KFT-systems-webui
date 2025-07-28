"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { customerApi } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useToast } from "../../hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"

interface Customer {
  id: string
  address: string
  city: string
  country: string
  contactPersonName: string
  companyName: string
  mobileNumber: string
  emailId: string
  businessRegistrationNumber: string
}

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  mode: "create" | "edit"
}

const customerSchema = Yup.object().shape({
  customerName: Yup.string().notRequired(),
  companyName: Yup.string().required("Company name is required"),
  address: Yup.string().notRequired(),
  city: Yup.string().required("City is required"),
  country: Yup.string().notRequired(),
  businessRegistrationNumber: Yup.string().notRequired(),
  emailId: Yup.string().email("Invalid email").required("Email is required"),
  contactPersonName: Yup.string().required("Contact person name is required"),
  mobileNumber: Yup.string().matches(/^[+]?[\d\s\-()]{10,}$/, "Please enter a valid phone number").required("Contact number is required"),
})

export function CustomerModal({ isOpen, onClose, customer, mode }: CustomerModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const initialValues = {
    customerName: customer?.contactPersonName || "",
    companyName: customer?.companyName || "",
    address: customer?.address || "",
    city: customer?.city || "",
    country: customer?.country || "",
    businessRegistrationNumber: customer?.businessRegistrationNumber || "",
    emailId: customer?.emailId || "",
    contactPersonName: customer?.contactPersonName || "",
    mobileNumber: customer?.mobileNumber || "",
  }

  const createMutation = useMutation({
    mutationFn: customerApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast({
        title: "Success",
        description: "Customer created successfully",
        className: "bg-success text-white [&_button]:text-white",
      })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create customer",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customerApi.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast({
        title: "Success",
        description: "Customer updated successfully",
        className: "bg-success text-white [&_button]:text-white",
      })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update customer",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (values: any) => {
    if (mode === "create") {
      let res = {...values, customerName: values.contactPersonName} 
      createMutation.mutate(res)
    } else if (customer) {
      updateMutation.mutate({ id: customer.id, data: values })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Create New Customer" : "Edit Customer"}
          </DialogTitle>
        </DialogHeader>

        <Formik initialValues={initialValues} validationSchema={customerSchema} onSubmit={handleSubmit}>
          {({ errors, touched }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Field
                    as={Input}
                    id="companyName"
                    name="companyName"
                    placeholder="Enter company name"
                    className={errors.companyName && touched.companyName ? "border-red-500" : ""}
                  />
                  {errors.companyName && touched.companyName && (
                    <p className="text-sm text-red-500">{errors.companyName}</p>
                  )}
                </div>

                {/* Contact Person Name */}
                <div className="space-y-2">
                  <Label htmlFor="contactPersonName">Contact Person Name *</Label>
                  <Field
                    as={Input}
                    id="contactPersonName"
                    name="contactPersonName"
                    placeholder="Enter contact person name"
                    className={errors.contactPersonName && touched.contactPersonName ? "border-red-500" : ""}
                  />
                  {errors.contactPersonName && touched.contactPersonName && (
                    <p className="text-sm text-red-500">{errors.contactPersonName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="emailId">Email *</Label>
                  <Field
                    as={Input}
                    id="emailId"
                    name="emailId"
                    type="email"
                    placeholder="Enter email address"
                    className={errors.emailId && touched.emailId ? "border-red-500" : ""}
                  />
                  {errors.emailId && touched.emailId && <p className="text-sm text-red-500">{errors.emailId}</p>}
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Contact Number *</Label>
                  <Field
                    as={Input}
                    id="mobileNumber"
                    name="mobileNumber"
                    placeholder="Enter contact number"
                    className={errors.mobileNumber && touched.mobileNumber ? "border-red-500" : ""}
                  />
                  {errors.mobileNumber && touched.mobileNumber && (
                    <p className="text-sm text-red-500">{errors.mobileNumber}</p>
                  )}
                </div>

                {/* Business Registration Number */}
                <div className="space-y-2">
                  <Label htmlFor="businessRegistrationNumber">Business Registration Number (BRN)</Label>
                  <Field
                    as={Input}
                    id="businessRegistrationNumber"
                    name="businessRegistrationNumber"
                    placeholder="Enter BRN"
                    className={
                      errors.businessRegistrationNumber && touched.businessRegistrationNumber ? "border-red-500" : ""
                    }
                  />
                  {errors.businessRegistrationNumber && touched.businessRegistrationNumber && (
                    <p className="text-sm text-red-500">{errors.businessRegistrationNumber}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Field
                    as={Input}
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    className={errors.city && touched.city ? "border-red-500" : ""}
                  />
                  {errors.city && touched.city && <p className="text-sm text-red-500">{errors.city}</p>}
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Field
                    as={Input}
                    id="country"
                    name="country"
                    placeholder="Enter country"
                    className={errors.country && touched.country ? "border-red-500" : ""}
                  />
                  {errors.country && touched.country && <p className="text-sm text-red-500">{errors.country}</p>}
                </div>
              </div>

              {/* Address - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Field
                  as={Input}
                  id="address"
                  name="address"
                  placeholder="Enter full address"
                  className={errors.address && touched.address ? "border-red-500" : ""}
                />
                {errors.address && touched.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-brand-primary hover:bg-brand-dark text-white">
                  {isLoading
                    ? mode === "create"
                      ? "Creating..."
                      : "Updating..."
                    : mode === "create"
                      ? "Create Customer"
                      : "Update Customer"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
