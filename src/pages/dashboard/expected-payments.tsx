"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import { expectedPaymentApi, invoiceApi, customerApi } from "../../lib/api";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Calendar, Save } from "lucide-react";
import { Input } from "../../components/ui/input";
import { useTranslation } from "react-i18next";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const expectedPaymentSchema = Yup.object().shape({
  invoiceNumber: Yup.string().required("Invoice number is required"),
  customerName: Yup.string().notRequired(),
  expectedPaymentDate: Yup.date().required("Expected date is required"),
});

export default function ExpectedPaymentsPage() {
  const { t } = useTranslation();
  const [expectedDate, setExpectedDate] = useState<Date | null>(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch invoices for dropdown
  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceApi.getInvoices({ page: 0, limit: 100 }),
  });

  const invoices = invoicesData?.invoices || [];

  // Save expected payment mutation
  const saveExpectedPaymentMutation = useMutation({
    mutationFn: (values: any) => {
      const {invoiceId, customerName, invoiceNumber, ...finalValue} = values
      return expectedPaymentApi.saveExpectedPayment(values.invoiceId, finalValue);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expected payment date saved successfully",
        className: "bg-success text-white [&_button]:text-white",
      });
      queryClient.invalidateQueries({ queryKey: ["expected-payments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to save expected payment date",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any, { resetForm }: any) => {
    const currentDate = new Date();

    const dateToUse = values.expectedPaymentDate
      ? values.expectedPaymentDate
      : currentDate;

    const updatedValues = {
      ...values,
      expectedPaymentDate: dateToUse.toISOString().split(".")[0] + "Z",
    };

    saveExpectedPaymentMutation.mutate(updatedValues, {
      onSuccess: () => {
        resetForm();
        setExpectedDate(null);
      },
    });
  };

  const getInvoiceDetail = (invoiceNumber: string) => {
    const invoice = invoices?.find(
      (inv: any) => inv.invoiceNumber === invoiceNumber
    );
    if (invoice) {
      return {
        customerName: invoice?.customer?.companyName,
        customerId: invoice?.customerId,
        invoiceDate: invoice?.invoiceDate,
        invoiceId: invoice?.id,
      };
    }
    return {};
  };

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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Formik
              initialValues={{
                invoiceNumber: "",
                customerName: "",
                expectedPaymentDate: new Date(),
              }}
              validationSchema={expectedPaymentSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, setFieldValue, values }) => {
                useEffect(() => {
                  setFieldValue("expectedPaymentDate", expectedDate);
                }, []);
                return (
                  <Form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">
                        {t("expectedPayment.invoiceNumberLabel")}
                      </Label>
                      <Select
                        value={values.invoiceNumber}
                        onValueChange={(value) => {
                          setFieldValue("invoiceNumber", value);
                          const invoiceDetail = getInvoiceDetail(value);
                          setFieldValue("customerName", invoiceDetail.customerName);
                          setFieldValue("customerId", invoiceDetail.customerId);
                          setFieldValue("invoiceDate", invoiceDetail.invoiceDate);
                          setFieldValue("invoiceId", invoiceDetail.invoiceId);
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors.invoiceNumber && touched.invoiceNumber
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue
                            placeholder={t(
                              "expectedPayment.selectInvoicePlaceholder"
                            )}
                          />
                        </SelectTrigger>
                        {invoicesData?.invoices &&
                        invoicesData?.invoices?.length ? (
                          <SelectContent>
                            {invoicesData?.invoices?.map((invoice: any) => (
                              <SelectItem
                                key={invoice.id}
                                value={invoice.invoiceNumber}
                              >
                                {invoice.invoiceNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        ) : (
                          <SelectContent>
                            <p className="text-sm p-2">
                              {t("expectedPayment.noInvoices")}
                            </p>
                          </SelectContent>
                        )}
                      </Select>
                      {errors.invoiceNumber && touched.invoiceNumber && (
                        <p className="text-sm text-red-500">
                          {errors.invoiceNumber}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerName">
                        {t("expectedPayment.customerNameLabel")}
                      </Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={values.customerName}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800"
                        placeholder={t(
                          "expectedPayment.customerNamePlaceholder"
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t("expectedPayment.dateLabel")}</Label>
                      <DatePicker
                        value={expectedDate}
                        onChange={(date) => {
                          setExpectedDate(date);
                          setFieldValue("expectedPaymentDate", date);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!(
                              errors.expectedPaymentDate &&
                              touched.expectedPaymentDate
                            ),
                            helperText:
                              errors.expectedPaymentDate &&
                              touched.expectedPaymentDate
                                ? String(errors.expectedPaymentDate)
                                : "",
                          },
                          popper: {
                            placement: "bottom-start",
                          },
                        }}
                        format="dd/MM/yyyy"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={saveExpectedPaymentMutation.isPending}
                      className="w-full bg-brand-primary hover:bg-brand-dark text-white"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saveExpectedPaymentMutation.isPending
                        ? t("expectedPayment.saving")
                        : t("expectedPayment.saveButton")}
                    </Button>
                  </Form>
                );
              }}
            </Formik>
          </LocalizationProvider>
        </CardContent>
      </Card>
    </div>
  );
}
