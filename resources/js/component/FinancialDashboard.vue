<script setup lang="ts">
import type { Report } from '@/types';
import { buildBarOptions, buildDoughnutOptions, buildLineOptions } from '@/utils/graph/options';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip, type ChartOptions } from 'chart.js';
import { computed } from 'vue';
import CombinedBreakdown from './dashboard/CombinedBreakdown.vue';
import FinancialSummaryDoughnut from './dashboard/FinancialSummaryDoughnut.vue';
import IncomeVsExpenses from './dashboard/IncomeVsExpenses.vue';
import KeyTrends from './dashboard/KeyTrends.vue';
import SummaryCards from './dashboard/SummaryCards.vue';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
    reportData: Report;
}

const props = defineProps<Props>();

const monthsLabels = computed(() => (props.reportData ? props.reportData.columns.map((c) => c.month).slice(0, -1) : []));
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
        <SummaryCards :report-data="props.reportData" />

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <KeyTrends :report-data="props.reportData" />

            <IncomeVsExpenses :report-data="props.reportData" />

            <CombinedBreakdown :report-data="props.reportData" />

            <FinancialSummaryDoughnut :report-data="props.reportData" />
        </div>
    </div>
</template>
