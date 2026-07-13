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
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
