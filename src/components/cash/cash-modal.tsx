"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { useToast } from "../../hooks/use-toast"
import { cashApi, customerApi, invoiceApi } from "../../lib/api"
import { LoadingSpinner } from "../ui/loading-spinner"
import { useEffect, useState } from "react"

const cashSchema = Yup.object().shape({
  invoiceNumber: Yup.string().required("Invoice number is required"),
  customerId: Yup.string().notRequired(),
  amount: Yup.number().positive("Amount must be positive").required("Amount is required"),
  currency: Yup.string().required("Currency is required"),
  pickedBy: Yup.string().required("Picked by is required"),
  cashPickupDate: Yup.date().required("Pickup date is required"),
  pickupTime: Yup.string().required("Pickup time is required"),
})

interface CashFormValues {
  invoiceNumber: string;
  customerId: string;
  amount: number | string;
  currency: string;
  pickedBy: string;
  cashPickupDate: string; // ISO date string
  pickupTime: string;
  partialDelivery: boolean;
}

interface CashModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cash?: any
}

export function CashModal({ open, onOpenChange, cash }: CashModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [customerNameId, setCustomerNameId] = useState({customerName: "", customerId: ""})

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerApi.getCustomers({ page: 0, limit: 100 }),
    enabled: open,
  })

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceApi.getInvoices({ page: 0, limit: 100 }),
    enabled: open,
  })

  const createMutation = useMutation({
    mutationFn: cashApi.createCash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash"] })
      toast({
        title: "Success",
        description: "Cash receipt created successfully",
      })
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create cash receipt",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cashApi.updateCash(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash"] })
      toast({
        title: "Success",
        description: "Cash receipt updated successfully",
      })
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cash receipt",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (values: any) => {
    if (cash) {
      updateMutation.mutate({ id: cash.id, data: values })
    } else {
      createMutation.mutate({...values, customerId: customerNameId.customerId})
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cash ? "Edit Cash Receipt" : "Create Cash Receipt"}</DialogTitle>
          <DialogDescription>{cash ? "Update cash receipt details" : "Create a new cash receipt"}</DialogDescription>
        </DialogHeader>

        <Formik<CashFormValues>
          initialValues={{
            invoiceNumber: cash?.invoiceNumber || "",
            customerId: cash?.customerId || "",
            amount: cash?.amount || "",
            currency: cash?.currency || "HKD",
            pickedBy: cash?.pickedBy || "",
            cashPickupDate: cash?.cashPickupDate || new Date().toISOString().split("T")[0],
            pickupTime: cash?.pickupTime || "",
            partialDelivery: cash?.partialDelivery || false,
          }}
          validationSchema={cashSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => {

            useEffect(() => {
              const invoice = invoices?.invoices?.find((inv:any) => inv.invoiceNumber === values.invoiceNumber)
              if (invoice) setCustomerNameId({customerName: invoice?.customer?.companyName || invoice?.customer?.contactPersonName || "No customer found", customerId: invoice.customerId})
            }, [values.invoiceNumber, invoices])

            return <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Select value={values.invoiceNumber} onValueChange={(value) => setFieldValue("invoiceNumber", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices?.invoices?.map((invoice: any) => (
                        <SelectItem key={invoice.id} value={invoice.invoiceNumber}>
                          {invoice.invoiceNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.invoiceNumber && touched.invoiceNumber && (
                    <p className="text-sm text-red-500">{errors.invoiceNumber}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerId">Customer Name</Label>
                <Input value={customerNameId.customerName} readOnly disabled className="bg-gray-100" />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="customerId">Customer</Label>
                <Select value={values.customerId} onValueChange={(value) => setFieldValue("customerId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.customers?.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && touched.customerId && <p className="text-sm text-red-500">{errors.customerId}</p>}
              </div> */}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Field
                    as={Input}
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    className={errors.amount && touched.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && touched.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={values.currency} onValueChange={(value) => setFieldValue("currency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HKD">HKD</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                      <SelectItem value="MOP">MOP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickedBy">Picked By</Label>
                  <Field
                    as={Input}
                    id="pickedBy"
                    name="pickedBy"
                    placeholder="Person name"
                    className={errors.pickedBy && touched.pickedBy ? "border-red-500" : ""}
                  />
                  {errors.pickedBy && touched.pickedBy && <p className="text-sm text-red-500">{errors.pickedBy}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupTime">Pickup Time</Label>
                  <Field
                    as={Input}
                    id="pickupTime"
                    name="pickupTime"
                    type="time"
                    className={errors.pickupTime && touched.pickupTime ? "border-red-500" : ""}
                  />
                  {errors.pickupTime && touched.pickupTime && (
                    <p className="text-sm text-red-500">{errors.pickupTime}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashPickupDate">Pickup Date</Label>
                <Field
                  as={Input}
                  id="cashPickupDate"
                  name="cashPickupDate"
                  type="date"
                  className={errors.cashPickupDate && touched.cashPickupDate ? "border-red-500" : ""}
                />
                {errors.cashPickupDate && touched.cashPickupDate && (
                  <p className="text-sm text-red-500">{errors.cashPickupDate}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="partialDelivery"
                  checked={values.partialDelivery}
                  onCheckedChange={(checked) => setFieldValue("partialDelivery", checked)}
                />
                <Label htmlFor="partialDelivery">Partial Payment</Label>
              </div>
              <div className="text-xs italic">By default it is not partial payment, checkmark if have partial payment  </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-brand-primary hover:bg-brand-dark text-white">
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {cash ? "Updating..." : "Creating..."}
                    </>
                  ) : cash ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </Form>
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
