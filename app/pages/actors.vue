<template>
	<UContainer class="py-8">
		<UCard>
			<template #header>
				<div class="flex justify-between items-center">
					<h1 class="text-2xl font-bold">Actors</h1>
					<UInput
						v-model="searchQuery"
						placeholder="Search actors..."
						icon="i-lucide-search"
						@update:model-value="debounceSearch"
						class="w-64"
					/>
				</div>
			</template>

			<UTable
				ref="table"
				v-model:pagination="pagination"
				:data="actors"
				:columns="actorTableConfig.columns"
				:pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
				class="mt-4"
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
						<p class="text-sm text-gray-500">No actors found</p>
					</div>
				</template>
			</UTable>

			<template #footer>
				<div class="flex justify-center border-t border-(--ui-border) pt-4">
					<UPagination
						:default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
						:items-per-page="table?.tableApi?.getState().pagination.pageSize"
						:total="table?.tableApi?.getFilteredRowModel().rows.length"
						@update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
					/>
				</div>
			</template>
		</UCard>

		<!-- Actor Details Modal -->
		<UModal v-model="showActorDetails" :ui="{ width: 'max-w-3xl' }">
			<UCard v-if="selectedActor">
				<template #header>
					<h3 class="text-xl font-bold">{{ selectedActor.first_name }} {{ selectedActor.last_name }}</h3>
				</template>

				<div>
					<h4 class="font-medium mb-2">Filmography</h4>
					<div v-if="selectedActor.films && selectedActor.films.length" class="space-y-2">
						<UTable
							:columns="filmographyTableConfig.columns"
							:rows="selectedActor.films"
							:ui="{
								base: 'table-fixed border-separate border-spacing-0',
								thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
								tbody: '[&>tr]:last:[&>td]:border-b-0',
								th: 'first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
								td: 'border-b border-(--ui-border)'
							}"
						/>
					</div>
					<p v-else class="text-sm text-gray-500">No filmography available</p>
				</div>

				<template #footer>
					<div class="flex justify-end">
						<UButton color="gray" @click="showActorDetails = false">Close</UButton>
					</div>
				</template>
			</UCard>
		</UModal>
	</UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from 'vue'
import type { TableColumn } from '@/types/table'
import { getPaginationRowModel } from '@tanstack/vue-table'

// Define Actor row type (matching API shape)
interface Actor {
  first_name: string
  last_name: string
  last_update: string
  actor_id: number
}

const api = useApi()

// State
const actors = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showActorDetails = ref(false)
const selectedActor = ref(null)

// Table ref and pagination state
const table = useTemplateRef('table')
const pagination = ref({ pageIndex: 0, pageSize: 10 })

// Computed
const pageCount = computed(() => Math.ceil(totalItems.value / pagination.value.pageSize))

// Table columns config
const actorTableConfig = {
  columns: [
    { accessorKey: 'first_name', header: 'First Name' },
    { accessorKey: 'last_name', header: 'Last Name' },
    {
      accessorKey: 'last_update',
      header: 'Last Updated',
      cell: ({ row }) => new Date(row.getValue('last_update')).toLocaleDateString()
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => h(
        'UButton',
        { color: 'primary', variant: 'ghost', icon: 'i-lucide-eye', onClick: () => viewActorDetails(row.original) }
      )
    }
  ] as TableColumn<Actor>[]
}

const filmographyTableConfig = {
  columns: [
    { accessorKey: 'title', header: 'Film Title' },
    { accessorKey: 'release_year', header: 'Year' },
    { accessorKey: 'rating', header: 'Rating' }
  ]
}

// Methods
const loadActors = async () => {
	loading.value = true
	try {
		const params = {
			page: pagination.value.pageIndex + 1,
			size: pagination.value.pageSize,
			name: searchQuery.value || undefined
		}

		const response = await api.getActors(params)
		actors.value = response.actors || []
		totalItems.value = response.totalItems || 0
	} catch (error) {
		console.error('Error loading actors:', error)
	} finally {
		loading.value = false
	}
}

const viewActorDetails = async (actor) => {
	try {
		// Get detailed actor information
		const actorDetails = await api.getActor(actor.actor_id)
		selectedActor.value = actorDetails
		showActorDetails.value = true
	} catch (error) {
		console.error('Error fetching actor details:', error)
	}
}

const debounceSearch = useDebounceFn(() => {
	pagination.value.pageIndex = 0
	loadActors()
}, 300)

// Lifecycle
onMounted(() => {
	loadActors()
})
</script>
