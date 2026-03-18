import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "./",
  build: {
    // 资源放到根目录，避免 CloudBase 对 assets/ 子路径的 404
    assetsDir: "",
  },
})
