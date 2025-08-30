import type { ViteDevServer } from 'vite'
import type { Plugin } from 'vite'
import { createProxyMiddleware } from 'http-proxy-middleware'

// This Vite plugin proxies /api/download-mis-report?url=... to the HTTP backend
export default function misReportProxyPlugin(): Plugin {
  return {
    name: 'mis-report-proxy',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        '/api/download-mis-report',
        createProxyMiddleware({
          target: 'http://YOUR_BACKEND_DOMAIN', // <-- CHANGE THIS
          changeOrigin: true,
          pathRewrite: (path, req) => {
            // Extract the ?url=... param and proxy to that
            const url = new URL(req.url!, 'http://localhost')
            const fileUrl = url.searchParams.get('url')
            if (!fileUrl) return path
            // Remove /api/download-mis-report?url= and use the fileUrl
            return fileUrl.replace(/^https?:\/\//, '/')
          },
          secure: false,
        })
      )
    },
  }
}
