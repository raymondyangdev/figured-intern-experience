<script setup lang="ts">
import type { Report, ReportSection, ReportSubsection } from '@/types';
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
            datasets.push({ label: top.name, data: totals, backgroundColor: addAlpha(color, '66'), borderColor: color, stack: stackKey });
        });
        return datasets;
    };

    const incomeDatasets = buildDatasetsForSection('income', 'Income', 0);
    const expenseDatasets = buildDatasetsForSection('operating_expenses', 'Operating Expenses', Math.ceil(farmColors.length / 2));

    return { labels, datasets: [...incomeDatasets, ...expenseDatasets] };
});

const breakdownOptions = buildBarOptions('Income & Operating Expenses Breakdown', true);
</script>

<template>
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
        <h3 class="mb-2 text-lg font-semibold text-gray-900">Income & Operating Expenses Breakdown</h3>
        <p class="mb-2 text-sm text-gray-600">Grouped stacks by top-level subsections</p>
        <div class="h-96">
            <Bar v-if="combinedBreakdownData.datasets.length > 0" :data="combinedBreakdownData" :options="breakdownOptions" />
            <div v-else class="flex h-full items-center justify-center text-gray-500">No breakdown available</div>
        </div>
    </div>
</template>
