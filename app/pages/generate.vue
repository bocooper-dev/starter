<!-- pages/generate.vue -->
<template>
  <UContainer class="py-8">
    <UCard class="mb-8">
      <template #header>
        <h1 class="text-2xl font-bold text-(--ui-text-highlighted)">Generate with MPC</h1>
      </template>
      <div class="prose dark:prose-invert max-w-none">
        <p>
          This page allows you to generate Vue.js components using Claude by analyzing the Pagila
          database. Simply provide a description of what you'd like to generate, and Claude will
          create a customized Vue component for you.
        </p>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">Component Generator</h2>
        </template>
        <div class="space-y-4">
          <UFormGroup label="Component Name">
            <UInput
              v-model="componentName"
              placeholder="e.g., FilmAnalyticsDashboard"
            />
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea
              v-model="componentDescription"
              placeholder="Describe what you want the component to do and how it should look"
              rows="5"
            />
          </UFormGroup>

          <UFormGroup label="Data Source">
            <USelect
              v-model="dataType"
              :options="dataTypeOptions"
            />
          </UFormGroup>

          <UButton
            color="primary"
            icon="i-lucide-star"
            :loading="generating"
            @click="generateComponent"
            :disabled="!isFormValid"
          >
            Generate Component
          </UButton>
        </div>
      </UCard>

      <UCard v-if="generatedCode">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold text-(--ui-text-highlighted)">Generated Component</h2>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-lucide-clipboard"
              @click="copyCode"
            >
              Copy
            </UButton>
          </div>
        </template>
        <UCodeBlock
          :code="generatedCode"
          language="vue"
        />
      </UCard>

      <UCard v-else-if="generating" class="flex items-center justify-center py-16">
        <div class="text-center">
          <UIcon name="i-lucide-refresh-cw" class="animate-spin size-12 text-(--ui-primary) mb-4" />
          <p class="text-(--ui-text-muted)">Generating component...</p>
          <p class="text-sm text-(--ui-text-dimmed) mt-2">This may take a few moments</p>
        </div>
      </UCard>

      <UCard v-else class="flex items-center justify-center py-16 bg-(--ui-gray-50) dark:bg-(--ui-gray-900)">
        <div class="text-center text-(--ui-text-muted)">
          <UIcon name="i-lucide-code" class="size-12 mx-auto mb-4 opacity-50" />
          <p>Generated component will appear here</p>
        </div>
      </UCard>
    </div>

    <UModal v-model="showPreview" :ui="{ width: 'max-w-5xl' }">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-(--ui-text-highlighted)">Component Preview</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-lucide-x"
              @click="showPreview = false"
            />
          </div>
        </template>
        <div class="prose dark:prose-invert max-w-none">
          <p>Component preview functionality is not implemented in this demo.</p>
          <p>In a production environment, this would render the generated component to preview it before saving.</p>
        </div>
        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton color="gray" @click="showPreview = false">Close</UButton>
            <UButton color="primary" icon="i-lucide-check-circle">Save Component</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </UContainer>
</template>

<script setup>
import { ref, computed } from 'vue'

const api = useApi()

// State
const componentName = ref('')
const componentDescription = ref('')
const dataType = ref('films')
const generating = ref(false)
const generatedCode = ref('')
const showPreview = ref(false)

// Data Type Options
const dataTypeOptions = [
  { label: 'Films', value: 'films' },
  { label: 'Actors', value: 'actors' },
  { label: 'Rentals', value: 'rentals' },
  { label: 'Revenue', value: 'revenue' }
]

// Computed
const isFormValid = computed(() => {
  return componentName.value && componentDescription.value;
})

// Methods
const generateComponent = async () => {
  if (!isFormValid.value) return

  generating.value = true
  try {
    const response = await api.generatePage(
      componentName.value,
      componentDescription.value,
      dataType.value
    )

    generatedCode.value = response.pageCode
  } catch (error) {
    console.error('Error generating component:', error)
    // Show error toast
    useToast().add({
      title: 'Error',
      description: 'Failed to generate component. Please try again.',
      color: 'red'
    })
  } finally {
    generating.value = false
  }
}

const copyCode = () => {
  if (generatedCode.value) {
    navigator.clipboard.writeText(generatedCode.value)

    // Show success toast
    useToast().add({
      title: 'Copied!',
      description: 'Component code copied to clipboard',
      icon: 'i-lucide-check-circle',
      color: 'green'
    })
  }
}
</script>
