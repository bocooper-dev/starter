<template>
	<UContainer class="py-8">
		<UCard class="mb-8">
			<template #header>
				<div class="flex justify-between items-center">
					<h1 class="text-2xl font-bold">Welcome to MPC Dashboard</h1>
				</div>
			</template>
			<div class="prose max-w-none dark:prose-invert">
				<p>
					This dashboard provides insights into the Pagila DVD rental database.
					It demonstrates the integration of a PostgreSQL database with a Nuxt frontend
					using Claude for automated analytics and page generation.
				</p>
				<p>
					Use the navigation bar to explore different sections of the dashboard:
				</p>
				<ul>
					<li><strong>Films</strong> - Browse and analyze film data</li>
					<li><strong>Actors</strong> - Explore actor information and performance</li>
					<li><strong>Analytics</strong> - Deep dive into rental statistics and revenue analysis</li>
					<li><strong>Generate</strong> - Create custom analytics and pages using Claude</li>
				</ul>
			</div>
		</UCard>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
			<UCard>
				<template #header>
					<h2 class="text-xl font-semibold">Quick Stats</h2>
				</template>
				<div class="space-y-4" v-if="!loading">
					<div class="flex justify-between items-center">
						<span>Total Films:</span>
						<UBadge size="lg" color="primary">{{ stats.filmCount || 'N/A' }}</UBadge>
					</div>
					<div class="flex justify-between items-center">
						<span>Total Actors:</span>
						<UBadge size="lg" color="info">{{ stats.actorCount || 'N/A' }}</UBadge>
					</div>
					<div class="flex justify-between items-center">
						<span>Total Customers:</span>
						<UBadge size="lg" color="success">{{ stats.customerCount || 'N/A' }}</UBadge>
					</div>
					<div class="flex justify-between items-center">
						<span>Total Revenue:</span>
						<UBadge size="lg" color="warning">${{ stats.totalRevenue?.toFixed(2) || 'N/A' }}</UBadge>
					</div>
				</div>
				<div v-else class="py-4 flex justify-center">
					<UIcon name="i-lucide-refresh-cw" class="animate-spin h-8 w-8 text-primary" />
				</div>
			</UCard>

			<UCard>
				<template #header>
					<h2 class="text-xl font-semibold">Recent Activity</h2>
				</template>
				<UTable
					ref="table"
					v-model:pagination="pagination"
					:data="recentRentals"
					:columns="recentRentalsColumns"
					:pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
					class="flex-1"
					:ui="{
						base: 'table-fixed border-separate border-spacing-0',
						thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
						tbody: '[&>tr]:last:[&>td]:border-b-0',
						th: 'first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
						td: 'border-b border-(--ui-border)'
					}"
				>
					<template #loading-state>
						<div class="flex items-center justify-center p-6">
							<UIcon name="i-lucide-refresh-cw" class="animate-spin h-8 w-8 text-primary" />
						</div>
					</template>
					<template #empty-state>
						<div class="flex flex-col items-center justify-center py-6 px-4">
							<UIcon name="i-lucide-users" class="text-gray-400 h-10 w-10 mb-2" />
							<p class="text-sm text-gray-500">No recent activity to display</p>
						</div>
					</template>
				</UTable>
				<div class="flex justify-center border-t border-(--ui-border) pt-4">
					<UPagination
						:default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
						:items-per-page="table?.tableApi?.getState().pagination.pageSize"
						:total="table?.tableApi?.getFilteredRowModel().rows.length"
						@update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
					/>
				</div>
			</UCard>
		</div>

		<div v-if="!loading && revenueData.length > 0">
			<UCard>
				<template #header>
					<h2 class="text-xl font-semibold">Revenue by Category</h2>
				</template>
				<div class="h-80">
					<BarChart :data="chartData" />
				</div>
			</UCard>
		</div>
	</UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'
const api = useApi()

// Define Rental row type and column config
interface Rental { rentalDate: string; customerName: string; amount: string }
const recentRentalsColumns: TableColumn<Rental>[] = [
	{ accessorKey: 'rentalDate', header: 'Date' },
	{ accessorKey: 'customerName', header: 'Customer' },
	{ accessorKey: 'amount', header: 'Amount' }
]

// Table ref and pagination state
const table = useTemplateRef('table')
const pagination = ref({ pageIndex: 0, pageSize: 5 })

const loading = ref(true)
const stats = ref({})
const recentRentals = ref<Rental[]>([])
const revenueData = ref([])

// Provide raw data array to BarChart component
const chartData = computed(() => revenueData.value)

async function fetchDashboardData() {
	loading.value = true
	try {
		// Get quick stats
		const films = await api.getFilms({ page: 1, size: 1 })
		const actors = await api.getActors({ page: 1, size: 1 })
		const customers = await api.getCustomers({ page: 1, size: 1 })
		const revenueTrends = await api.getRevenueTrends()

		stats.value = {
			filmCount: films.totalItems || 0,
			actorCount: actors.totalItems || 0,
			customerCount: customers.totalItems || 0,
			totalRevenue: revenueTrends.categoryRevenue.reduce((sum, item) => sum + parseFloat(item.revenue), 0)
		}

		// Get revenue by category data for chart
		revenueData.value = revenueTrends.categoryRevenue.slice(0, 10)

		// Format recent rentals
		// This is mocked as we don't have a direct endpoint for this
		recentRentals.value = [
			{ rentalDate: '2025-04-15', customerName: 'John Smith', amount: '$5.99' },
			{ rentalDate: '2025-04-14', customerName: 'Mary Johnson', amount: '$4.99' },
			{ rentalDate: '2025-04-14', customerName: 'Robert Brown', amount: '$2.99' },
			{ rentalDate: '2025-04-13', customerName: 'Susan Davis', amount: '$3.99' }
		]
	} catch (error) {
		console.error('Error fetching dashboard data:', error)
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchDashboardData()
})
</script>
