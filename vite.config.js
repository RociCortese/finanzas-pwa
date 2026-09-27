import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// IMPORTANTE: cambiá "base" al nombre de tu repo de GitHub para que
// funcione en GitHub Pages, ej: '/finanzas-pwa/'
// Si vas a usar un dominio propio o Firebase Hosting, dejalo en '/'.
export default defineConfig({
  base: '/finanzas-pwa/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Finanzas',
        short_name: 'Finanzas',
        description: 'Control de ingresos, gastos, cuentas y metas de ahorro',
        theme_color: '#0f1a17',
        background_color: '#0f1a17',
        display: 'standalone',
        start_url: '/finanzas-pwa/',
        scope: '/finanzas-pwa/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
