<script setup lang="ts">
import type { Report } from '@/types';
import { computed } from 'vue';

interface Props {
    reportData: Report;
}

const props = defineProps<Props>();

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
</template>
