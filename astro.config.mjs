// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zeptodb.com',
  integrations: [
    sitemap(),
    starlight({
      title: 'ZeptoDB',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/zeptodb/zeptodb' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/PAtzvCa7' },
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
      },
      customCss: ['./src/styles/brand.css'],
      components: {
        Header: './src/components/Header.astro',
        Head: './src/components/Head.astro',
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
        // ── Product pages in sidebar ──
        {
          label: 'Product',
          items: [
            { label: 'Security', slug: 'security' },
            { label: 'Integrations', slug: 'integrations' },
            { label: 'Community', slug: 'community' },
          ],
        },
        {
          label: 'Blog',
          autogenerate: { directory: 'blog' },
        },
      ],
    }),
  ],
});
