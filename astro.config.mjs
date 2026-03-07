import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
