import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Proxies API/static paths to the Express backend (see ../centroid-finder/server)
// running on localhost:3000, so the frontend can call relative paths like
// "/api/videos" with no CORS setup needed. Adjust the target if your backend
// runs on a different port.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3000',
      '/thumbnail': 'http://localhost:3000',
      '/process': 'http://localhost:3000',
      '/results': 'http://localhost:3000',
    },
  },
})
