/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Archivum Arceus',
        short_name: 'Arceus Dex',
        description: 'PWA mobile-first para consulta, analise e montagem de times Pokemon.',
        theme_color: '#070707',
        background_color: '#070707',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/pokeapi\.co\/api\/v2\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pokeapi-cache',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pokeapi-sprites-cache',
              // <img> responses are opaque (status 0); keep them, but bounded.
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 1500, maxAgeSeconds: 60 * 60 * 24 * 90, purgeOnQuotaError: true },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
