<script setup lang="ts">
import { VisXYContainer, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'
import type { PropType } from 'vue'
import { computed, useTemplateRef } from 'vue'
import { useElementSize } from '@vueuse/core'

interface ChartSourceItem { [key: string]: any }
interface ChartDataItem { label: string; value: number }

const props = defineProps({
  data: { type: Array as PropType<ChartSourceItem[]>, required: true },
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

const chartRef = useTemplateRef<HTMLElement | null>('chartRef')
const { width } = useElementSize(chartRef)

// Process data for the chart
const chartData = computed<ChartDataItem[]>(() =>
  props.data
    .map((item: ChartSourceItem) => ({
      label: String(item[props.labelField]),
      value: parseFloat(String(item[props.valueField]))
    }))
    .sort((a, b) => b.value - a.value)
)

const total = computed(() => chartData.value.reduce((acc, item) => acc + item.value, 0))

const formatNumber = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format

// Dynamic x and y functions based on orientation
const x = props.horizontal
  ? ((d: ChartDataItem): number => d.value)
  : ((_: unknown, i: number): number => i)

const y = props.horizontal
  ? ((_: unknown, i: number): number => i)
  : ((d: ChartDataItem): number => d.value)

const template = (d: ChartDataItem): string => `${d.label}: ${formatNumber(d.value)}`
</script>

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
      <VisLine
        :x="x"
        :y="y"
        :color="`var(${colorVar})`"
      />
      <VisArea
        :x="x"
        :y="y"
        :color="`var(${colorVar})`"
        :opacity="0.1"
      />
      <VisAxis
        type="x"
        :tick-format="(i: number) => chartData[i]?.label || ''"
      />
      <VisAxis
        type="y"
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
