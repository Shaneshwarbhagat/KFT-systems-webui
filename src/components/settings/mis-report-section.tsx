"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { customerApi, misApi } from "../../lib/api"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { FileText, Download } from "lucide-react"
import { format } from "date-fns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { createTheme, ThemeProvider } from "@mui/material/styles"

const misSchema = Yup.object().shape({
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date().required("End date is required").min(Yup.ref("startDate"), "End date must be after start date"),
  customerName: Yup.string().required("Customer name is required"),
  reportType: Yup.string().required("Report type is required"),
})

// Create MUI theme for better integration
const muiTheme = createTheme({
  palette: {
    mode: "light",
  }
})

export function MisReportSection() {
  const { toast } = useToast()
  const currentDate = new Date()
  const [startDate, setStartDate] = useState<Date>(currentDate)
  const [endDate, setEndDate] = useState<Date>(currentDate)

  // Set current date as default when component mounts
  useEffect(() => {
    const today = new Date()
    setStartDate(today)
    setEndDate(today)
  }, [])

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerApi.getCustomers(),
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
          className: "bg-success text-white [&_button]:text-white",
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
    // Use state values if form values are not available
    const reportStartDate = values.startDate || startDate
    const reportEndDate = values.endDate || endDate

    generateReportMutation.mutate({
      type: values.reportType,
      fromDate: format(reportStartDate, "yyyy-MM-dd"),
      toDate: format(reportEndDate, "yyyy-MM-dd"),
      customerId: values.customerName,
    })
  }

  const handleStartDateChange = (newValue: Date | null, setFieldValue: any) => {
    if (newValue) {
      setStartDate(newValue)
      setFieldValue("startDate", newValue)

      // If end date is before new start date, update end date
      if (endDate < newValue) {
        setEndDate(newValue)
        setFieldValue("endDate", newValue)
      }
    }
  }

  const handleEndDateChange = (newValue: Date | null, setFieldValue: any) => {
    if (newValue) {
      setEndDate(newValue)
      setFieldValue("endDate", newValue)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="h-5 w-5" />
          MIS Report Generation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ThemeProvider theme={muiTheme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Formik
              initialValues={{
                startDate: startDate,
                endDate: endDate,
                customerName: "",
                reportType: "",
              }}
              validationSchema={misSchema}
              onSubmit={handleGenerateReport}
              enableReinitialize
            >
              {({ errors, touched, setFieldValue, values }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="form-label">Start Date *</Label>
                      <DatePicker
                        value={startDate}
                        onChange={(newValue) => handleStartDateChange(newValue, setFieldValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!(errors.startDate && touched.startDate),
                            helperText: errors.startDate && touched.startDate ? String(errors.startDate) : "",
                          },
                          popper: {
                            placement: "bottom-start",
                          },
                        }}
                        format="dd/MM/yyyy"
                        disableFuture
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="form-label">End Date *</Label>
                      <DatePicker
                        value={endDate}
                        onChange={(newValue) => handleEndDateChange(newValue, setFieldValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!(errors.endDate && touched.endDate),
                            helperText: errors.endDate && touched.endDate ? String(errors.endDate) : "",
                          },
                          popper: {
                            placement: "bottom-start",
                          },
                        }}
                        format="dd/MM/yyyy"
                        minDate={startDate}
                        shouldDisableDate={(date) => date < startDate}
                        disableFuture 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="form-label">
                      Customer Name *
                    </Label>
                    <Select value={values.customerName} onValueChange={(value) => setFieldValue("customerName", value)}>
                      <SelectTrigger
                        className={`form-input ${errors.customerName && touched.customerName ? "border-red-500" : ""}`}
                      >
                        <SelectValue
                          placeholder={customersData?.customers?.length === 0 ? "No customer found" : "Select customer"}
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border z-50">
                        {customersData?.customers?.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.customerName && touched.customerName && (
                      <p className="text-sm text-red-500">{String(errors.customerName)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reportType" className="form-label">
                      Report Type *
                    </Label>
                    <Select value={values.reportType} onValueChange={(value) => setFieldValue("reportType", value)}>
                      <SelectTrigger
                        className={`form-input ${errors.reportType && touched.reportType ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border z-50">
                        <SelectItem value="Invoice">Invoice</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Order">Order</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.reportType && touched.reportType && (
                      <p className="text-sm text-red-500">{String(errors.reportType)}</p>
                    )}
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
          </LocalizationProvider>
        </ThemeProvider>
      </CardContent>
    </Card>
  )
}
