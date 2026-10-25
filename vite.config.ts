import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base matches the GitHub Pages project path (ARCHITECTURE 2.9)
export default defineConfig({
  base: '/Math-Game/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
