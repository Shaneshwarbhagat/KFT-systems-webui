"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";
import { invoiceApi } from "../../lib/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Printer,
  ArrowUpDown,
  Package,
} from "lucide-react";
import { InvoiceModal } from "../../components/invoices/invoice-modal";
import { DeleteInvoiceDialog } from "../../components/invoices/delete-invoice-dialog";
import { LoadingSpinner } from "../../components/ui/loading-spinner";

export default function InvoicesPage() {
  // const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<any>(null);
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is admin
    const isAdmin = user?.role?.toLowerCase() === "admin"

  // Fetch invoices
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ["invoices", currentPage],
    queryFn: () =>
      invoiceApi.getInvoices({
        page: currentPage,
        limit: 10,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: invoiceApi.deleteInvoice,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
        className: "bg-success text-white",
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setDeletingInvoice(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handlePrint = (invoice: any) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber}</title>
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
            .invoice-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .invoice-table th, .invoice-table td { 
              padding: 10px; 
              border: 1px solid #333; 
              text-align: left;
            }
            .invoice-table th { 
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
              Business Registration#: ${invoice.customer.businessRegistrationNumber || "--"}<br>
              Invoice#: ${invoice.invoiceNumber}
            </div>
          </div>

          <div class="client-section">
            <div class="client-info">
              <div class="section-header">CLIENT</div>
              <div class="section-content">
                ${invoice.customer?.companyName || invoice.customer?.contactPersonName || "N/A"}
              </div>
            </div>
            <div class="note-info">
              <div class="section-header">NOTE</div>
              <div class="section-content">
                ${invoice.notes || ""}
              </div>
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>DESCRIPTION</th>
                <th>QTY</th>
                <th>UNIT PRICE</th>
                <th>TOTAL ${invoice.currency || "HKD"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td>${invoice.description || "Service Charge"}</td>
                <td>${invoice.units || 1}</td>
                <td>${Number.parseFloat(invoice.amount || 0).toFixed(2)}</td>
                <td>${Number.parseFloat(invoice.amount || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer-info">
            <p>Unless otherwise agreed, all invoices are payable within 10 days by wire transfer to our bank account</p>
            
            <div class="totals">
              <div><strong>SUB TOTAL: ${Number.parseFloat(invoice.amount || 0).toFixed(2)}</strong></div>
              <div><strong>DISCOUNT: -</strong></div>
              <div><strong>Amount due ${invoice.currency || "HKD"}: ${Number.parseFloat(invoice.amount || 0).toFixed(2)}</strong></div>
            </div>
          </div>

          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
            Generated on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
    }
  };

  const invoices = invoicesData?.invoices || [];
  const totalPages = Math.ceil((invoicesData?.total || 0) / 10);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your invoices and track payments
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Invoice
        </Button>
      </div>

      {invoices?.length !== 0 ? (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">
                Invoice List
              </CardTitle>
              <div className="flex items-center space-x-2">
                {/* <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div> */}
                Total Invoices: &nbsp;
                <span className="font-semibold text-gray-900 dark:text-white">
                  {" "}
                  {invoicesData?.total || 0}
                </span>
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
                        Customer Email ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={() => handleSort("customer")}
                    >
                      <div className="flex items-center">
                        Customer Mobile No.
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
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Currency
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Units
                    </TableHead>  
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Total Amt in HKD
                    </TableHead>                   
                    <TableHead
                      className="text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={() => handleSort("expectedAt")}
                    >
                      <div className="flex items-center">
                        Expected Payment Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices && invoices.length ? (
                    invoices.map((invoice: any) => (
                      <TableRow
                        key={invoice.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {invoice.customer?.emailId}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {invoice.customer?.mobileNumber}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {invoice.customer?.companyName ||
                            invoice.customer?.contactPersonName}
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
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {invoice.totalUnits}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {Number.parseFloat(invoice.amountInHkd).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {invoice.expectedPaymentDate ? new Date(invoice.expectedPaymentDate).toLocaleDateString(
                            "en-GB"
                          ) : "--"}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {new Date(invoice.createdAt).toLocaleDateString(
                            "en-GB"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {isAdmin && (
                              <>
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
                              </>
                            )}
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
                    ))
                  ) : (
                    <div className="p-5">No invoices found.</div>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {(currentPage - 1) * 10 + 1} to{" "}
                  {Math.min(currentPage * 10, invoicesData?.total || 0)} of{" "}
                  {invoicesData?.total || 0} results
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
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
      ) : (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No invoice found
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first invoice
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
          </Button>
        </Card>
      )}

      {/* Modals */}
      <InvoiceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
          setShowCreateModal(false);
        }}
      />

      <InvoiceModal
        open={!!editingInvoice}
        onOpenChange={(open) => !open && setEditingInvoice(null)}
        invoice={editingInvoice}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
          setEditingInvoice(null);
        }}
      />

      <DeleteInvoiceDialog
        open={!!deletingInvoice}
        onOpenChange={(open) => !open && setDeletingInvoice(null)}
        invoice={deletingInvoice}
        onConfirm={() =>
          deletingInvoice && deleteMutation.mutate(deletingInvoice.id)
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
