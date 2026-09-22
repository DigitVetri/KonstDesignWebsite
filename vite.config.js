import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true, port: Number(process.env.PORT) || 5173 },
  // One screen, one scene — three.js is the bundle and code-splitting it would
  // only delay the thing the loading screen is already waiting for.
  build: { chunkSizeWarningLimit: 1600 },
})
