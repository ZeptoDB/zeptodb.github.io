// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://zeptodb.github.io',
  integrations: [
    starlight({
      title: 'ZeptoDB',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/zeptodb/zeptodb' },
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
      },
      customCss: ['./src/styles/brand.css'],
      components: {
        Header: './src/components/Header.astro',
      },
      sidebar: [
        // ── Docs & Reference (sidebar) ──
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'API Reference',
          autogenerate: { directory: 'api' },
        },
        {
          label: 'Deployment',
          autogenerate: { directory: 'deployment' },
        },
        {
          label: 'Operations',
          autogenerate: { directory: 'operations' },
        },
        {
          label: 'Feed Handlers',
          autogenerate: { directory: 'feeds' },
        },
      ],
    }),
  ],
});
