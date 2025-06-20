"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orderApi, invoiceApi } from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { useToast } from "../../hooks/use-toast"
import {
  Plus,
  Edit,
  Trash2,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
  Calendar,
  Building,
} from "lucide-react"
import { CreateOrderModal } from "../../components/orders/create-order-modal"
import { EditOrderModal } from "../../components/orders/edit-order-modal"
import { DeleteOrderDialog } from "../../components/orders/delete-order-dialog"

interface Order {
  id: string
  orderNumber: string
  invoiceNumber: string
  partialDelivery: boolean
  amountOfDelivery: string
  currency: string
  deliveredUnits: number
  amountInHkd: string
  customerId: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    address: string
    city: string
    country: string
    contactPersonName: string
    companyName: string
    mobileNumber: string
    emailId: string
    businessRegistrationNumber: string
  }
}

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const limit = 10

  // Fetch orders
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", currentPage, searchTerm],
    queryFn: () =>
      orderApi.getOrders({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
      }),
  })

  // Fetch invoices for create modal
  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceApi.getInvoices({ page: 1, limit: 100 }),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: orderApi.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast({
        title: "Success",
        description: "Order deleted successfully",
        className: "bg-success text-white",
      })
      setIsDeleteDialogOpen(false)
      setSelectedOrder(null)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete order",
        variant: "destructive",
      })
    },
  })

  const orders = ordersData?.orders || []
  const total = ordersData?.total || 0
  const totalPages = Math.ceil(total / limit)

  const handleEdit = (order: Order) => {
    setSelectedOrder(order)
    setIsEditModalOpen(true)
  }

  const handleDelete = (order: Order) => {
    setSelectedOrder(order)
    setIsDeleteDialogOpen(true)
  }

  const handlePrint = (order: Order) => {
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #243636; border-bottom: 2px solid #7c9982; padding-bottom: 10px;">Order Details</h1>
        <div style="margin: 20px 0;">
          <h2>Order Information</h2>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Invoice Number:</strong> ${order.invoiceNumber}</p>
          <p><strong>Amount:</strong> ${order.amountOfDelivery} ${order.currency}</p>
          <p><strong>Delivered Units:</strong> ${order.deliveredUnits}</p>
          <p><strong>Partial Delivery:</strong> ${order.partialDelivery ? "Yes" : "No"}</p>
          <p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div style="margin: 20px 0;">
          <h2>Customer Information</h2>
          <p><strong>Company:</strong> ${order.customer.companyName}</p>
          <p><strong>Contact Person:</strong> ${order.customer.contactPersonName}</p>
          <p><strong>Email:</strong> ${order.customer.emailId}</p>
          <p><strong>Address:</strong> ${order.customer.address}</p>
          <p><strong>City:</strong> ${order.customer.city}, ${order.customer.country}</p>
          <p><strong>Business Registration:</strong> ${order.customer.businessRegistrationNumber}</p>
        </div>
      </div>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const confirmDelete = () => {
    if (selectedOrder) {
      deleteMutation.mutate(selectedOrder.id)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Error loading orders</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage your orders and track deliveries</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          /> */}
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="text-sm">
            Total: {total} orders
          </Badge>
          <Badge variant="outline" className="text-sm">
            Page: {currentPage} of {totalPages}
          </Badge>
        </div>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first order</p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order: Order) => (
            <Card
              key={order.id}
              className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-brand-secondary"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{order.orderNumber}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Invoice: {order.invoiceNumber}</p>
                  </div>
                  <Badge
                    variant={order.partialDelivery ? "default" : "secondary"}
                    className={order.partialDelivery ? "bg-brand-secondary text-white" : ""}
                  >
                    {order.partialDelivery ? "Partial" : "Full"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{order.customer.companyName}</p>
                    <p className="text-xs text-gray-600">{order.customer.contactPersonName}</p>
                  </div>
                </div>

                {/* Amount Info */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {order.amountOfDelivery} {order.currency}
                    </p>
                    <p className="text-xs text-gray-600">Delivered: {order.deliveredUnits} units</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrint(order)}
                    className="h-8 w-8 p-0"
                    title="Print Order"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(order)}
                    className="h-8 w-8 p-0"
                    title="Edit Order"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(order)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete Order"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        invoices={invoicesData?.invoices || []}
      />

      <EditOrderModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} order={selectedOrder} />

      <DeleteOrderDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        orderNumber={selectedOrder?.orderNumber || ""}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
