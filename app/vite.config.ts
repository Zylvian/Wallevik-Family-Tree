import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Wallevik-Family-Tree/',
  build: {
    outDir: '../',
    emptyOutDir: false,
  },
})
