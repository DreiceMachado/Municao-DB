import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig(({ command }) => ({
    plugins: [react()],
    // "./" só no build (Capacitor carrega de file://). No dev use "/" senão o
    // servidor pode servir os módulos errado e dar tela branca (ex.: via ngrok).
    base: command === "build" ? "./" : "/",
    server: {
        host: true,
        allowedHosts: true, // permite abrir via túnel ngrok (https) no celular
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3001',
                changeOrigin: true,
                proxyTimeout: 600000, // 10 min — igual ao backend (api.js), Python pode demorar
                timeout: 600000,
            },
            // Repassa o banco (Supabase/Kong) pelo MESMO endereço do app, em /db.
            // Assim, com VITE_SUPABASE_URL=@origin, tudo sai por um link só (ngrok).
            '/db': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                ws: true,
                rewrite: (p) => p.replace(/^\/db/, ''),
            },
        },
    },
    // "preview" serve o BUNDLE de produção (rápido no celular, ao contrário do dev
    // que serve arquivos soltos). Mesmo host/proxy do dev.
    preview: {
        host: true,
        allowedHosts: true,
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3001',
                changeOrigin: true,
                proxyTimeout: 600000,
                timeout: 600000,
            },
            // Idem ao dev: banco em /db, para o modo "web" (acesso pela internet).
            '/db': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                ws: true,
                rewrite: (p) => p.replace(/^\/db/, ''),
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
