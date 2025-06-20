import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { LoadingSpinner } from "../../components/ui/loading-spinner"
import { ErrorBoundary } from "../../components/error-boundary"
import { dashboardApi } from "../../lib/api"
import { DollarSign, FileText, Package, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"
import { formatCurrency } from "../../lib/utils"

export default function DashboardPage() {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardApi.getFinancialSummary,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    throw error
  }

  const stats = [
    {
      title: "Total Orders",
      value: dashboardData?.totalOrderValue || 0,
      icon: Package,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Delivered Orders",
      value: dashboardData?.totalDeliveredValue || 0,
      icon: FileText,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Non-Delivered Orders",
      value: dashboardData?.nonDeliveredValue || 0,
      icon: Package,
      color: "from-red-500 to-red-600",
    },
    {
      title: "Total Order Value",
      value: formatCurrency(dashboardData?.totalCashPickup || 0),
      icon: DollarSign,
      color: "from-brand-primary to-brand-secondary",
    },
    {
      title: "Cash Picked Up",
      value: formatCurrency(dashboardData?.deliveredCashPickup || 0),
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Cash Not Picked Up",
      value: formatCurrency(dashboardData?.totalNetDue || 0),
      icon: DollarSign,
      color: "from-orange-500 to-orange-600",
    },
  ]

  return (
    <ErrorBoundary>
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-brand-dark">Dashboard</h1>
            <p className="text-brand-dark/70 text-lg mt-2">Welcome ! Here's what's happening with your business.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-brand-dark/80">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-brand-dark">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  )
}
