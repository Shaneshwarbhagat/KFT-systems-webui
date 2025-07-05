"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { orderApi } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import { useToast } from "../../hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"

interface Order {
  id: string
  orderNumber: string
  invoiceNumber: string
  partialDelivery: boolean
  amountOfDelivery: string
  currency: string
  customerId: string
  customer: {
    companyName: string
    contactPersonName: string
  }
}

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
}

export function EditOrderModal({ isOpen, onClose, order }: EditOrderModalProps) {
  const [formData, setFormData] = useState({
    deliveryStatus: false,
    deliveredValue: "",
    currency: "",
  })

  console.log("ORDER:", order)

  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (order) {
      setFormData({
        deliveryStatus: order.partialDelivery,
        deliveredValue: order.amountOfDelivery,
        currency: order.currency,
      })
    }
  }, [order])

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => orderApi.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast({
        title: "Success",
        description: "Order updated successfully",
        className: "bg-success text-white",
      })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!order || !formData.deliveredValue || !formData.currency) {
      toast({
        title: "Error",
        description: "Please fill in all * required fields",
        variant: "destructive",
      })
      return
    }

    const updateData = {
      partialDelivery: formData.deliveryStatus,
      amountOfDelivery: Number(formData.deliveredValue),
      currency: formData.currency,
      customerId: order?.customerId || "",
      invoiceNumber: order?.invoiceNumber || ""
    }

    updateMutation.mutate({ id: order.id, data: updateData })
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Edit Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Invoice Number:</span>
              <span className="text-gray-900">{order.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Company Name:</span>
              <span className="text-gray-900">{order.customer.companyName}</span>
            </div>
          </div>

          {/* Delivery Status */}
          <div className="space-y-3">
            <Label>Delivery Status</Label>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-yes"
                  checked={formData.deliveryStatus === true}
                  onCheckedChange={() => setFormData((prev) => ({ ...prev, deliveryStatus: true }))}
                />
                <Label htmlFor="status-yes" className="text-sm font-normal">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-no"
                  checked={formData.deliveryStatus === false}
                  onCheckedChange={() => setFormData((prev) => ({ ...prev, deliveryStatus: false }))}
                />
                <Label htmlFor="status-no" className="text-sm font-normal">
                  No
                </Label>
              </div>
            </div>
          </div>

          {/* Delivered Value */}
          <div className="space-y-2">
            <Label htmlFor="deliveredValue">Delivered Value *</Label>
            <Input
              id="deliveredValue"
              type="number"
              step="0.01"
              placeholder="Enter delivered value"
              value={formData.deliveredValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, deliveredValue: e.target.value }))}
              min="0"
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-brand-primary hover:bg-brand-dark text-white"
            >
              {updateMutation.isPending ? "Updating..." : "Update Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
