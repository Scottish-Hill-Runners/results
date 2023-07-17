import { vitePreprocess } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess({})],

  kit: {
    paths: {
      base: process.argv.includes("dev") ? "" : process.env.BASE_PATH,
    },
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "index.html",
    }),
  },
};

export default config;
