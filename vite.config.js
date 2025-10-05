import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config as ESM. Ensure package.json doesn't force CommonJS.
export default defineConfig({
  plugins: [react()],
  base: '/jwellery', // set to repo name if deploying to GitHub Pages
})
