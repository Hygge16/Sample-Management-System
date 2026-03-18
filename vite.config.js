import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Webify 部署在 /Sample-Management-System/ 子路径，需匹配
  base: process.env.VITE_BASE_PATH || "/Sample-Management-System/",
})
