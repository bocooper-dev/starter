<template>
  <UCard ref="chartRef" :ui="{ body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div>
        <p class="text-xs text-(--ui-text-muted) uppercase mb-1.5">
          {{ title }}
        </p>
        <p class="text-3xl text-(--ui-text-highlighted) font-semibold">
          {{ formatNumber(total) }}
        </p>
      </div>
    </template>
    <VisXYContainer
      :data="chartData"
      :padding="{ top: 40 }"
      :class="height"
      :width="width"
    >
      <VisGroupedBar
        :x="x"
        :y="y"
        :color="`var(${colorVar})`"
        :direction="horizontal ? 'horizontal' : 'vertical'"
      />
      <VisAxis
        :type="horizontal ? 'y' : 'x'"
        :tick-format="(i: number) => horizontal ? chartData[i]?.label : chartData[i]?.label || ''"
      />
      <VisAxis
        :type="horizontal ? 'x' : 'y'"
        :tick-format="(value: number) => formatNumber(value)"
      />
      <VisCrosshair
        :color="`var(${colorVar})`"
        :template="template"
      />
      <VisTooltip />
    </VisXYContainer>
  </UCard>
</template>

<script setup lang="ts">
import { VisXYContainer, VisGroupedBar, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import type { PropType } from 'vue'
import { useTemplateRef, computed } from 'vue'
import { useElementSize } from '@vueuse/core'

// Define source and processed data types
interface ChartSourceItem { [key: string]: any }
interface ChartDataItem { label: string; value: number }

// Props definition
const props = defineProps({
  data: {
    type: Array as PropType<ChartSourceItem[]>,
    required: true
  },
  labelField: {
    type: String,
    default: 'category'
  },
  valueField: {
    type: String,
    default: 'revenue'
  },
  title: {
    type: String,
    default: 'Data Distribution'
  },
  height: {
    type: String,
    default: 'h-80'
  },
  horizontal: {
    type: Boolean,
    default: false
  },
  colorVar: {
    type: String,
    default: '--ui-primary'
  }
})

// Chart container ref and dimensions
const chartRef = useTemplateRef<HTMLElement | null>('chartRef')
const { width } = useElementSize(chartRef)

// Process data for the chart with guard
const chartData = computed<ChartDataItem[]>(() =>
  Array.isArray(props.data)
    ? props.data
        .map((item: ChartSourceItem) => ({
          label: String(item[props.labelField]),
          value: parseFloat(String(item[props.valueField]))
        }))
        .sort((a, b) => b.value - a.value)
    : []
)

// Sum of all values
const total = computed(() => chartData.value.reduce((acc, item) => acc + item.value, 0))

// Formatter
const formatNumber = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format

// Dynamic x and y functions
const x = props.horizontal
  ? ((d: ChartDataItem) => d.value)
  : ((_: unknown, i: number) => i)
const y = props.horizontal
  ? ((_: unknown, i: number) => i)
  : ((d: ChartDataItem) => d.value)
// Tooltip template
const template = (d: ChartDataItem) => `${d.label}: ${formatNumber(d.value)}`
</script>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(v-bind(colorVar));
  --vis-crosshair-circle-stroke-color: var(--ui-bg);
  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);
  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
