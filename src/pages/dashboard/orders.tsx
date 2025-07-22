"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi, invoiceApi } from "../../lib/api";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
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
  CoinsIcon,
} from "lucide-react";
import { CreateOrderModal } from "../../components/orders/create-order-modal";
import { EditOrderModal } from "../../components/orders/edit-order-modal";
import { DeleteOrderDialog } from "../../components/orders/delete-order-dialog";
import { useAuth } from "../../hooks/use-auth";
import { formatDate } from "../../lib/utils";
import Tooltip from "@mui/material/Tooltip";

interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  partialDelivery: boolean;
  amountOfDelivery: string;
  currency: string;
  deliveredUnits: number;
  amountInHkd: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    address: string;
    city: string;
    country: string;
    contactPersonName: string;
    companyName: string;
    mobileNumber: string;
    emailId: string;
    businessRegistrationNumber: string;
  };
}

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const limit = 9;
  const isAdmin = user?.role?.toLowerCase() === "admin";

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
  });

  // Fetch invoices for create modal
  const { data: invoicesData } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceApi.getInvoices({ page: 1, limit: 100 }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: orderApi.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: "Order deleted successfully",
        className: "bg-success text-white [&_button]:text-white",
      });
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete order",
        variant: "destructive",
      });
    },
  });

  const orders = ordersData?.orders || [];
  const total = ordersData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDelete = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handlePrint = (order: Order) => {
    const expectedDate = invoicesData?.invoices?.find((value:any) => value.invoiceNumber === order.invoiceNumber).expectedPaymentDate
    const expectedPaymentDate = formatDate(expectedDate)
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Details - ${order.orderNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .company-details { 
              font-size: 14px; 
              line-height: 1.5; 
            }
            .client-section {
              margin: 20px 0;
              display: flex;
              justify-content: space-between;
            }
            .client-info, .note-info {
              width: 48%;
            }
            .section-header {
              font-weight: bold;
              background-color: #f0f0f0;
              padding: 8px;
              border: 1px solid #333;
              text-align: center;
            }
            .section-content {
              padding: 8px;
              border: 1px solid #333;
              border-top: none;
              min-height: 40px;
            }
            .order-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .order-table th, .order-table td { 
              padding: 10px; 
              border: 1px solid #333; 
              text-align: left;
            }
            .order-table th { 
              background-color: #f0f0f0; 
              font-weight: bold; 
            }
            .footer-info {
              margin-top: 30px;
              font-size: 12px;
              line-height: 1.6;
            }
            .totals {
              margin-top: 20px;
              text-align: left;
            }
            .totals div {
              margin: 5px 0;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Korean-fashion International Trading Limited</div>
            <div class="company-details">
              Address: 9970981030.175006112547@gmail.com<br>
              Phone: 9970981031<br>
              Date: ${new Date().toLocaleDateString()}<br>
              Invoice: ${order.invoiceNumber}<br>
              Business Registration#: ${order.customer?.businessRegistrationNumber}<br>
              Order#: ${order.orderNumber}
            </div>
          </div>

          <div class="client-section">
            <div class="client-info">
              <div class="section-header">CLIENT</div>
              <div class="section-content">
                ${
                  order.customer?.companyName ||
                  order.customer?.contactPersonName ||
                  "N/A"
                }
              </div>
            </div>
          </div>

          <table class="order-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>DESCRIPTION</th>
                <th>QTY</th>
                <th>UNIT PRICE</th>
                <th>TOTAL ${order.currency || "HKD"}</th>
                <th>DELIVERY STATUS</th>
                <th>EXPECTED PAYMENT DATE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>Order Processing</td>
                <td>${order.deliveredUnits || 0}</td>
                <td>${Number.parseFloat(order.amountOfDelivery || "0").toFixed(2)} ${order.currency}</td>
                <td>${Number.parseFloat(order.amountInHkd || "0").toFixed(2)}</td>
                <td>${order?.partialDelivery ? "Partial Delivery" : "Full Delivery"}</td>
                <td>${expectedPaymentDate || "--"} </td>
              </tr>
            </tbody>
          </table>

          <div class="footer-info">
            <p>Unless otherwise agreed, all orders are processed within standard delivery timeframes.</p>
            
            <div class="totals">
              <div><strong>SUB TOTAL: ${Number.parseFloat(
                order.amountOfDelivery || "0"
              ).toFixed(2)}</strong></div>
              <div><strong>DISCOUNT: -</strong></div>
              <div><strong>Amount due ${
                order.currency || "HKD"
              }: ${Number.parseFloat(order.amountOfDelivery || "0").toFixed(2)}</strong></div>
            </div>
          </div>

          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
            Generated on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const confirmDelete = () => {
    if (selectedOrder) {
      deleteMutation.mutate(selectedOrder.id);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Error loading orders
          </h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Orders
          </h1>
          <p className="text-gray-600">
            Manage your orders and track deliveries
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg"
        >
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first order
          </p>
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
          {orders.map((order: Order) => {
             const deliveredValue = invoicesData?.invoices?.find((ele:any) => ele.invoiceNumber === order.invoiceNumber).remainingAmount;
             const totalPaidAmount = invoicesData?.invoices?.find((ele:any) => ele.invoiceNumber === order.invoiceNumber).totalPaidAmount;

            return <Card
              key={order.id}
              className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-brand-secondary"
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex justify-between items-start">
                  <div className="w-[62%] pr-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1 break-words">
                      Invoice: {order.invoiceNumber}
                    </p>
                  </div>
                  <div className="w-[40%] text-right">
                    <Tooltip title="Order Delivery status" placement="top">
                      <Badge
                        variant={order.partialDelivery ? "default" : "secondary"}
                        className={
                          order.partialDelivery
                            ? "bg-brand-secondary text-white"
                            : ""
                        }
                      >
                      {order.partialDelivery ? "Partial" : "Full"}
                    </Badge>
                    </Tooltip>
                    <br/>
                    <Tooltip title="Payment Status" placement="bottom">
                      <Badge
                        variant={deliveredValue == 0 ? "secondary" : totalPaidAmount == 0 ? "default" : "outline"}
                        className={
                          `${deliveredValue == 0 ? "bg-green-600 text-white hover:bg-green-500" 
                            : totalPaidAmount == 0 ? "text-white bg-red-500 hover:bg-red-500" 
                            : ""} mt-2`
                        }
                      >
                        {deliveredValue === 0 ? "Complete" : totalPaidAmount == 0 ? "Incomplete" : "Partial"}
                      </Badge>
                    </Tooltip>
                  </div>
                  
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-4 pt-0">
                {/* Customer Info */}
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {order.customer.companyName}
                    </p>
                    <p className="text-xs text-gray-600">
                      Contact Person: {order.customer.contactPersonName}
                    </p>
                  </div>
                </div>

                {/* Amount Info */}
                <div className="flex items-center gap-2">
                  <CoinsIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-600">Amount of delivery: </span>
                    <span className="font-medium text-sm text-gray-900">
                      {Number.parseFloat(order.amountOfDelivery).toFixed(2)} {order.currency}
                    </span>
                    {/* <p className="text-xs text-gray-600">
                      Delivered: {order.deliveredUnits} units
                    </p> */}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Created at: {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Amount in HKD:{Number.parseFloat(order.amountInHkd).toFixed(2)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrint(order)}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    title="Print Order"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(order)}
                        className="h-8 w-8 p-0"
                        title="Edit Order"
                      >
                        <Edit className="h-4 w-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" />
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
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, total)} of {total} orders
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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

      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        order={selectedOrder}
      />

      <DeleteOrderDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        orderNumber={selectedOrder?.orderNumber || ""}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
