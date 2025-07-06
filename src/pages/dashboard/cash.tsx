"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { useToast } from "../../hooks/use-toast"
import { cashApi } from "../../lib/api"
import { Search, Plus, Edit, Trash2, Package } from "lucide-react"
import { CashModal } from "../../components/cash/cash-modal"
import { DeleteCashDialog } from "../../components/cash/delete-cash-dialog"
import { LoadingSpinner } from "../../components/ui/loading-spinner"

export default function CashPage() {
  const [page, setPage] = useState(0)
  // const [search, setSearch] = useState("")
  const [selectedCash, setSelectedCash] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [cashToDelete, setCashToDelete] = useState<any>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch cash list
  const { data: cashData, isLoading } = useQuery({
    queryKey: ["cash", page],
    queryFn: () => cashApi.getCashList({ page, limit: 10 }),
  })

  const handleEdit = (cash: any) => {
    setSelectedCash(cash)
    setShowModal(true)
  }

  const handleDelete = (cash: any) => {
    setCashToDelete(cash)
    setShowDeleteDialog(true)
  }

  const handleCreate = () => {
    setSelectedCash(null)
    setShowModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB")
  }

  const formatCurrency = (amount: string, currency: string) => {
    return `${Number.parseFloat(amount).toFixed(2)} ${currency}`
  }

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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Cash Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage cash receipts and transactions</p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Cash Receipt
        </Button>
      </div>

      {cashData?.data?.length !== 0 ? <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cash Receipts</CardTitle>
            <div className="flex items-center space-x-2">
            {/* <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search receipts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div> */}
              Total Receipts: &nbsp;<span className="font-semibold">{cashData?.total || 0}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Picked By</TableHead>
                  <TableHead>Pickup Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashData?.data?.map((cash: any) => (
                  <TableRow key={cash.id}>
                    <TableCell className="font-medium">{cash.receiptNumber}</TableCell>
                    <TableCell>{cash.invoiceNumber}</TableCell>
                    <TableCell>{cash.customer?.companyName || "N/A"}</TableCell>
                    <TableCell>{formatCurrency(cash.amount, cash.currency)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cash.currency}</Badge>
                    </TableCell>
                    <TableCell>{cash.pickedBy}</TableCell>
                    <TableCell>{formatDate(cash.cashPickupDate)}</TableCell>
                    <TableCell>
                      <Badge variant={cash.partialDelivery ? "default" : "secondary"}
                       className={cash.partialDelivery ? "bg-brand-secondary text-white" : ""}>
                        {cash.partialDelivery ? "Partial" : "Complete"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(cash)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cash)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {cashData?.total > 10 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {page * 10 + 1} to {Math.min((page + 1) * 10, cashData.total)} of {cashData.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * 10 >= cashData.total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card> :
      <Card className="p-12 text-center">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No cash receipt found</h3>
        <p className="text-gray-600 mb-4">Get started by creating your first cash receipt</p>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Cash Receipt
        </Button>
      </Card>      
      }

      {/* Modals */}
      <CashModal open={showModal} onOpenChange={setShowModal} cash={selectedCash} />

      <DeleteCashDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} cash={cashToDelete} />
    </div>
  )
}
