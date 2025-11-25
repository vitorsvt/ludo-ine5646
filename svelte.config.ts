import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter(),
        files: {
            appTemplate: 'src/client/app.html',
            routes: 'src/client/routes',
            lib: 'src/client/lib',
            assets: 'src/client/static'
        }
    },
};

export default config;