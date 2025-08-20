<script setup lang="ts">
import type { Report, ReportColumn } from '@/types';
import { addAlpha, buildLineOptions, farmColors } from '@/utils/graph';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip, type ChartOptions } from 'chart.js';
import { computed } from 'vue';
import { Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
    reportData: Report;
    selectedSection?: string;
    selectedSubsection?: string;
}

const props = withDefaults(defineProps<Props>(), {
    selectedSection: 'income',
    selectedSubsection: 'sheep',
});

const chartData = computed(() => {
    if (!props.reportData) {
        return {
            labels: [],
            datasets: [],
        };
    }

    const labels = props.reportData.columns.map((col: ReportColumn) => col.month);
    const datasets: Array<{
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        tension: number;
    }> = [];

    // Find the selected section and subsection
    const section = props.reportData.sections.find((s) => s.id === props.selectedSection);
    if (!section) return { labels, datasets };

    const subsection = section.subsections.find((sub) => sub.id === props.selectedSubsection);
    if (!subsection) return { labels, datasets };

    // Add line items
    if (subsection.line_items) {
        subsection.line_items.forEach((item, index) => {
            const color = farmColors[index % farmColors.length];
            datasets.push({
                label: item.name,
                data: item.values.slice(0, -1),
                borderColor: color,
                backgroundColor: addAlpha(color, '33'),
                tension: 0.4,
            });
        });
    }

    // Add gross profit if available
    if (subsection.gross_profit) {
        datasets.push({
            label: subsection.gross_profit.name,
            data: subsection.gross_profit.values.slice(0, -1), // Exclude total column
            borderColor: '#059669',
            backgroundColor: '#05966920',
            tension: 0.4,
        });
    }

    return { labels, datasets };
});

const chartOptions: ChartOptions<'line'> = buildLineOptions('Financial Performance Over Time');
</script>

<template>
    <div class="w-full">
        <div class="mb-4">
            <h3 class="mb-2 text-lg font-semibold text-gray-900">Financial Chart</h3>
            <p class="text-sm text-gray-600">Showing data for {{ selectedSection }} - {{ selectedSubsection }}</p>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div class="h-96">
                <Line v-if="chartData.datasets.length > 0" :data="chartData" :options="chartOptions" />
                <div v-else class="flex h-full items-center justify-center text-gray-500">No data available for the selected section</div>
            </div>
        </div>
    </div>
</template>
