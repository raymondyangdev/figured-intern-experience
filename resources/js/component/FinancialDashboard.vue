<script setup lang="ts">
import type { Report, ReportSection, ReportSubsection } from '@/types';
import { addAlpha, buildBarOptions, buildDoughnutOptions, buildLineOptions, farmColors } from '@/utils/graph';
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
import { computed } from 'vue';
import { Bar, Doughnut, Line } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

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

const aggregateSectionLineItems = (sectionId: string): number[] => {
    const section = props.reportData?.sections.find((s) => s.id === sectionId);
    if (!section) return [];

    const months = props.reportData!.columns.length - 1;
    const totals = Array.from({ length: months }, () => 0);

    section.subsections.forEach((sub) => {
        if (sub.line_items) {
            sub.line_items.forEach((item) => {
                item.values.slice(0, months).forEach((v, i) => (totals[i] += v));
            });
        }
        if (sub.subsections) {
            sub.subsections.forEach((nested) => {
                if (nested.line_items) {
                    nested.line_items.forEach((item) => {
                        item.values.slice(0, months).forEach((v, i) => (totals[i] += v));
                    });
                }
            });
        }
    });

    return totals;
};

const incomeVsExpensesData = computed(() => {
    if (!props.reportData) return { labels: [], datasets: [] };

    const labels = monthsLabels.value;
    const incomeTotals = aggregateSectionLineItems('income');
    const expenseTotals = aggregateSectionLineItems('operating_expenses');

    return {
        labels,
        datasets: [
            {
                label: 'Income',
                data: incomeTotals,
                backgroundColor: addAlpha(farmColors[2], '66'),
                borderColor: farmColors[2],
            },
            {
                label: 'Operating Expenses',
                data: expenseTotals,
                backgroundColor: addAlpha('#ef4444', '66'),
                borderColor: '#ef4444',
            },
        ],
    };
});

const combinedBreakdownData = computed(() => {
    if (!props.reportData) return { labels: [], datasets: [] };
    const labels = monthsLabels.value;

    const months = props.reportData.columns.length - 1;

    const sumSubsection = (node: ReportSubsection, acc: number[]) => {
        if (node.line_items) {
            node.line_items.forEach((item) => {
                item.values.slice(0, months).forEach((v, i) => {
                    acc[i] += v;
                });
            });
        }
        if (node.subsections) {
            node.subsections.forEach((child) => sumSubsection(child, acc));
        }
    };

    const buildDatasetsForSection = (sectionId: string, stackKey: string, colorOffset: number) => {
        const section: ReportSection | undefined = props.reportData!.sections.find((s) => s.id === sectionId);
        if (!section) return [] as Array<{ label: string; data: number[]; backgroundColor: string; borderColor: string; stack: string }>;

        const datasets: Array<{ label: string; data: number[]; backgroundColor: string; borderColor: string; stack: string }> = [];
        section.subsections.forEach((top, index) => {
            const totals = Array.from({ length: months }, () => 0);
            sumSubsection(top, totals);
            const color = farmColors[(colorOffset + index) % farmColors.length];
            datasets.push({
                label: top.name,
                data: totals,
                backgroundColor: addAlpha(color, '66'),
                borderColor: color,
                stack: stackKey,
            });
        });
        return datasets;
    };

    const incomeDatasets = buildDatasetsForSection('income', 'Income', 0);
    const expenseDatasets = buildDatasetsForSection('operating_expenses', 'Operating Expenses', Math.ceil(farmColors.length / 2));

    return { labels, datasets: [...incomeDatasets, ...expenseDatasets] };
});

const summaryData = computed(() => {
    if (!props.reportData?.summary) return { labels: [], datasets: [] };
    const labels = props.reportData.summary.map((item) => item.name);
    const data = props.reportData.summary.map((item) => item.values[item.values.length - 1]);
    return {
        labels,
        datasets: [
            {
                data,
                backgroundColor: farmColors.map((c) => addAlpha(c, '99')),
            },
        ],
    };
});

const keyTrendsOptions: ChartOptions<'line'> = buildLineOptions('Key Trends: Operating Surplus & Net Profit');
const incomeExpenseOptions: ChartOptions<'bar'> = buildBarOptions('Income vs Operating Expenses');
const breakdownOptions: ChartOptions<'bar'> = buildBarOptions('Income & Operating Expenses Breakdown', true);
const doughnutChartOptions: ChartOptions<'doughnut'> = buildDoughnutOptions('Financial Summary');

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

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 class="mb-2 text-lg font-semibold text-gray-900">Key Trends</h3>
                <p class="mb-2 text-sm text-gray-600">Monthly Operating Surplus and Net Profit</p>
                <div class="h-80">
                    <Line v-if="keyTrendsData.datasets.length > 0" :data="keyTrendsData" :options="keyTrendsOptions" />
                    <div v-else class="flex h-full items-center justify-center text-gray-500">No trends available</div>
                </div>
            </div>

            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 class="mb-2 text-lg font-semibold text-gray-900">Income vs Expenses</h3>
                <p class="mb-2 text-sm text-gray-600">Across months</p>
                <div class="h-80">
                    <Bar v-if="incomeVsExpensesData.datasets.length > 0" :data="incomeVsExpensesData" :options="incomeExpenseOptions" />
                    <div v-else class="flex h-full items-center justify-center text-gray-500">No data available</div>
                </div>
            </div>

            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
                <h3 class="mb-2 text-lg font-semibold text-gray-900">Income & Operating Expenses Breakdown</h3>
                <p class="mb-2 text-sm text-gray-600">Grouped stacks by top-level subsections</p>
                <div class="h-96">
                    <Bar v-if="combinedBreakdownData.datasets.length > 0" :data="combinedBreakdownData" :options="breakdownOptions" />
                    <div v-else class="flex h-full items-center justify-center text-gray-500">No breakdown available</div>
                </div>
            </div>

            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
                <h3 class="mb-2 text-lg font-semibold text-gray-900">Financial Summary</h3>
                <div class="h-80">
                    <Doughnut v-if="summaryData.datasets[0]?.data?.length > 0" :data="summaryData" :options="doughnutChartOptions" />
                    <div v-else class="flex h-full items-center justify-center text-gray-500">No summary data available</div>
                </div>
            </div>
        </div>
    </div>
</template>
