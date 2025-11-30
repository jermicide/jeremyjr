import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://jeremyjr.lakey.net',
  integrations: [tailwind()],
  output: 'static',
});