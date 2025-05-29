import axios from "axios"

const API_BASE_URL = "http://8.218.174.70:3000/api/v1"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      console.log("Making login request to:", `${API_BASE_URL}/admin/login`)
      const response = await api.post("/admin/login", credentials)
      console.log("API Response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("Login API Error:", error.response?.data || error.message)
      throw error
    }
  },
  logout: async () => {
    const response = await api.get("/admin/logout")
    return response.data
  },
  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const response = await api.post("/admin/change-password", data)
    return response.data
  },
  forgotPassword: async (email: string) => {
    const response = await api.post("/admin/forgot-password", { email })
    return response.data
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post("/admin/reset-password", { token, password })
    return response.data
  },
}

// Invoice API
export const invoiceApi = {
  getInvoices: async (params: { page: number; limit: number; search?: string }) => {
    const response = await api.get("/invoice/list", { params })
    return response.data
  },
  getInvoice: async (id: string) => {
    const response = await api.get(`/invoice/${id}`)
    return response.data
  },
  createInvoice: async (data: any) => {
    const response = await api.post("/invoice/create", data)
    return response.data
  },
  updateInvoice: async (id: string, data: any) => {
    const response = await api.put(`/invoice/edit/${id}`, data)
    return response.data
  },
  deleteInvoice: async (id: string) => {
    const response = await api.delete(`/invoice/delete/${id}`)
    return response.data
  },
  getPaymentStatus: async (id: string) => {
    const response = await api.get(`/invoice/${id}/payment-status`)
    return response.data
  },
}

// Dashboard API
export const dashboardApi = {
  getFinancialSummary: async () => {
    const response = await api.get("/dashboard")
    return response.data
  },
}

// Customer API
export const customerApi = {
  getCustomers: async (params: { page: number; limit?: number }) => {
    const response = await api.get("/customer/list", { params })
    return response.data
  },
}
