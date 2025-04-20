import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('прокси-ошибка', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Запрос:', req.method, req.url, '-> Прокси запрос:', proxyReq.method, proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Ответ:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
