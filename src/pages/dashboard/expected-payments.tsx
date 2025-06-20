"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useToast } from "../../hooks/use-toast"
import { expectedPaymentApi, invoiceApi, customerApi } from "../../lib/api"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { Calendar, Save } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Calendar as CalendarComponent } from "../../components/ui/calendar"
import { format } from "date-fns"
import { cn } from "../../lib/utils"
import { Input } from "../../components/ui/input"
import { useTranslation } from "react-i18next"

const expectedPaymentSchema = Yup.object().shape({
  invoiceNumber: Yup.string().required("Invoice number is required"),
  customerName: Yup.string().required("Customer name is required"),
  expectedDate: Yup.date().required("Expected date is required"),
})

export default function ExpectedPaymentsPage() {
  const { t } = useTranslation()
  const [expectedDate, setExpectedDate] = useState<Date>()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch invoices for dropdown
  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceApi.getInvoices({ page: 0, limit: 100 }),
  })

  // Fetch customers for auto-population
  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerApi.getCustomers({ page: 0, limit: 100 }),
  })

  // Save expected payment mutation
  const saveExpectedPaymentMutation = useMutation({
    mutationFn: expectedPaymentApi.saveExpectedPayment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expected payment date saved successfully",
      })
      queryClient.invalidateQueries({ queryKey: ["expected-payments"] })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save expected payment date",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (values: any, { resetForm }: any) => {
    saveExpectedPaymentMutation.mutate(values, {
      onSuccess: () => {
        resetForm()
        setExpectedDate(undefined)
      },
    })
  }

  const getCustomerNameByInvoice = (invoiceNumber: string) => {
    const invoice = invoicesData?.invoices?.find((inv: any) => inv.invoiceNumber === invoiceNumber)
    if (invoice) {
      const customer = customersData?.customers?.find((cust: any) => cust.id === invoice.customerId)
      return customer?.companyName || ""
    }
    return ""
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("expectedPayment.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("expectedPayment.subtitle")}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("expectedPayment.cardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              invoiceNumber: "",
              customerName: "",
              expectedDate: null,
            }}
            validationSchema={expectedPaymentSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">{t("expectedPayment.invoiceNumberLabel")}</Label>
                  <Select
                    value={values.invoiceNumber}
                    onValueChange={(value) => {
                      setFieldValue("invoiceNumber", value)
                      const customerName = getCustomerNameByInvoice(value)
                      setFieldValue("customerName", customerName)
                    }}
                  >
                    <SelectTrigger className={errors.invoiceNumber && touched.invoiceNumber ? "border-red-500" : ""}>
                      <SelectValue placeholder={t("expectedPayment.selectInvoicePlaceholder")}/>
                    </SelectTrigger>
                    {invoicesData?.invoices && invoicesData?.invoices?.length  ? <SelectContent>
                        {invoicesData?.invoices?.map((invoice: any) => (
                          <SelectItem key={invoice.id} value={invoice.invoiceNumber}>
                            {invoice.invoiceNumber}
                          </SelectItem>
                        ))}
                      </SelectContent> : 
                      <SelectContent>
                        <p className="text-sm p-2">{t("expectedPayment.noInvoices")}</p>
                      </SelectContent>
                    }
                  </Select>
                  {errors.invoiceNumber && touched.invoiceNumber && (
                    <p className="text-sm text-red-500">{errors.invoiceNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">{t("expectedPayment.customerNameLabel")}</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={values.customerName}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800"
                    placeholder={t("expectedPayment.customerNamePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("expectedPayment.dateLabel")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expectedDate && "text-muted-foreground",
                          errors.expectedDate && touched.expectedDate && "border-red-500",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {expectedDate ? format(expectedDate, "PPP") : t("expectedPayment.pickDatePlaceholder")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={expectedDate}
                        onSelect={(date) => {
                          setExpectedDate(date)
                          setFieldValue("expectedDate", date)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.expectedDate && touched.expectedDate && (
                    <p className="text-sm text-red-500">{errors.expectedDate}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={saveExpectedPaymentMutation.isPending}
                  className="w-full bg-brand-primary hover:bg-brand-dark text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveExpectedPaymentMutation.isPending ? t("expectedPayment.saving") : t("expectedPayment.saveButton")}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
