import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://agentauth.dev',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  redirects: {
    '/overview': '/docs/introduction',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
