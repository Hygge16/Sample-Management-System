import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        const indexPath = resolve(__dirname, 'dist/index.html')
        const notFoundPath = resolve(__dirname, 'dist/404.html')
        if (existsSync(indexPath)) copyFileSync(indexPath, notFoundPath)
      },
    },
  ],
  base: process.env.VITE_BASE_PATH || "./",
  build: {
    // 资源放到根目录，避免 CloudBase 对 assets/ 子路径的 404
    assetsDir: "",
  },
})
