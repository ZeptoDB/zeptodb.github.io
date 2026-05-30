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
      description:
        'ZeptoDB turns live time-series data into agent memory with microsecond evidence recall, context retrieval, prompt cache, and zero-copy Python.',
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
          label: 'Start Here',
          items: [
            { label: 'Docs Home', slug: 'docs' },
            { label: 'Quick Start', slug: 'getting-started/quick_start' },
            { label: 'Agent Memory', slug: 'use-cases/agent-memory' },
            { label: 'Python Agent Memory Quickstart', slug: 'use-cases/agent-memory-python-quickstart' },
            { label: 'HTTP API', slug: 'api/http_reference' },
            { label: 'Python API', slug: 'api/python_reference' },
            { label: 'Production Deployment', slug: 'deployment/production_deployment' },
          ],
        },
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
          label: 'Ingestion & Feeds',
          autogenerate: { directory: 'feeds' },
        },
        // ── Product pages in sidebar ──
        {
          label: 'Product',
          items: [
            { label: 'Agent Memory', slug: 'use-cases/agent-memory' },
            { label: 'Python Agent Memory Quickstart', slug: 'use-cases/agent-memory-python-quickstart' },
            { label: 'Features', slug: 'features' },
            { label: 'Benchmarks', slug: 'benchmarks' },
            { label: 'Security', slug: 'security' },
            { label: 'Integrations', slug: 'integrations' },
            { label: 'Community', slug: 'community' },
          ],
        },
        {
          label: 'Compare',
          items: [
            { label: 'Agent Memory vs Vector DBs', slug: 'compare/agent-memory-vs-vector-databases' },
            { label: 'vs kdb+', slug: 'compare/vs-kdb' },
            { label: 'vs ClickHouse', slug: 'compare/vs-clickhouse' },
            { label: 'vs InfluxDB', slug: 'compare/vs-influxdb' },
            { label: 'vs TimescaleDB', slug: 'compare/vs-timescaledb' },
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
