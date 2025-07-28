"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { currencyApi, orderApi } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { useToast } from "../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  amountInHkd: string;
  remainingAmount: number
  customer: {
    companyName: string;
    contactPersonName: string;
  };
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
}

export function CreateOrderModal({
  isOpen,
  onClose,
  invoices,
}: CreateOrderModalProps) {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    partialDelivery: false,
    currency: "HKD",
    deliveryUnits: 0,
    amountOfDelivery: "",
    orderNumber: "",
  });

  //selected Order values
  const selectedInvoice = invoices.find(
    (inv) => inv.invoiceNumber === formData.invoiceNumber
  );

  const [currencyRates, setCurrencyRates] = useState({
    hkdToMop: 1.03, // Default values in case API fails
    hkdToCny: 0.93,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch currency rates when modal opens
  useEffect(() => {
    if (isOpen) {
      currencyApi.getCurrencies().then((data) => {
        if (data?.currency?.[0]) {
          setCurrencyRates({
            hkdToMop: data.currency[0].hkdToMop,
            hkdToCny: data.currency[0].hkdToCny,
          });
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedInvoice) {
      setFormData(prev => ({
        ...prev,
        amountOfDelivery: selectedInvoice.remainingAmount === 0 ? Number(selectedInvoice?.amountInHkd).toFixed(2): Number(selectedInvoice.remainingAmount).toFixed(2),
      }))
    }
  }, [selectedInvoice]);

  // Convert amount from HKD to selected currency
  const convertFromHKD = (hkdAmount: number, currency: string) => {
    if (currency === "HKD") return hkdAmount;
    if (currency === "MOP") return hkdAmount * currencyRates.hkdToMop;
    if (currency === "CNY") return hkdAmount * currencyRates.hkdToCny;
    return hkdAmount;
  };

  // Convert amount from selected currency to HKD
  const convertToHKD = (amount: number, currency: string) => {
    if (currency === "HKD") return amount;
    if (currency === "MOP") return amount / currencyRates.hkdToMop;
    if (currency === "CNY") return amount / currencyRates.hkdToCny;
    return amount;
  };

  // Get remaining amount in selected currency
  const getRemainingAmountInCurrency = (currency: string) => {
    if (!selectedInvoice) return 0;
    return convertFromHKD(selectedInvoice.remainingAmount, currency);
  };

  const createMutation = useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: "Order created successfully",
        className: "bg-success text-white [&_button]:text-white",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      invoiceNumber: "",
      partialDelivery: false,
      currency: "HKD",
      deliveryUnits: 0,
      amountOfDelivery: "",
      orderNumber: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.invoiceNumber || !formData.currency || !formData.amountOfDelivery) {
      toast({
        title: "Error",
        description: "Please fill in all * required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.amountOfDelivery == "0" || formData.amountOfDelivery == "0.00") {
      toast({
        title: "Error",
        description: "Delivery amount cannot be 0.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedInvoice || selectedInvoice.remainingAmount <= 0) {
      toast({
        title: "Error",
        description: "Cannot create order. Invoice is already fulfilled.",
        variant: "destructive",
      });
      return;
    }

    const amountInHKD = convertToHKD(Number(formData.amountOfDelivery), formData.currency);
    if (amountInHKD > selectedInvoice.remainingAmount) {
      const maxInCurrency = convertFromHKD(selectedInvoice.remainingAmount, formData.currency);
      toast({
        title: "Error",
        description: `Amount exceeds remaining balance. Maximum allowed is ${maxInCurrency.toFixed(2)} ${formData.currency} (${selectedInvoice.remainingAmount.toFixed(2)} HKD)`,
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      invoiceNumber: formData.invoiceNumber,
      partialDelivery: formData.partialDelivery,
      deliveredUnits: Number(formData.deliveryUnits),
      currency: formData.currency,
      amountOfDelivery: Number(parseFloat(formData.amountOfDelivery).toFixed(2)),
      orderNumber: `ORD-${formData.invoiceNumber}`,
      customerId: selectedInvoice.customerId,
    };

    createMutation.mutate(orderData);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleCurrencyChange = (value: string) => {
    const currentAmount = formData.amountOfDelivery ? Number(formData.amountOfDelivery) : 0;
    const currentAmountHKD = convertToHKD(currentAmount, formData.currency);
    const newAmount = convertFromHKD(currentAmountHKD, value);
    
    setFormData(prev => ({
      ...prev,
      currency: value,
      amountOfDelivery: newAmount.toFixed(2),
    }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or valid numbers
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        amountOfDelivery: value,
      }));
    }
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setFormData(prev => ({...prev, amountOfDelivery: ""}));
      return;
    }

    // Round to 2 decimal places
    value = Math.round(value * 100) / 100;
    
    if (selectedInvoice) {
      const amountInHKD = convertToHKD(value, formData.currency);
      if (amountInHKD > selectedInvoice.remainingAmount) {
        const maxInCurrency = convertFromHKD(selectedInvoice.remainingAmount, formData.currency);
        value = maxInCurrency;
        toast({
          title: "Warning",
          description: `Amount adjusted to maximum allowed value of ${maxInCurrency.toFixed(2)} ${formData.currency}`,
          variant: "destructive",
        });
      }
    }

    setFormData(prev => ({
      ...prev,
      amountOfDelivery: value.toFixed(2),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[98vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create New Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice Number *</Label>
            <Select
              value={formData.invoiceNumber}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  invoiceNumber: value,
                  amountOfDelivery: "",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an invoice" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {invoices.map((invoice) => (
                  <SelectItem
                    key={invoice.invoiceNumber}
                    value={invoice.invoiceNumber}
                    disabled={invoice.remainingAmount <= 0}
                  >
                    {invoice.invoiceNumber} {invoice.remainingAmount <= 0 || invoice.remainingAmount <= 0.00 && "(Fulfilled)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedInvoice && (
            <>
              {selectedInvoice.remainingAmount <= 0 ? (
                <div className="bg-red-50 p-3 rounded-md text-red-600">
                  Cannot create order. This invoice is already fulfilled.
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer Name</Label>
                    <Input
                      id="customer"
                      value={
                        selectedInvoice.customer.companyName ||
                        selectedInvoice.customer.contactPersonName
                      }
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amountOfDelivery">Amount of Delivery *</Label>
                      <Input
                        id="amountOfDelivery"
                        type="number"
                        placeholder="Enter amount"
                        value={formData.amountOfDelivery}
                        onChange={handleAmountChange}
                        onBlur={handleAmountBlur}
                        step="0.01"
                      />
                      {selectedInvoice && (
                        <div className="text-xs text-gray-500">
                          Remaining Amount: {getRemainingAmountInCurrency(formData.currency).toFixed(2)} {formData.currency}
                          {formData.currency !== "HKD" && (
                            <span> ({selectedInvoice.remainingAmount.toFixed(2)} HKD)</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency *</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={handleCurrencyChange}
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
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="partialDelivery"
                        checked={formData.partialDelivery}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({...prev, partialDelivery: !!checked}))
                        }
                      />
                      <Label htmlFor="partialDelivery">Partial Delivery</Label>
                    </div>
                    <div className="text-xs italic text-gray-600 dark:text-gray-400 mb-4 mt-2">
                      Checkmark if partial delivery and add amount.
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !selectedInvoice || selectedInvoice.remainingAmount <= 0}
              className="bg-brand-primary hover:bg-brand-dark text-white"
            >
              {createMutation.isPending ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
