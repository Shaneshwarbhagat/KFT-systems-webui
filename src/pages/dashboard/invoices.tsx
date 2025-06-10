"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { useToast } from "../../hooks/use-toast"
import { invoiceApi } from "../../lib/api"
import { Plus, Search, Edit, Trash2, Printer, ArrowUpDown } from "lucide-react"
import { InvoiceModal } from "../../components/invoices/invoice-modal"
import { DeleteInvoiceDialog } from "../../components/invoices/delete-invoice-dialog"
import { LoadingSpinner } from "../../components/ui/loading-spinner"

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<any>(null)
  const [deletingInvoice, setDeletingInvoice] = useState<any>(null)
  const [sortField, setSortField] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch invoices
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ["invoices", currentPage, searchQuery, sortField, sortOrder],
    queryFn: () =>
      invoiceApi.getList({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        sortBy: sortField,
        sortOrder,
      }),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: invoiceApi.delete,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      setDeletingInvoice(null)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete invoice",
        variant: "destructive",
      })
    },
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handlePrint = (invoice: any) => {
    // Implement print functionality
    window.print()
  }

  const invoices = invoicesData?.data || []
  const totalPages = Math.ceil((invoicesData?.total || 0) / 10)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your invoices and track payments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Invoice
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">Invoice List</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                  <TableHead
                    className="text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                    onClick={() => handleSort("invoiceNumber")}
                  >
                    <div className="flex items-center">
                      Invoice Number
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center">
                      Customer
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center">
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Currency</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Units</TableHead>
                  <TableHead
                    className="text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: any) => (
                  <TableRow key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {invoice.customer?.companyName || invoice.customer?.contactPersonName}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-gray-100 font-semibold">
                      {Number.parseFloat(invoice.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      >
                        {invoice.currency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{invoice.totalUnits}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingInvoice(invoice)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrint(invoice)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, invoicesData?.total || 0)} of{" "}
                {invoicesData?.total || 0} results
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <InvoiceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] })
          setShowCreateModal(false)
        }}
      />

      <InvoiceModal
        open={!!editingInvoice}
        onOpenChange={(open) => !open && setEditingInvoice(null)}
        invoice={editingInvoice}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] })
          setEditingInvoice(null)
        }}
      />

      <DeleteInvoiceDialog
        open={!!deletingInvoice}
        onOpenChange={(open) => !open && setDeletingInvoice(null)}
        invoice={deletingInvoice}
        onConfirm={() => deletingInvoice && deleteMutation.mutate(deletingInvoice.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
