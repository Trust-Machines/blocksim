import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	base: "/blocksim/",
	plugins: [sveltekit()]
};

export default config;
