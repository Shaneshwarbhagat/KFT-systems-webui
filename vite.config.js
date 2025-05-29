import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  // build: {
  //   outDir: "dist",
  //   rollupOptions: {
  //     output: {
  //       manualChunks: {
  //         vendor: ["react", "react-dom"],
  //         router: ["react-router-dom"],
  //         query: ["@tanstack/react-query"],
  //       },
  //     },
  //   },
  // },
})
