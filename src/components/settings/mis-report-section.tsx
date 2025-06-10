"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { customerApi, misApi } from "../../lib/api"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { FileText, Download, Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar as CalendarComponent } from "../ui/calendar"
import { format } from "date-fns"
import { cn } from "../../lib/utils"

const misSchema = Yup.object().shape({
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date().required("End date is required").min(Yup.ref("startDate"), "End date must be after start date"),
  customerName: Yup.string().required("Customer name is required"),
  reportType: Yup.string().required("Report type is required"),
})

export function MisReportSection() {
  const { toast } = useToast()
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerApi.getCustomers({ page: 0, limit: 100 }),
  })

  // Generate MIS report mutation
  const generateReportMutation = useMutation({
    mutationFn: misApi.generateReport,
    onSuccess: (data) => {
      if (data.url) {
        // Download the file
        const link = document.createElement("a")
        link.href = data.url
        link.download = `MIS_Report_${Date.now()}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Success",
          description: "MIS report generated and downloaded successfully",
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate MIS report",
        variant: "destructive",
      })
    },
  })

  const handleGenerateReport = (values: any) => {
    generateReportMutation.mutate({
      type: values.reportType,
      fromDate: format(values.startDate, "yyyy-MM-dd"),
      toDate: format(values.endDate, "yyyy-MM-dd"),
      customerName: values.customerName,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          MIS Report Generation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            startDate: null,
            endDate: null,
            customerName: "",
            reportType: "",
          }}
          validationSchema={misSchema}
          onSubmit={handleGenerateReport}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                          errors.startDate && touched.startDate && "border-red-500",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date)
                          setFieldValue("startDate", date)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && touched.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground",
                          errors.endDate && touched.endDate && "border-red-500",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date)
                          setFieldValue("endDate", date)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && touched.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Select value={values.customerName} onValueChange={(value) => setFieldValue("customerName", value)}>
                  <SelectTrigger className={errors.customerName && touched.customerName ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersData?.customers?.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.companyName}>
                        {customer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerName && touched.customerName && (
                  <p className="text-sm text-red-500">{errors.customerName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type *</Label>
                <Select value={values.reportType} onValueChange={(value) => setFieldValue("reportType", value)}>
                  <SelectTrigger className={errors.reportType && touched.reportType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Invoice">Invoice</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Order">Order</SelectItem>
                  </SelectContent>
                </Select>
                {errors.reportType && touched.reportType && <p className="text-sm text-red-500">{errors.reportType}</p>}
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={generateReportMutation.isPending}
                  className="bg-brand-primary hover:bg-brand-dark text-white px-8"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {generateReportMutation.isPending ? "Generating..." : "Download Excel"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  )
}
