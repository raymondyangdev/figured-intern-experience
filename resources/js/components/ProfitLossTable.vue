<script setup lang="ts">
import type { Report } from '@/types';

interface Props {
  report: Report;
}

const props = defineProps<Props>();

// Function to format numbers as currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

html, body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<template>
  <div class="p-4 sm:p-8 bg-gray-100 min-h-screen font-sans antialiased text-gray-800">
    <div class="max-w-7xl mx-auto rounded-lg shadow-2xl overflow-hidden">
      <!-- Report Header -->
      <div class="bg-blue-600 text-white p-6 sm:p-8">
        <h1 class="text-xl sm:text-3xl font-bold tracking-tight">{{ props.report.company.name }}</h1>
        <p class="text-sm sm:text-base opacity-90 mt-1">
          {{ props.report.company.report_type }} - {{ props.report.company.basis }}
        </p>
        <p class="text-xs sm:text-sm opacity-70 mt-0.5">
          For the period {{ props.report.company.period }}
        </p>
      </div>

      <!-- Report Table -->
      <div class="overflow-x-auto bg-white">
        <table class="min-w-full">
          <!-- Table Headers -->
          <thead>
            <tr class="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
              <th class="px-6 py-3 text-left">
                Name
              </th>
              <th v-for="(col, index) in props.report.columns"
                  :key="index"
                  class="px-6 py-3 text-right">
                <span class="font-bold">{{ col.month }}</span>
                <br />
                <span class="font-normal">{{ col.type }}</span>
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="text-sm">
            <!-- Sections -->
            <template v-for="section in props.report.sections" :key="section.id">
              <!-- Section Row -->
              <tr class="bg-gray-100 font-bold border-t border-b border-gray-300">
                <td class="px-6 py-3" :colspan="props.report.columns.length + 1">
                  {{ section.name }}
                </td>
              </tr>

              <!-- Subsections & Line Items -->
              <template v-for="sub in section.subsections" :key="sub.id">
                <!-- Subsection Row -->
                <tr class="bg-gray-50">
                  <td class="px-6 py-2 font-semibold text-gray-700 pl-8">
                    {{ sub.name }}
                  </td>
                  <td v-for="(value, i) in sub.line_items?.[0]?.values || []"
                      :key="i"
                      class="px-6 py-2 text-right"
                      :class="{ 'text-red-600': value < 0, 'text-green-600': value > 0 }">
                    {{ formatCurrency(value) }}
                  </td>
                </tr>
                
                <!-- Line Items -->
                <tr v-for="item in sub.line_items || []"
                    :key="item.account_id"
                    class="even:bg-white odd:bg-gray-50 hover:bg-gray-100 transition-colors">
                  <td class="px-6 py-2 pl-12">
                    {{ item.name }}
                  </td>
                  <td v-for="(value, i) in item.values"
                      :key="i"
                      class="px-6 py-2 text-right"
                      :class="{ 'text-red-600': value < 0, 'text-green-600': value > 0 }">
                    {{ formatCurrency(value) }}
                  </td>
                </tr>

                <!-- Subsection Gross Profit (if it exists) -->
                <tr v-if="sub.gross_profit">
                  <td class="px-6 py-2 font-semibold text-gray-700 pl-12 border-t border-gray-200">
                    {{ sub.gross_profit.name }}
                  </td>
                  <td v-for="(value, i) in sub.gross_profit.values"
                      :key="i"
                      class="px-6 py-2 text-right font-semibold border-t border-gray-200"
                      :class="{ 'text-red-600': value < 0, 'text-green-600': value > 0 }">
                    {{ formatCurrency(value) }}
                  </td>
                </tr>
              </template>

              <!-- Section Total -->
              <tr class="font-bold bg-gray-100 border-t-2 border-gray-300">
                <td class="px-6 py-3">
                  {{ section.total.name }}
                </td>
                <td v-for="(value, i) in section.total.values"
                    :key="i"
                    class="px-6 py-3 text-right"
                    :class="{ 'text-red-600': value < 0, 'text-green-600': value > 0 }">
                  {{ formatCurrency(value) }}
                </td>
              </tr>
            </template>

            <!-- Summary -->
            <tr v-for="sum in props.report.summary"
                :key="sum.name"
                class="font-extrabold bg-blue-50 text-blue-800 border-t-2 border-blue-200">
              <td class="px-6 py-3">
                {{ sum.name }}
              </td>
              <td v-for="(value, i) in sum.values"
                  :key="i"
                  class="px-6 py-3 text-right"
                  :class="{ 'text-red-600': value < 0, 'text-green-600': value > 0 }">
                {{ formatCurrency(value) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

