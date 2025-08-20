import { ChartOptions } from 'chart.js';

export const farmColors: string[] = ['#16a34a', '#22c55e', '#84cc16', '#65a30d', '#3b82f6', '#06b6d4', '#f59e0b', '#f97316', '#a855f7', '#ef4444'];

export const addAlpha = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`;

export const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(value);

export const buildLineOptions = (title: string): ChartOptions<'line'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        title: { display: true, text: title },
        tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
                label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: (value) => formatCurrency(Number(value)),
            },
        },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
});

export const buildBarOptions = (title: string, stacked = false): ChartOptions<'bar'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        title: { display: true, text: title },
        tooltip: {
            callbacks: {
                label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
            },
        },
    },
    scales: {
        x: { stacked },
        y: {
            stacked,
            beginAtZero: true,
            ticks: {
                callback: (value) => formatCurrency(Number(value)),
            },
        },
    },
});

export const buildDoughnutOptions = (title: string): ChartOptions<'doughnut'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'right' },
        title: { display: true, text: title },
        tooltip: {
            callbacks: {
                label: (context) => `${context.label}: ${formatCurrency(Number(context.parsed))}`,
            },
        },
    },
});
