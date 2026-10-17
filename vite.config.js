import { defineConfig } from 'vite';
import { resolve } from 'path';
export default defineConfig({
  base: './', // rutas relativas: funciona en GitHub Pages (/balza-daniel/) y en la raíz de cualquier hosting
  build: { rollupOptions: { input: { main: resolve(__dirname, 'index.html'), brand: resolve(__dirname, 'brand.html') } } },
});
