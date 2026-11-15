import path from 'node:path'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['posts.com'],
  },
  resolve: {
    alias: {
      '~bootstrap': path.resolve(import.meta.dirname, 'node_modules/bootstrap'),
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  preview: {
    host: true,
    allowedHosts: ['posts.com'],
  },
})
