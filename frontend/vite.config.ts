import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['localhost', 'ai-traveler-1.onrender.com', 'ai-traveler-0jhd.onrender.com'],
  },
})
