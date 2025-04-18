// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-11-01',
	srcDir: 'app/',
	devtools: { enabled: true },

	modules: [
		'@nuxt/eslint',
		'@nuxt/icon',
		'@nuxt/ui-pro',
		'@vueuse/nuxt'
	],

  css: ['~/assets/css/main.css'],

	eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
        indent: 2
      }
    }
	},
	runtimeConfig: {
		public: {
			apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api'
		}
	},
	app: {
		head: {
			title: 'MPC Dashboard',
			meta: [
				{ name: 'description', content: 'MPC Dashboard for Pagila Database' }
			]
		}
	}
})
