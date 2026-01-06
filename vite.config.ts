import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
// @ts-ignore
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        AutoImport({
            resolvers: [VantResolver()],
        }),
        Components({
            resolvers: [VantResolver()],
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        host: '127.0.0.1',
        allowedHosts: ['localhost', '127.0.0.1'],
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    // Force dependency optimization for qrcode
    optimizeDeps: {
        include: ['qrcode']
    }
})
