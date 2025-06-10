"use client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { invoiceApi, customerApi } from "../../lib/api"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"

const invoiceSchema = Yup.object().shape({
  invoiceNumber: Yup.string().required("Invoice number is required"),
  customerId: Yup.string().required("Customer is required"),
  amount: Yup.number().positive("Amount must be positive").required("Amount is required"),
  currency: Yup.string().required("Currency is required"),
  totalUnits: Yup.number().positive("Units must be positive").required("Total units is required"),
})

interface InvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: any
  onSuccess: () => void
}

export function InvoiceModal({ open, onOpenChange, invoice, onSuccess }: InvoiceModalProps) {
  const { toast } = useToast()
  const isEditing = !!invoice

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerApi.getList({ page: 1, limit: 100 }),
    enabled: open,
  })

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: isEditing ? invoiceApi.update : invoiceApi.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Invoice ${isEditing ? "updated" : "created"} successfully`,
      })
      onSuccess()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} invoice`,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (values: any) => {
    if (isEditing) {
      mutation.mutate({ id: invoice.id, ...values })
    } else {
      mutation.mutate(values)
    }
  }

  const customers = customersData?.data || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {isEditing ? "Edit Invoice" : "Create New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            invoiceNumber: invoice?.invoiceNumber || "",
            customerId: invoice?.customerId || "",
            amount: invoice?.amount || "",
            currency: invoice?.currency || "HKD",
            totalUnits: invoice?.totalUnits || "",
          }}
          validationSchema={invoiceSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber" className="text-gray-700 dark:text-gray-300">
                    Invoice Number *
                  </Label>
                  <Field
                    as={Input}
                    id="invoiceNumber"
                    name="invoiceNumber"
                    placeholder="Enter invoice number"
                    className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                      errors.invoiceNumber && touched.invoiceNumber ? "border-red-500" : ""
                    }`}
                  />
                  {errors.invoiceNumber && touched.invoiceNumber && (
                    <p className="text-sm text-red-500">{errors.invoiceNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerId" className="text-gray-700 dark:text-gray-300">
                    Customer *
                  </Label>
                  <Select value={values.customerId} onValueChange={(value) => setFieldValue("customerId", value)}>
                    <SelectTrigger
                      className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                        errors.customerId && touched.customerId ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id} className="text-gray-900 dark:text-gray-100">
                          {customer.companyName || customer.contactPersonName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.customerId && touched.customerId && (
                    <p className="text-sm text-red-500">{errors.customerId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300">
                    Amount *
                  </Label>
                  <Field
                    as={Input}
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                      errors.amount && touched.amount ? "border-red-500" : ""
                    }`}
                  />
                  {errors.amount && touched.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-gray-700 dark:text-gray-300">
                    Currency *
                  </Label>
                  <Select value={values.currency} onValueChange={(value) => setFieldValue("currency", value)}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="HKD" className="text-gray-900 dark:text-gray-100">
                        HKD
                      </SelectItem>
                      <SelectItem value="MOP" className="text-gray-900 dark:text-gray-100">
                        MOP
                      </SelectItem>
                      <SelectItem value="CNY" className="text-gray-900 dark:text-gray-100">
                        CNY
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalUnits" className="text-gray-700 dark:text-gray-300">
                    Total Units *
                  </Label>
                  <Field
                    as={Input}
                    id="totalUnits"
                    name="totalUnits"
                    type="number"
                    placeholder="0"
                    className={`bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                      errors.totalUnits && touched.totalUnits ? "border-red-500" : ""
                    }`}
                  />
                  {errors.totalUnits && touched.totalUnits && (
                    <p className="text-sm text-red-500">{errors.totalUnits}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 bg-brand-primary hover:bg-brand-dark text-white"
                >
                  {mutation.isPending ? "Saving..." : isEditing ? "Update Invoice" : "Create Invoice"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
