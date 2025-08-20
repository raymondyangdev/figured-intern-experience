<script setup lang="ts">
import type { Report } from '@/types';
import { addAlpha, farmColors } from '@/utils/graph';
import { buildBarOptions } from '@/utils/graph/options';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Props {
    reportData: Report;
}

const props = defineProps<Props>();

const monthsLabels = computed(() => (props.reportData ? props.reportData.columns.map((c) => c.month).slice(0, -1) : []));

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
            { label: 'Income', data: incomeTotals, backgroundColor: addAlpha(farmColors[2], '66'), borderColor: farmColors[2] },
            { label: 'Operating Expenses', data: expenseTotals, backgroundColor: addAlpha('#ef4444', '66'), borderColor: '#ef4444' },
        ],
    };
});

const incomeExpenseOptions = buildBarOptions('Income vs Operating Expenses');
</script>

<template>
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 class="mb-2 text-lg font-semibold text-gray-900">Income vs Expenses</h3>
        <p class="mb-2 text-sm text-gray-600">Across months</p>
        <div class="h-80">
            <Bar v-if="incomeVsExpensesData.datasets.length > 0" :data="incomeVsExpensesData" :options="incomeExpenseOptions" />
            <div v-else class="flex h-full items-center justify-center text-gray-500">No data available</div>
        </div>
    </div>
</template>
