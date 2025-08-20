<script setup lang="ts">
import type { Report } from '@/types';
import { addAlpha, farmColors } from '@/utils/graph';
import { buildDoughnutOptions } from '@/utils/graph/options';
import { ArcElement, CategoryScale, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(CategoryScale, ArcElement, Title, Tooltip, Legend);

interface Props {
    reportData: Report;
}

const props = defineProps<Props>();

const summaryData = computed(() => {
    if (!props.reportData?.summary) return { labels: [], datasets: [] };
    const labels = props.reportData.summary.map((item) => item.name);
    const data = props.reportData.summary.map((item) => item.values[item.values.length - 1]);
    return { labels, datasets: [{ data, backgroundColor: farmColors.map((c) => addAlpha(c, '99')) }] };
});

const doughnutChartOptions = buildDoughnutOptions('Financial Summary');
</script>

<template>
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
        <h3 class="mb-2 text-lg font-semibold text-gray-900">Financial Summary</h3>
        <div class="h-80">
            <Doughnut v-if="summaryData.datasets[0]?.data?.length > 0" :data="summaryData" :options="doughnutChartOptions" />
            <div v-else class="flex h-full items-center justify-center text-gray-500">No summary data available</div>
        </div>
    </div>
</template>
