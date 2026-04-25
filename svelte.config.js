import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		csp: {
			directives: {
				'script-src': ['self'],
				'worker-src': ['self', 'blob:'],
				'frame-ancestors': ['self']
			}
		},
		experimental: {
			remoteFunctions: true
		},
		adapter: adapter()
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
