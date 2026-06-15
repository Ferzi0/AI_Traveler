import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { appConfig } from './src/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [appConfig.frontendHost, appConfig.backendHost],
  },
})
