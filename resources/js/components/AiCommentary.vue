<template>
    <section class="rounded-lg border border-green-200 bg-green-50 p-6">
        <div class="flex items-center justify-between">
            <h3 class="mb-3 text-lg font-semibold text-green-900">🤖 AI Commentary</h3>
            <span v-if="loading" class="text-xs text-green-700">Generating…</span>
        </div>

        <div class="space-y-4">
            <div>
                <label for="ai-prompt" class="mb-2 block text-sm font-medium text-green-800"> Optional extra question </label>
                <input
                    id="ai-prompt"
                    v-model="prompt"
                    type="text"
                    :placeholder="placeholder"
                    class="w-full rounded-lg border border-green-300 p-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                    :disabled="loading"
                />
                <p class="mt-1 text-xs text-gray-500">Updates here will auto-regenerate (debounced).</p>
            </div>

            <div class="flex items-center gap-3">
                <button
                    @click="generate"
                    :disabled="loading"
                    class="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {{ loading ? 'Generating…' : 'Regenerate now' }}
                </button>
            </div>

            <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4">
                <p class="text-sm text-red-800">{{ error }}</p>
            </div>

            <div v-else-if="points.length" class="rounded-lg border border-green-200 bg-white p-4">
                <h4 class="mb-2 font-medium text-green-800">AI Insights</h4>
                <ul class="space-y-2">
                    <li v-for="(p, i) in points" :key="i" class="flex gap-2">
                        <span class="mt-1 h-2 w-2 flex-none rounded-full bg-green-400"></span>
                        <p class="text-sm text-gray-800">{{ p }}</p>
                    </li>
                </ul>
                <p class="mt-2 text-xs text-gray-500">AI-generated. Verify key figures before deciding.</p>
            </div>

            <div v-else-if="raw" class="rounded-lg border border-green-200 bg-white p-4">
                <h4 class="mb-2 font-medium text-green-800">AI Response</h4>
                <p class="text-sm whitespace-pre-wrap text-gray-700">{{ raw }}</p>
            </div>

            <p v-else class="text-sm text-gray-600">Waiting for data…</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { Report } from '@/types';
import { computed, onMounted, ref, watch } from 'vue';

const props = withDefaults(
    defineProps<{
        report: Report | null;
        endpoint?: string;
        placeholder?: string;
        auto?: boolean; // auto on mount
        autoOnChange?: boolean; // auto when report/prompt changes
        debounceMs?: number;
    }>(),
    {
        endpoint: '/api/generate-commentary',
        placeholder: 'e.g., What are the key trends and risks?',
        auto: true,
        autoOnChange: true,
        debounceMs: 600,
    },
);

const emit = defineEmits<{ (e: 'generated', payload: { points: string[]; raw: string }): void }>();

// state
const prompt = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const points = ref<string[]>([]);
const raw = ref('');

// simple cache to avoid identical calls
const cache = new Map<string, { points: string[]; raw: string }>();

// --- helpers (respect your Report types) ------------------------------------
const monthIndexes = computed(() => {
    if (!props.report) return [];
    const idx: number[] = [];
    props.report.columns.forEach((c, i) => {
        if (c.type !== 'Total') idx.push(i);
    });
    return idx;
});
const months = computed(() => (props.report ? monthIndexes.value.map((i) => props.report!.columns[i].month) : []));

const actualsEndIndex = computed(() => {
    if (!props.report) return -1;
    let lastColIdx = -1;
    props.report.columns.forEach((c, i) => {
        if (c.type === 'Actual' && monthIndexes.value.includes(i)) {
            lastColIdx = monthIndexes.value.indexOf(i);
        }
    });
    return lastColIdx;
});

const mapValues = (values: number[] = []) => monthIndexes.value.map((i) => Number(values[i] ?? 0));
const slimSection = (s: Report['sections'][number]) => ({ name: s.name, monthly: mapValues(s.total?.values) });
const slimSummary = (arr: Report['summary']) => arr.map((s) => ({ name: s.name, monthly: mapValues(s.values) }));

function slimPayload(report: Report) {
    return {
        company: report.company,
        months: months.value,
        actuals_end_index: actualsEndIndex.value,
        sections: report.sections.map(slimSection),
        summary: slimSummary(report.summary),
    };
}

function buildPrompt() {
    const base = [
        'You are an agricultural finance analyst.',
        'Return 3–6 bullets, one per line.',
        'Reference months exactly as provided in `months`.',
        'Call out trends, spikes/dips, seasonality, and risks/opportunities.',
    ];
    if (prompt.value.trim()) base.push(`Question: ${prompt.value.trim()}`);
    if (props.report) base.push(`DATA (JSON): ${JSON.stringify(slimPayload(props.report))}`);
    return base.join('\n');
}

function splitBullets(text: string) {
    return text
        .split(/\r?\n/)
        .map((s) => s.replace(/^\s*[-•*]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 8);
}

function keyForRequest() {
    // cache key based on prompt + slim payload
    const slim = props.report ? slimPayload(props.report) : null;
    return JSON.stringify({ prompt: prompt.value.trim(), slim });
}

// --- actions ----------------------------------------------------------------
async function generate() {
    if (!props.report) return;
    error.value = null;
    const key = keyForRequest();

    if (cache.has(key)) {
        const cached = cache.get(key)!;
        points.value = cached.points;
        raw.value = cached.raw;
        emit('generated', cached);
        return;
    }

    loading.value = true;
    points.value = [];
    raw.value = '';

    try {
        const res = await fetch(props.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ prompt: buildPrompt() }),
        });
        const data = await res.json();
        const parsed = Array.isArray(data.points) ? data.points : splitBullets(String(data.response ?? ''));
        if (parsed.length) {
            points.value = parsed;
            raw.value = '';
        } else {
            raw.value = String(data.response ?? '');
        }
        const payload = { points: points.value, raw: raw.value };
        cache.set(key, payload);
        emit('generated', payload);
    } catch (e: any) {
        error.value = e?.message ?? 'Failed to generate commentary.';
    } finally {
        loading.value = false;
    }
}

// debounce auto-regeneration
let timer: number | undefined;
function scheduleGenerate() {
    if (!props.autoOnChange) return;
    clearTimeout(timer);
    // @ts-ignore
    timer = setTimeout(() => generate(), props.debounceMs) as unknown as number;
}

onMounted(() => {
    if (props.auto && props.report) scheduleGenerate();
});

// re-run when report changes or prompt changes
watch(
    () => props.report,
    () => {
        if (props.report) scheduleGenerate();
    },
    { deep: true },
);
watch(
    () => prompt.value,
    () => scheduleGenerate(),
);
</script>
