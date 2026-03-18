import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 使用相对路径，避免 CloudBase 等托管平台的绝对路径问题
  base: process.env.VITE_BASE_PATH || "./",
})
