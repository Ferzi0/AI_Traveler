import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['localhost', 'ai-traveler-1.onrender.com', 'ai-traveler-0jhd.onrender.com'],
  },
})
