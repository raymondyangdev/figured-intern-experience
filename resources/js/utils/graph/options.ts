import { ChartOptions } from 'chart.js';
import { formatCurrency } from './format';

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
