import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ 
  plugins: [react()], 
  server: { 
    port: 5175,
    strictPort: false,
    // Allow nginx reverse proxy with a public Host (e.g. finopsdemo.com)
    allowedHosts: true,
  },
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  }
})

