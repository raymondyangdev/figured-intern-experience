<script setup lang="ts">
import type { Report, ReportColumn } from '@/types';
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
        const colors = [
            '#3B82F6', // blue
            '#10B981', // green
            '#F59E0B', // yellow
            '#EF4444', // red
            '#8B5CF6', // purple
            '#06B6D4', // cyan
            '#F97316', // orange
            '#84CC16', // lime
        ];

        subsection.line_items.forEach((item, index) => {
            datasets.push({
                label: item.name,
                data: item.values.slice(0, -1), // Exclude total column
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
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

const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Financial Performance Over Time',
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
            callbacks: {
                label: (context) => {
                    return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                },
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: (value) => {
                    return `$${Number(value).toLocaleString()}`;
                },
            },
        },
    },
    interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false,
    },
};
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
