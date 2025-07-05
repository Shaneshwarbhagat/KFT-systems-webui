"use client"

import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface DeleteCustomerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  customerName: string
  isLoading: boolean
}

export function DeleteCustomerDialog({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  isLoading,
}: DeleteCustomerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">Delete Customer</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete customer <span className="font-semibold text-gray-900">{customerName}</span>
            ? This will permanently remove the customer from your system.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
