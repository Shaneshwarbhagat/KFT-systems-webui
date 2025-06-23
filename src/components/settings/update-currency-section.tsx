"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useToast } from "../../hooks/use-toast"
import { currencyApi } from "../../lib/api"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { DollarSign } from "lucide-react"

const currencySchema = Yup.object().shape({
  hkdToMop: Yup.number().positive("Rate must be positive").required("HKD to MOP rate is required"),
  hkdToCny: Yup.number().positive("Rate must be positive").required("HKD to CNY rate is required"),
})

export function UpdateCurrencySection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current currency rates
  const { data: currencyData } = useQuery({
    queryKey: ["currencies"],
    queryFn: currencyApi.getCurrencies,
  })

  const currencyId = currencyData?.currency?.[0]?.id || null;

  // Update currency mutation
  const updateCurrencyMutation = useMutation({
    mutationFn: ({ hkdToMop, hkdToCny }: { hkdToMop: number; hkdToCny: number }) =>
      currencyApi.updateCurrency(currencyId, { hkdToMop, hkdToCny }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] }) // triggers refetch
      toast({
        title: "Success",
        description: "Currency rates updated successfully",
        className: "bg-success text-white",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update currency rates",
        variant: "destructive",
      })
    },
  })

  const handleCurrencyUpdate = (values: any) => {
    updateCurrencyMutation.mutate({
      hkdToMop: Number.parseFloat(values.hkdToMop),
      hkdToCny: Number.parseFloat(values.hkdToCny),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Currency Exchange Rates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            hkdToMop: "",
            hkdToCny: "",
          }}
          validationSchema={currencySchema}
          onSubmit={handleCurrencyUpdate}
        >
          {({ errors, touched }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hkdToMop">1 HKD = ___ MOP</Label>
                <Field
                  as={Input}
                  id="hkdToMop"
                  name="hkdToMop"
                  type="number"
                  step="0.0001"
                  placeholder="Enter MOP rate"
                  className={errors.hkdToMop && touched.hkdToMop ? "border-red-500" : ""}
                />
                {errors.hkdToMop && touched.hkdToMop && <p className="text-sm text-red-500">{errors.hkdToMop}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hkdToCny">1 HKD = ___ CNY</Label>
                <Field
                  as={Input}
                  id="hkdToCny"
                  name="hkdToCny"
                  type="number"
                  step="0.0001"
                  placeholder="Enter CNY rate"
                  className={errors.hkdToCny && touched.hkdToCny ? "border-red-500" : ""}
                />
                {errors.hkdToCny && touched.hkdToCny && <p className="text-sm text-red-500">{errors.hkdToCny}</p>}
              </div>

              <Button
                type="submit"
                disabled={updateCurrencyMutation.isPending}
                className="w-full bg-brand-primary hover:bg-brand-dark text-white"
              >
                {updateCurrencyMutation.isPending ? "Updating..." : "Update Rates"}
              </Button>
            </Form>
          )}
        </Formik>

        {/* Currency List Display */}
        {currencyData?.currency?.length ? (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Current Exchange Rates</h4>
            <div className="space-y-2">
              {currencyData?.currency?.map((currency: any, index: number) => (
                <div key={index} className="space-y-1 text-sm text-gray-600">
                  <p>1 HKD = {currency?.hkdToMop} MOP</p>
                  <p>1 HKD = {currency?.hkdToCny} CNY</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Current Exchange Rates</h4>
            <div className="space-y-2">No currency rate defined</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
