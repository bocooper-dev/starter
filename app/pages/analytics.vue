<template>
  <UContainer class="py-8">
    <UCard class="mb-8">
      <template #header>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Analytics Dashboard</h1>
      </template>

      <UTabs :items="tabs" @click="handleTabClick">
        <template #item="{ item }">
          <UIcon :name="item.icon" class="mr-2" />
          {{ item.label }}
        </template>
      </UTabs>
    </UCard>

    <!-- Revenue Analysis -->
    <div v-if="activeTab === 'revenue'">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <UCard>
          <template #header>
            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase mb-1.5">
                Total Revenue
              </p>
              <p class="text-3xl text-(--ui-text-highlighted) font-semibold">
                {{ loading ? '...' : formatNumber(totalRevenue) }}
              </p>
            </div>
          </template>
        </UCard>

        <UCard>
          <template #header>
            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase mb-1.5">
                Average Monthly Revenue
              </p>
              <p class="text-3xl text-(--ui-text-highlighted) font-semibold">
                {{ loading ? '...' : formatNumber(avgMonthlyRevenue) }}
              </p>
            </div>
          </template>
        </UCard>

        <UCard>
          <template #header>
            <div>
              <p class="text-xs text-(--ui-text-muted) uppercase mb-1.5">
                Top Category
              </p>
              <p class="text-3xl text-(--ui-text-highlighted) font-semibold">
                {{ loading ? '...' : topCategory }}
              </p>
            </div>
          </template>
        </UCard>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <LineChart
          v-if="!loading && monthlyRevenueData"
          :data="monthlyRevenueData"
          label-field="month"
          value-field="revenue"
          title="Monthly Revenue Trend"
        />
        <div v-else class="h-80 flex items-center justify-center">
          <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
        </div>

        <BarChart
          v-if="!loading && revenueTrends.categoryRevenue"
          :data="revenueTrends.categoryRevenue.slice(0, 10)"
          label-field="category"
          value-field="revenue"
          title="Revenue by Category"
        />
        <div v-else class="h-80 flex items-center justify-center">
          <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
        </div>
      </div>

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Store Performance</h3>
        </template>
        <UTable
          v-if="!loading && revenueTrends.storeRevenue"
          :columns="storeRevenueColumns"
          :rows="revenueTrends.storeRevenue"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
            td: 'border-b border-(--ui-border)'
          }"
        />
        <div v-else class="flex items-center justify-center h-32">
          <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
        </div>
      </UCard>
    </div>

    <!-- Rental Analysis -->
    <div v-if="activeTab === 'rentals'">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Top Rented Films</h3>
          </template>
          <UTable
            v-if="!loading && rentalStats.rentalStats"
            :columns="topRentedColumns"
            :rows="rentalStats.rentalStats.slice(0, 5)"
            :ui="{
              base: 'table-fixed border-separate border-spacing-0',
              thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
              tbody: '[&>tr]:last:[&>td]:border-b-0',
              th: 'first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
              td: 'border-b border-(--ui-border)'
            }"
          />
          <div v-else class="flex items-center justify-center h-32">
            <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
          </div>
        </UCard>

        <BarChart
          v-if="!loading && rentalStats.rentalDuration"
          :data="rentalStats.rentalDuration"
          label-field="category"
          value-field="avg_rental_days"
          title="Average Rental Duration by Category"
          :horizontal="true"
          colorVar="--ui-info"
        />
        <div v-else class="h-80 flex items-center justify-center">
          <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
        </div>
      </div>

      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Film Performance Analysis</h3>
            <UInput
              v-model="filmSearchQuery"
              placeholder="Search films..."
              icon="i-lucide-search"
              class="w-64"
            />
          </div>
        </template>
        <UTable
          v-if="!loading && rentalStats.rentalStats"
          :columns="filmPerformanceColumns"
          :rows="filteredRentalStats"
          :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
          td: 'border-b border-(--ui-border)'
        }"
        />
        <div v-else class="flex items-center justify-center h-32">
          <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
        </div>
      </UCard>
    </div>

    <!-- Customer Analysis -->
    <div v-if="activeTab === 'customers'">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Top Spending Customers</h3>
          </template>
          <UTable
            v-if="!loading && customerSpending.topCustomers"
            :columns="topCustomersColumns"
            :rows="customerSpending.topCustomers.slice(0, 5)"
            :ui="{
              base: 'table-fixed border-separate border-spacing-0',
              thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
              tbody: '[&>tr]:last:[&>td]:border-b-0',
              th: 'first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
              td: 'border-b border-(--ui-border)'
            }"
          />
          <div v-else class="flex items-center justify-center h-32">
            <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
          </div>
        </UCard>

        <BarChart
          v-if="!loading && customerSpending.spendingByCountry"
          :data="customerSpending.spendingByCountry.slice(0, 10)"
          label-field="country"
          value-field="total_revenue"
          title="Revenue by Country"
          :horizontal="true"
          colorVar="--ui-success"
        />
        <div v-else class="h-80 flex items-center justify-center">
          <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
        </div>
      </div>

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">Customer Value Analysis</h3>
        </template>
        <UTable
          v-if="!loading && customerSpending.topCustomers"
          :columns="customerValueColumns"
          :rows="customerSpending.topCustomers"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
            td: 'border-b border-(--ui-border)'
          }"
        />
        <div v-else class="flex items-center justify-center h-32">
          <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
        </div>
      </UCard>
    </div>

    <!-- AI Analysis -->
    <div v-if="activeTab === 'ai'">
      <UCard class="mb-6">
        <template #header>
          <h3 class="text-lg font-semibold text-(--ui-text-highlighted)">AI-Powered Data Analysis</h3>
        </template>
        <div class="space-y-4">
          <div>
            <UTextarea
              v-model="aiQuery"
              placeholder="Ask a question about the data (e.g., 'What are the most profitable film categories?')"
              class="mb-2"
            />
            <div class="flex items-center space-x-2">
              <USelect
                v-model="aiDataType"
                :options="dataTypeOptions"
                class="w-48"
              />
              <UButton
                color="primary"
                icon="i-lucide-star"
                :loading="aiLoading"
                @click="performAIAnalysis"
              >
                Analyze
              </UButton>
            </div>
          </div>

          <div class="border-b border-(--ui-border)" />

          <div class="text-sm text-(--ui-text-muted)">
            <p>Ask the AI to analyze the data. For example:</p>
            <ul class="list-disc pl-5">
              <li>What are the most profitable film categories?</li>
              <li>Which customers have the highest spending?</li>
              <li>What is the average rental duration by category?</li>
            </ul>
          </div>

          <div v-if="aiLoading" class="flex justify-center py-8">
            <UIcon name="i-lucide-refresh-cw" class="animate-spin size-8 text-(--ui-primary)" />
          </div>

          <div v-else-if="aiResult" class="prose dark:prose-invert max-w-none">
            <h4 class="text-lg font-medium text-(--ui-text-highlighted)">Analysis</h4>
            <div v-html="formattedAIResult"></div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { marked } from 'marked'
import { useDebounceFn } from '@vueuse/core'
import { format, parseISO } from 'date-fns'

const api = useApi()

// Row data interfaces
interface StoreRevenue { store_id: number; city: string; country: string; revenue: string }
interface RentalStat { title: string; category: string; rating: string; rental_count: number }
interface CustomerSpending { first_name: string; last_name: string; email: string; total_spent: string; rental_count: number; avg_per_rental?: string }

// API response shapes
interface RevenueTrendsData {
  monthlyRevenue: Record<string, any>[]
  categoryRevenue: Record<string, any>[]
  storeRevenue: StoreRevenue[]
}
interface RentalStatsData {
  rentalStats: RentalStat[]
  rentalDuration: Record<string, any>[]
}
interface CustomerData {
  topCustomers: CustomerSpending[]
  spendingByCountry: Record<string, any>[]
}

// Table column configs
const storeRevenueColumns: TableColumn<StoreRevenue>[] = [
  { accessorKey: 'store_id', header: 'Store ID' },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'country', header: 'Country' },
  { id: 'revenue', accessorKey: 'revenue', header: 'Revenue', cell: ({ row }) => `$${parseFloat(String(row.getValue('revenue'))).toFixed(2)}` }
]

const topRentedColumns: TableColumn<RentalStat>[] = [
  { accessorKey: 'title', header: 'Film Title' },
  { accessorKey: 'category', header: 'Category' },
  { id: 'rating', accessorKey: 'rating', header: 'Rating', cell: ({ row }) => h('UBadge', {}, { default: () => row.getValue('rating') }) },
  { accessorKey: 'rental_count', header: 'Rental Count' }
]

const filmPerformanceColumns = topRentedColumns // same as top rented stats

const topCustomersColumns: TableColumn<CustomerSpending>[] = [
  { id: 'customer', header: 'Customer', cell: ({ row }) => `${(row.original as CustomerSpending).first_name} ${(row.original as CustomerSpending).last_name}` },
  { accessorKey: 'email', header: 'Email' },
  { id: 'total_spent', accessorKey: 'total_spent', header: 'Total Spent', cell: ({ row }) => `$${parseFloat(String(row.getValue('total_spent'))).toFixed(2)}` },
  { accessorKey: 'rental_count', header: 'Rentals' }
]

const customerValueColumns: TableColumn<CustomerSpending>[] = [
  ...topCustomersColumns,
  { id: 'avg_per_rental', accessorKey: 'avg_per_rental', header: 'Avg. per Rental', cell: ({ row }) => `$${parseFloat(String(row.getValue('avg_per_rental'))).toFixed(2)}` }
]

// Table Data
const monthlyRevenueData = computed(() => {
  return revenueTrends.value.monthlyRevenue?.map((item) => {
    const { month, revenue } = item as { month: string; revenue: string }
    return {
      month: format(parseISO(month), 'MMMM'),
      revenue: parseFloat(revenue).toFixed(2)
    }
  })
})

const categoryRevenueData = computed(() => {
  return revenueTrends.value.categoryRevenue?.map((item) => {
    const { category, revenue } = item as { category: string; revenue: string }
    return {
      ...item,
      category: category,
      revenue: parseFloat(revenue).toFixed(2)
    }
  })
})
const storeRevenueData = computed(() => {
  return revenueTrends.value.storeRevenue?.map((item) => {
    const { store_id, city, country, revenue } = item as StoreRevenue
    return {
      ...item,
      store_id: store_id,
      city: city,
      country: country,
      revenue: parseFloat(revenue).toFixed(2)
    }
  })
})
const rentalDurationData = computed(() => {
  return rentalStats.value.rentalDuration?.map((item) => {
    const { category, avg_rental_days } = item as { category: string; avg_rental_days: string }
    return {
      ...item,
      category: category,
      avg_rental_days: parseFloat(avg_rental_days).toFixed(2)
    }
  })
})
const rentalStatsData = computed(() => {
  return rentalStats.value.rentalStats?.map((item) => {
    const { title, category, rating, rental_count } = item as RentalStat
    return {
      ...item,
      title: title,
      category: category,
      rating: rating,
      rental_count: rental_count
    }
  })
})
const spendingByCountryData = computed(() => {
  return customerSpending.value.spendingByCountry?.map((item) => {
    const { country, total_revenue } = item as { country: string; total_revenue: string }
    return {
      ...item,
      country: country,
      total_revenue: parseFloat(total_revenue).toFixed(2)
    }
  })
})
const topCustomerSpendingData = computed(() => {
  return customerSpending.value.topCustomers?.map((item) => {
    const { first_name, last_name, email, total_spent, rental_count } = item as CustomerSpending
    return {
      ...item,
      first_name: first_name,
      last_name: last_name,
      email: email,
      total_spent: parseFloat(total_spent).toFixed(2),
      rental_count: rental_count
    }
  })
})


// State with typed initial values
const loading = ref(true)
const activeTab = ref('revenue')
const revenueTrends = ref<RevenueTrendsData>({ monthlyRevenue: [], categoryRevenue: [], storeRevenue: [] })
const rentalStats = ref<RentalStatsData>({ rentalStats: [], rentalDuration: [] })
const customerSpending = ref<CustomerData>({ topCustomers: [], spendingByCountry: [] })

// AI Analysis state
const aiQuery = ref('')
const aiDataType = ref('revenue')
const aiLoading = ref(false)
const aiResult = ref('')

// Film search
const filmSearchQuery = ref('')

// Tabs
interface Tab {
  id: string
  label: string
  icon: string
}

const tabs: Tab[] = [
  { id: 'revenue', label: 'Revenue Analysis', icon: 'i-lucide-dollar-sign' },
  { id: 'rentals', label: 'Rental Analysis', icon: 'i-lucide-film' },
  { id: 'customers', label: 'Customer Analysis', icon: 'i-lucide-users' },
  { id: 'ai', label: 'AI Analysis', icon: 'i-lucide-star' }
]

// Data Type Options for AI Analysis
const dataTypeOptions = [
  { label: 'Revenue Data', value: 'revenue' },
  { label: 'Film Data', value: 'films' },
  { label: 'Actor Data', value: 'actors' },
  { label: 'Rental Data', value: 'rentals' },
  { label: 'Customer Data', value: 'customers' },
  { label: 'Category Data', value: 'categories' }
]

// Helper function for formatting numbers
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(value)
}

// Computed values
const totalRevenue = computed(() => {
  if (!revenueTrends.value.categoryRevenue) return 0
  return revenueTrends.value.categoryRevenue.reduce((sum, item) => sum + parseFloat(item.revenue), 0)
})

const avgMonthlyRevenue = computed(() => {
  if (!revenueTrends.value.monthlyRevenue) return 0
  const sum = revenueTrends.value.monthlyRevenue.reduce((sum, item) => sum + parseFloat(item.revenue), 0)
  return sum / revenueTrends.value.monthlyRevenue.length
})

const topCategory = computed(() => {
  if (!revenueTrends.value.categoryRevenue || !revenueTrends.value.categoryRevenue.length) return 'N/A'
  return revenueTrends.value.categoryRevenue[0].category
})

const filteredRentalStats = computed(() => {
  if (!rentalStats.value.rentalStats) return []
  if (!filmSearchQuery.value) return rentalStats.value.rentalStats

  const query = filmSearchQuery.value.toLowerCase()
  return rentalStats.value.rentalStats.filter(film =>
    film.title.toLowerCase().includes(query) ||
    film.category.toLowerCase().includes(query)
  )
})

const formattedAIResult = computed(() => {
  return aiResult.value ? marked(aiResult.value) : ''
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    // Load data for all tabs to avoid loading again when switching tabs
    const [revenueTrendsData, rentalStatsData, customerSpendingData] = await Promise.all([
      api.getRevenueTrends(),
      api.getFilmRentalStats(),
      api.getCustomerSpending()
    ])

    revenueTrends.value = revenueTrendsData as RevenueTrendsData
    rentalStats.value = rentalStatsData as RentalStatsData
    customerSpending.value = customerSpendingData as CustomerData
  } catch (error) {
    console.error('Error loading analytics data:', error)
  } finally {
    loading.value = false
  }
}

const handleTabClick = (tab) => {
  activeTab.value = tab.id
}

const performAIAnalysis = async () => {
  if (!aiQuery.value) return

  aiLoading.value = true
  try {
    const response = await api.analyzeData(aiQuery.value, aiDataType.value)
    aiResult.value = response.analysis
  } catch (error) {
    console.error('Error performing AI analysis:', error)
    aiResult.value = 'An error occurred while analyzing the data. Please try again.'
  } finally {
    aiLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>
