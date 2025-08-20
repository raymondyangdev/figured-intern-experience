<script setup lang="ts">
import type { Report } from '@/types';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
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
