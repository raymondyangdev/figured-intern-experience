<script setup lang="ts">
import type { Report } from '@/types';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    type ChartOptions,
} from 'chart.js';
import { computed, ref } from 'vue';
import { Bar, Doughnut, Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

interface Props {
    reportData: Report;
}

const props = defineProps<Props>();

const selectedChartType = ref<'line' | 'bar' | 'doughnut'>('line');
const selectedSection = ref('income');
const selectedSubsection = ref('sheep');

const availableSections = computed(() => {
    return (
        props.reportData?.sections.map((section) => ({
            id: section.id,
            name: section.name,
        })) || []
    );
});

const availableSubsections = computed(() => {
    const section = props.reportData?.sections.find((s) => s.id === selectedSection.value);
    return (
        section?.subsections.map((subsection) => ({
            id: subsection.id,
            name: subsection.name,
        })) || []
    );
});

const chartData = computed(() => {
    if (!props.reportData) {
        return {
            labels: [],
            datasets: [],
        };
    }

    const labels = props.reportData.columns.map((col) => col.month);
    const datasets: Array<{
        label: string;
        data: number[];
        borderColor?: string;
        backgroundColor?: string;
        tension?: number;
    }> = [];

    const section = props.reportData.sections.find((s) => s.id === selectedSection.value);
    if (!section) return { labels, datasets };

    const subsection = section.subsections.find((sub) => sub.id === selectedSubsection.value);
    if (!subsection) return { labels, datasets };

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'];

    if (subsection.line_items) {
        subsection.line_items.forEach((item, index) => {
            const color = colors[index % colors.length];
            datasets.push({
                label: item.name,
                data: item.values.slice(0, -1),
                borderColor: color,
                backgroundColor: color + '20',
                tension: 0.4,
            });
        });
    }

    if (subsection.gross_profit) {
        datasets.push({
            label: subsection.gross_profit.name,
            data: subsection.gross_profit.values.slice(0, -1),
            borderColor: '#059669',
            backgroundColor: '#05966920',
            tension: 0.4,
        });
    }

    return { labels, datasets };
});

const summaryData = computed(() => {
    if (!props.reportData?.summary) return { labels: [], datasets: [] };

    const labels = props.reportData.summary.map((item) => item.name);
    const data = props.reportData.summary.map((item) => item.values[item.values.length - 1]); // Total values

    return {
        labels,
        datasets: [
            {
                data,
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'],
            },
        ],
    };
});

const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' as const },
        title: {
            display: true,
            text: 'Financial Performance Over Time',
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
            callbacks: {
                label: (context) => `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: (value) => `$${Number(value).toLocaleString()}`,
            },
        },
    },
    interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false,
    },
};

const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' as const },
        title: {
            display: true,
            text: 'Monthly Financial Data',
        },
        tooltip: {
            callbacks: {
                label: (context) => `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: (value) => `$${Number(value).toLocaleString()}`,
            },
        },
    },
};

const doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'right' as const },
        title: {
            display: true,
            text: 'Financial Summary',
        },
        tooltip: {
            callbacks: {
                label: (context) => `${context.label}: $${context.parsed.toLocaleString()}`,
            },
        },
    },
};

const totalRevenue = computed(() => {
    if (!props.reportData?.summary) return 0;
    const revenueItem = props.reportData.summary.find(
        (item) =>
            item.name.toLowerCase().includes('revenue') || item.name.toLowerCase().includes('income') || item.name.toLowerCase().includes('surplus'),
    );
    return revenueItem ? revenueItem.values[revenueItem.values.length - 1] : 0;
});

const totalExpenses = computed(() => {
    if (!props.reportData?.sections) return 0;
    const expensesSection = props.reportData.sections.find((s) => s.id === 'operating_expenses');
    return expensesSection ? expensesSection.total.values[expensesSection.total.values.length - 1] : 0;
});
</script>

<template>
    <div class="space-y-6">
        <!-- Controls -->
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">Chart Type</label>
                    <select
                        v-model="selectedChartType"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="line">Line Chart</option>
                        <option value="bar">Bar Chart</option>
                        <option value="doughnut">Doughnut Chart</option>
                    </select>
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">Section</label>
                    <select
                        v-model="selectedSection"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                        <option v-for="section in availableSections" :key="section.id" :value="section.id">
                            {{ section.name }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="mb-2 block text-sm font-medium text-gray-700">Subsection</label>
                    <select
                        v-model="selectedSubsection"
                        class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                        <option v-for="subsection in availableSubsections" :key="subsection.id" :value="subsection.id">
                            {{ subsection.name }}
                        </option>
                    </select>
                </div>

                <div class="flex items-end">
                    <button
                        @click="selectedChartType = selectedChartType === 'line' ? 'bar' : 'line'"
                        class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                        Toggle Chart
                    </button>
                </div>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 class="mb-2 text-lg font-semibold text-gray-900">Total Revenue</h3>
                <p class="text-3xl font-bold text-green-600">${{ totalRevenue.toLocaleString() }}</p>
            </div>

            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 class="mb-2 text-lg font-semibold text-gray-900">Total Expenses</h3>
                <p class="text-3xl font-bold text-red-600">${{ totalExpenses.toLocaleString() }}</p>
            </div>

            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 class="mb-2 text-lg font-semibold text-gray-900">Net Profit</h3>
                <p class="text-3xl font-bold" :class="totalRevenue - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'">
                    ${{ (totalRevenue - totalExpenses).toLocaleString() }}
                </p>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Main Chart -->
            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 class="mb-4 text-lg font-semibold text-gray-900">{{ selectedSection }} - {{ selectedSubsection }}</h3>
                <div class="h-80">
                    <Line v-if="selectedChartType === 'line' && chartData.datasets.length > 0" :data="chartData" :options="lineChartOptions" />
                    <Bar v-else-if="selectedChartType === 'bar' && chartData.datasets.length > 0" :data="chartData" :options="barChartOptions" />
                    <div v-else class="flex h-full items-center justify-center text-gray-500">No data available for the selected section</div>
                </div>
            </div>

            <!-- Summary Chart -->
            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 class="mb-4 text-lg font-semibold text-gray-900">Financial Summary</h3>
                <div class="h-80">
                    <Doughnut v-if="summaryData.datasets[0]?.data?.length > 0" :data="summaryData" :options="doughnutChartOptions" />
                    <div v-else class="flex h-full items-center justify-center text-gray-500">No summary data available</div>
                </div>
            </div>
        </div>
    </div>
</template>
