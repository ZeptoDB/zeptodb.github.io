// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { experimentRedirects } from './src/data/experiment-routes.mjs';

export default defineConfig({
  site: 'https://zeptodb.com',
  redirects: experimentRedirects,
  integrations: [
    sitemap(),
    starlight({
      title: 'ZeptoDB',
      description:
        'ZeptoDB is an Action-Outcome Memory database for Physical AI and robotic agents, connecting robot telemetry, prior actions, outcomes, and replayable evidence.',
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
        PageTitle: './src/components/PageTitle.astro',
      },
      sidebar: [
        // ── Docs & Reference (sidebar) ──
        {
          label: 'Start Here',
          items: [
            { label: 'Docs Home', slug: 'docs' },
            { label: 'Quick Start', slug: 'getting-started/quick_start' },
            { label: 'ROS 2 Setup', slug: 'operations/ros2_setup' },
            { label: 'ROS 2 Edge Deployment', slug: 'operations/ros2_edge_deployment' },
            { label: 'Telegraf Output', slug: 'operations/telegraf_output' },
            { label: 'HTTP API', slug: 'api/http_reference' },
            { label: 'Python API', slug: 'api/python_reference' },
            { label: 'Production Deployment', slug: 'deployment/production_deployment' },
            { label: 'Release Process', slug: 'deployment/release_process' },
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
            { label: 'Product Overview', slug: 'features' },
            { label: 'Action-Outcome Memory', slug: 'use-cases/action-outcome-memory' },
            { label: 'Physical AI & Robotics', slug: 'use-cases/robotics' },
            { label: 'Agent Memory', slug: 'use-cases/agent-memory' },
            { label: 'Python Agent Memory Quickstart', slug: 'use-cases/agent-memory-python-quickstart' },
            { label: 'Logistics & Edge Automation', slug: 'use-cases/logistics' },
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
