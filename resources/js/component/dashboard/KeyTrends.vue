<script setup lang="ts">
import type { Report } from '@/types';
import { addAlpha, farmColors } from '@/utils/graph';
import { buildLineOptions } from '@/utils/graph/options';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip, type ChartOptions } from 'chart.js';
import { computed } from 'vue';
import { Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
    reportData: Report;
}

const props = defineProps<Props>();

const monthsLabels = computed(() => (props.reportData ? props.reportData.columns.map((c) => c.month).slice(0, -1) : []));

const keyTrendsData = computed(() => {
    if (!props.reportData?.summary) return { labels: [], datasets: [] };
    const labels = monthsLabels.value;
    const operatingSurplus = props.reportData.summary.find((s) => s.name.toLowerCase().includes('operating surplus'));
    const netProfit = props.reportData.summary.find((s) => s.name.toLowerCase().includes('net profit'));

    const datasets: Array<{ label: string; data: number[]; borderColor: string; backgroundColor: string; tension: number }> = [];

    if (operatingSurplus) {
        datasets.push({
            label: operatingSurplus.name,
            data: operatingSurplus.values.slice(0, -1),
            borderColor: farmColors[0],
            backgroundColor: addAlpha(farmColors[0], '33'),
            tension: 0.35,
        });
    }
    if (netProfit) {
        datasets.push({
            label: netProfit.name,
            data: netProfit.values.slice(0, -1),
            borderColor: farmColors[3],
            backgroundColor: addAlpha(farmColors[3], '33'),
            tension: 0.35,
        });
    }

    return { labels, datasets };
});

const keyTrendsOptions: ChartOptions<'line'> = buildLineOptions('Key Trends: Operating Surplus & Net Profit');
</script>

<template>
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 class="mb-2 text-lg font-semibold text-gray-900">Key Trends</h3>
        <p class="mb-2 text-sm text-gray-600">Monthly Operating Surplus and Net Profit</p>
        <div class="h-80">
            <Line v-if="keyTrendsData.datasets.length > 0" :data="keyTrendsData" :options="keyTrendsOptions" />
            <div v-else class="flex h-full items-center justify-center text-gray-500">No trends available</div>
        </div>
    </div>
</template>
