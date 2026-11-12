<script setup lang="ts">
  import { BRASIL_TRANSFORM, BRASIL_UFS, BRASIL_VIEWBOX } from '~/data/brasil'

  const text = {
    period: 'Período',
    total: 'Coroas recomendadas',
    located: 'Com local da sondagem',
    states: 'Estados',
    cities: 'Cidades',
    byState: 'Por estado',
    topCities: 'Cidades com mais coroas',
    rocks: 'Rochas mais comuns',
    pick: 'Toque num estado do mapa para ver as rochas mais comuns.',
    empty: 'Nenhuma coroa com local da sondagem neste período.',
    noLocal: 'recomendações sem local (feitas antes da pergunta da cidade) não entram no mapa.',
    crowns: 'coroas',
  }

  const periods = [
    { label: '30 dias', value: '30' },
    { label: '90 dias', value: '90' },
    { label: '12 meses', value: '365' },
    { label: 'Tudo', value: 'tudo' },
  ]
  const periodLabel = ref('Tudo')
  const periodo = computed(
    () => periods.find((item) => item.label === periodLabel.value)?.value ?? 'tudo',
  )
  const selected = ref<string | null>(null)

  const { data } = useFetch<MapaResumo>('/api/mapa', {
    query: { periodo },
    lazy: true,
    server: false,
  })

  const totals = computed(
    () => new Map((data.value?.porUf ?? []).map((item) => [item.uf, item.total])),
  )
  const max = computed(() => Math.max(1, ...totals.value.values()))
  const located = computed(() => (data.value ? data.value.total - data.value.semLocal : 0))

  const stats = computed(() => [
    { label: text.total, value: data.value?.total ?? 0, icon: 'ph:diamond' },
    { label: text.located, value: located.value, icon: 'ph:map-pin' },
    { label: text.states, value: data.value?.porUf.length ?? 0, icon: 'ph:map-trifold' },
    { label: text.cities, value: data.value?.cidades.length ?? 0, icon: 'ph:buildings' },
  ])

  function opacity(uf: string): number {
    const total = totals.value.get(uf) ?? 0
    return total ? 0.25 + 0.75 * (total / max.value) : 1
  }

  function nome(uf: string): string {
    return UFS.find((item) => item.sigla === uf)?.nome ?? uf
  }

  const rocks = computed(() =>
    selected.value ? (data.value?.rochasPorUf[selected.value] ?? []) : [],
  )
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-3xl border border-line bg-rocha p-5">
        <Icon :name="stat.icon" class="size-5 text-red" />
        <p class="mt-4 display text-[3rem] leading-none">{{ stat.value }}</p>
        <p class="mt-1 text-[0.8125rem] text-muted">{{ stat.label }}</p>
      </div>
    </div>

    <MatrizSegmented
      v-model="periodLabel"
      class="max-w-md"
      :label="text.period"
      :options="periods.map((item) => item.label)" />

    <div class="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div class="rounded-[2rem] border border-line bg-rocha p-4 sm:p-6">
        <svg
          :viewBox="BRASIL_VIEWBOX"
          class="mx-auto h-auto w-full max-w-[40rem]"
          role="img"
          aria-label="Mapa do Brasil com as coroas recomendadas por estado">
          <g :transform="BRASIL_TRANSFORM">
            <path
              v-for="item in BRASIL_UFS"
              :key="item.uf"
              :d="item.d"
              :fill-opacity="opacity(item.uf)"
              vector-effect="non-scaling-stroke"
              stroke-width="1"
              class="cursor-pointer stroke-furo transition-[fill-opacity,fill] duration-300"
              :class="[
                totals.get(item.uf) ? 'fill-red' : 'fill-fg/8',
                selected === item.uf ? 'stroke-osso' : '',
              ]"
              @click="selected = selected === item.uf ? null : item.uf">
              <title>{{ nome(item.uf) }} · {{ totals.get(item.uf) ?? 0 }} {{ text.crowns }}</title>
            </path>
          </g>
        </svg>
        <p v-if="data && data.semLocal" class="mt-4 text-[0.75rem] text-faint">
          {{ data.semLocal }} {{ text.noLocal }}
        </p>
      </div>

      <div class="flex flex-col gap-6">
        <div class="rounded-[2rem] border border-line bg-rocha p-6">
          <h3 class="display text-[1.75rem] leading-none">{{ text.byState }}</h3>
          <p v-if="!data?.porUf.length" class="mt-4 text-[0.875rem] text-muted">{{ text.empty }}</p>
          <ul class="mt-4 flex flex-col gap-2">
            <li v-for="item in data?.porUf ?? []" :key="item.uf">
              <button
                type="button"
                class="w-full text-left"
                :aria-pressed="selected === item.uf"
                @click="selected = selected === item.uf ? null : item.uf">
                <span class="flex justify-between text-[0.875rem]">
                  <span :class="selected === item.uf ? 'font-semibold text-red' : ''">{{
                    nome(item.uf)
                  }}</span>
                  <span class="font-mono tabular-nums">{{ item.total }}</span>
                </span>
                <span class="mt-1 block h-1.5 overflow-hidden rounded-full bg-fg/8">
                  <span
                    class="block h-full rounded-full bg-red"
                    :style="{ width: `${(item.total / max) * 100}%` }" />
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div class="rounded-[2rem] border border-line bg-rocha p-6">
          <h3 class="display text-[1.75rem] leading-none">
            {{ text.rocks }}<template v-if="selected"> · {{ selected }}</template>
          </h3>
          <p v-if="!selected" class="mt-4 text-[0.875rem] text-muted">{{ text.pick }}</p>
          <ul v-else class="mt-4 flex flex-col gap-2 text-[0.875rem]">
            <li v-for="item in rocks" :key="item.rocha" class="flex justify-between gap-3">
              <span>{{ item.rocha }}</span>
              <span class="font-mono tabular-nums">{{ item.total }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="rounded-[2rem] border border-line bg-rocha p-6">
      <h3 class="display text-[1.75rem] leading-none">{{ text.topCities }}</h3>
      <p v-if="!data?.cidades.length" class="mt-4 text-[0.875rem] text-muted">{{ text.empty }}</p>
      <ol class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(item, index) in data?.cidades ?? []"
          :key="`${item.cidade}-${item.uf}`"
          class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-furo/40 px-4 py-3 text-[0.875rem]">
          <span class="min-w-0 truncate">
            <span class="font-mono text-faint">{{ index + 1 }}.</span> {{ item.cidade }}/{{
              item.uf
            }}
          </span>
          <span class="font-mono font-semibold tabular-nums">{{ item.total }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>
