export const useApi = () => {
	const config = useRuntimeConfig()
	const baseUrl = config.public.apiBaseUrl

	const get = async (url: string) => {
		try {
			return await $fetch(`${baseUrl}${url}`, {
				method: 'GET'
			})
		} catch (error) {
			console.error(`API Error (GET ${url}):`, error)
			throw error
		}
	}

	const post = async (url: string, data: any) => {
		try {
			return await $fetch(`${baseUrl}${url}`, {
				method: 'POST',
				body: data
			})
		} catch (error) {
			console.error(`API Error (POST ${url}):`, error)
			throw error
		}
	}

	return {
		// Films
		getFilms: (params = {}) => get('/films' + objectToQueryString(params)),
		getFilm: (id: number) => get(`/films/${id}`),

		// Actors
		getActors: (params = {}) => get('/actors' + objectToQueryString(params)),
		getActor: (id: number) => get(`/actors/${id}`),

		// Customers
		getCustomers: (params = {}) => get('/customers' + objectToQueryString(params)),
		getCustomer: (id: number) => get(`/customers/${id}`),

		// Statistics
		getFilmRentalStats: () => get('/mpc/stats/rentals'),
		getCustomerSpending: () => get('/mpc/stats/customers'),
		getRevenueTrends: () => get('/mpc/stats/revenue'),

		// MPC Functions
		analyzeData: (query: string, dataType: string) => post('/mpc/analyze', { query, dataType }),
		generatePage: (pageName: string, description: string, dataType: string) =>
			post('/mpc/generate-page', { pageName, description, dataType })
	}
}

// Helper function to convert object to query string
function objectToQueryString(obj: Record<string, any>): string {
	if (!obj || Object.keys(obj).length === 0) return ''

	return '?' + Object.entries(obj)
		.filter(([ _, value ]) => value !== undefined && value !== null)
		.map(([ key, value ]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&')
}
