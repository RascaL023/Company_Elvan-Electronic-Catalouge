import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())
    const allowedHosts = env.VITE_ALLOWED_HOSTS
        ? env.VITE_ALLOWED_HOSTS.split(',').map((h: string) => h.trim())
        : []

    return {
        plugins: [react()],
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom', 'react-router-dom'],
                        firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
                    },
                },
            },
        },
        server: {
            host: '0.0.0.0',
            allowedHosts: allowedHosts.length > 0 ? allowedHosts : undefined
        }
    }
})
