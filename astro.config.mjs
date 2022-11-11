import { defineConfig } from 'astro/config';
import image from "@astrojs/image";
import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
export default defineConfig({
  site: 'https://api.tonysull.co',
  integrations: [image({
    serviceEntryPoint: '@astrojs/image/sharp'
  })],
  output: "server",
  adapter: netlify()
});