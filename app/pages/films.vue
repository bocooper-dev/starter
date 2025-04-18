<!-- pages/films.vue -->
<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Films</h1>
          <div class="flex items-center space-x-2">
            <UInput
              v-model="searchQuery"
              placeholder="Search films..."
              icon="i-lucide-search"
              @update:model-value="debounceSearch"
              class="w-64"
            />
            <USelect
              v-model="selectedCategory"
              :options="categoryOptions"
              placeholder="All Categories"
              @update:model-value="loadFilms"
              class="w-48"
            />
          </div>
        </div>
      </template>

      <UTable
        :columns="columns"
        :rows="films"
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
            <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
          </div>
        </template>
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 px-4">
            <UIcon name="i-lucide-film" class="text-(--ui-text-dimmed) size-10 mb-2" />
            <p class="text-sm text-(--ui-text-muted)">No films found</p>
          </div>
        </template>
      </UTable>

      <template #footer>
        <div class="flex justify-between items-center">
          <p class="text-sm text-(--ui-text-muted)">
            Showing {{ films.length }} of {{ totalItems }} films
          </p>
          <UPagination
            v-model="page"
            :page-count="pageCount"
            :total="totalItems"
            :ui="{ wrapper: 'flex gap-1' }"
            @update:model-value="loadFilms"
          />
        </div>
      </template>
    </UCard>

    <!-- Film Details Modal -->
    <UModal v-model="showFilmDetails" :ui="{ width: 'max-w-3xl' }">
      <UCard v-if="selectedFilm">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-bold text-(--ui-text-highlighted)">{{ selectedFilm.title }}</h3>
            <UBadge>{{ selectedFilm.rating }}</UBadge>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium mb-2 text-(--ui-text-highlighted)">Details</h4>
            <div class="space-y-2">
              <p><span class="font-medium">Release Year:</span> {{ selectedFilm.release_year }}</p>
              <p><span class="font-medium">Rental Rate:</span> ${{ selectedFilm.rental_rate }}</p>
              <p><span class="font-medium">Length:</span> {{ selectedFilm.length }} min</p>
              <p><span class="font-medium">Replacement Cost:</span> ${{ selectedFilm.replacement_cost }}</p>
              <p><span class="font-medium">Categories:</span>
                <UBadge v-for="category in selectedFilm.categories" :key="category.category_id" class="mr-1">
                  {{ category.name }}
                </UBadge>
              </p>
            </div>
          </div>

          <div>
            <h4 class="font-medium mb-2 text-(--ui-text-highlighted)">Description</h4>
            <p class="text-sm text-(--ui-text-muted)">{{ selectedFilm.description }}</p>

            <h4 class="font-medium mt-4 mb-2 text-(--ui-text-highlighted)">Cast</h4>
            <div v-if="selectedFilm.actors && selectedFilm.actors.length">
              <div v-for="actor in selectedFilm.actors" :key="actor.actor_id" class="mb-1">
                {{ actor.first_name }} {{ actor.last_name }}
              </div>
            </div>
            <p v-else class="text-sm text-(--ui-text-muted)">No cast information available</p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton color="gray" @click="showFilmDetails = false">Close</UButton>
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
const films = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const searchQuery = ref('')
const selectedCategory = ref('')
const showFilmDetails = ref(false)
const selectedFilm = ref(null)
const categories = ref([])

// Computed
const pageCount = computed(() => Math.ceil(totalItems.value / pageSize.value))
const categoryOptions = computed(() => {
  return [
    { label: 'All Categories', value: '' },
    ...categories.value.map(category => ({
      label: category.name,
      value: category.name
    }))
  ]
})

// Table columns
const columns = [
  {
    key: 'title',
    label: 'Title'
  },
  {
    key: 'release_year',
    label: 'Year'
  },
  {
    key: 'rating',
    label: 'Rating',
    render: (row) => h('UBadge', {}, { default: () => row.rating })
  },
  {
    key: 'length',
    label: 'Length (min)'
  },
  {
    key: 'rental_rate',
    label: 'Rental Rate',
    render: (row) => `$${row.rental_rate}`
  },
  {
    key: 'actions',
    label: '',
    render: (row) => h('UButton', {
      color: 'primary',
      variant: 'ghost',
      icon: 'i-lucide-eye',
      onClick: () => viewFilmDetails(row)
    })
  }
]

// Methods
const loadFilms = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      size: pageSize.value,
      title: searchQuery.value || undefined,
      category: selectedCategory.value || undefined
    }

    const response = await api.getFilms(params)
    films.value = response.films || []
    totalItems.value = response.totalItems || 0
  } catch (error) {
    console.error('Error loading films:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    // Assuming your API has an endpoint to get categories
    // If not, we can extract them from film results
    const response = await api.getFilms({ size: 100 })
    const categorySet = new Set()

    response.films.forEach(film => {
      if (film.categories) {
        film.categories.forEach(category => {
          categorySet.add(JSON.stringify(category))
        })
      }
    })

    categories.value = Array.from(categorySet).map(c => JSON.parse(c))
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const viewFilmDetails = async (film) => {
  try {
    // Get detailed film information
    const filmDetails = await api.getFilm(film.film_id)
    selectedFilm.value = filmDetails
    showFilmDetails.value = true
  } catch (error) {
    console.error('Error fetching film details:', error)
  }
}

const debounceSearch = useDebounceFn(() => {
  page.value = 1
  loadFilms()
}, 300)

// Lifecycle
onMounted(() => {
  loadFilms()
  loadCategories()
})
</script>
