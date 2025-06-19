"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { orderApi } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import { useToast } from "../../hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"

interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customer: {
    companyName: string
    contactPersonName: string
  }
}

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  invoices: Invoice[]
}

export function CreateOrderModal({ isOpen, onClose, invoices }: CreateOrderModalProps) {
  const [formData, setFormData] = useState({
    invoiceId: "",
    partialDelivery: false,
    deliveryUnits: "",
    currency: "",
    deliveryValue: "",
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const selectedInvoice = invoices.find((inv) => inv.id === formData.invoiceId)

  const createMutation = useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast({
        title: "Success",
        description: "Order created successfully",
        className: "bg-success text-white",
      })
      onClose()
      resetForm()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create order",
        variant: "destructive",
      })
    },
  })

  const resetForm = () => {
    setFormData({
      invoiceId: "",
      partialDelivery: false,
      deliveryUnits: "",
      currency: "",
      deliveryValue: "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.invoiceId || !formData.deliveryUnits || !formData.currency || !formData.deliveryValue) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const orderData = {
      invoiceId: formData.invoiceId,
      partialDelivery: formData.partialDelivery,
      deliveredUnits: Number.parseInt(formData.deliveryUnits),
      currency: formData.currency,
      amountOfDelivery: formData.deliveryValue,
    }

    createMutation.mutate(orderData)
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[98vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Create New Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Selection */}
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice Number *</Label>
            <Select
              value={formData.invoiceId}
              onValueChange={(value: any) => setFormData((prev) => ({ ...prev, invoiceId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Name (Disabled) */}
          {selectedInvoice && (
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input id="customer" value={selectedInvoice.customer.companyName} disabled className="bg-gray-50" />
            </div>
          )}

          {/* Partial Delivery */}
          <div className="space-y-3">
            <Label>Partial Delivery</Label>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="partial-yes"
                  checked={formData.partialDelivery === true}
                  onCheckedChange={() => setFormData((prev) => ({ ...prev, partialDelivery: true }))}
                />
                <Label htmlFor="partial-yes" className="text-sm font-normal">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="partial-no"
                  checked={formData.partialDelivery === false}
                  onCheckedChange={() => setFormData((prev) => ({ ...prev, partialDelivery: false }))}
                />
                <Label htmlFor="partial-no" className="text-sm font-normal">
                  No
                </Label>
              </div>
            </div>
          </div>

          {/* Delivery Units */}
          <div className="space-y-2">
            <Label htmlFor="deliveryUnits">Delivery Units *</Label>
            <Input
              id="deliveryUnits"
              type="number"
              placeholder="Enter delivery units"
              value={formData.deliveryUnits}
              onChange={(e:any) => setFormData((prev) => ({ ...prev, deliveryUnits: e.target.value }))}
              min="0"
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select
              value={formData.currency}
              onValueChange={(value: any) => setFormData((prev) => ({ ...prev, currency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HKD">HKD</SelectItem>
                <SelectItem value="MOP">MOP</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Value */}
          <div className="space-y-2">
            <Label htmlFor="deliveryValue">Delivery Value *</Label>
            <Input
              id="deliveryValue"
              type="number"
              step="0.01"
              placeholder="Enter delivery value"
              value={formData.deliveryValue}
              onChange={(e: any) => setFormData((prev) => ({ ...prev, deliveryValue: e.target.value }))}
              min="0"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-brand-primary hover:bg-brand-dark text-white"
            >
              {createMutation.isPending ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
