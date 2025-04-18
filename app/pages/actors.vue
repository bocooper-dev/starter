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
				:columns="actorTableConfig.columns"
				:rows="actors"
				:loading="loading"
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
				<div class="flex justify-between items-center">
					<p class="text-sm text-gray-500">
						Showing {{ actors.length }} of {{ totalItems }} actors
					</p>
					<UPagination
						v-model="page"
						:page-count="pageCount"
						:total="totalItems"
						:ui="{ wrapper: 'flex gap-1' }"
						@update:model-value="loadActors"
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const api = useApi()

// State
const actors = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const searchQuery = ref('')
const showActorDetails = ref(false)
const selectedActor = ref(null)

// Computed
const pageCount = computed(() => Math.ceil(totalItems.value / pageSize.value))

// Table columns
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
  ]
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
			page: page.value,
			size: pageSize.value,
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
	page.value = 1
	loadActors()
}, 300)

// Lifecycle
onMounted(() => {
	loadActors()
})
</script>
