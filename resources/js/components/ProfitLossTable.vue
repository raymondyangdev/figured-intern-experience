<template>
    <div class="overflow-x-auto">
        <table class="min-w-full border border-gray-300">
            <thead>
                <tr class="bg-gray-100">
                    <th v-for="(header, index) in props.reportData.columns" :key="index" class="border px-4 py-2 text-left">
                        {{ header }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in props.reportData.sections" :key="rowIndex">
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="border px-4 py-2 text-right">
                        {{ cell }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import type { Report } from '@/types';

interface Props {
    reportData: Report;
}

const props = defineProps<Props>();
</script>
