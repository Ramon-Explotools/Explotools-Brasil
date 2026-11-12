<script setup lang="ts">
  const props = defineProps({
    data: { type: Object as PropType<RecomendacaoLegada>, required: true },
  })

  const text = {
    badge: 'Recomendação antiga',
    rock: 'Rocha',
    unnamed: 'Não informada',
    matrix: 'Dureza da matriz',
    soft: 'liga macia',
    hard: 'liga dura',
    profile: 'Perfil recomendado',
    abr: 'Variante ABR',
    series: 'Série de referência',
    alt: 'Alternativa',
    crown: 'Geometria da coroa',
    open: 'Área aberta',
    waterway: 'Canal de água',
    brands: 'Principais marcas de coroa',
    brandsNote:
      'Alinhado pela faixa de Mohs, o eixo comum publicado pelos fabricantes. O grade de cada marca é o que cobre a mesma faixa de dureza — confirme no catálogo oficial.',
    diagnosis: 'Diagnóstico & solução',
    practices: 'Parâmetros & boas práticas',
  }

  const matrix = computed(() => Number(props.data.matriz) || 0)
  const cells = Array.from({ length: 9 }, (_, index) => index + 1)

  const inputs = computed(() => [
    { label: 'Mohs', value: String(props.data.mohs) },
    { label: 'Quartzo eq.', value: `~${props.data.eqc}%` },
    { label: 'CAI', value: `${props.data.cai} · ${props.data.caiClasse}` },
    { label: 'UCS', value: props.data.ucs },
    { label: 'Abrasividade', value: props.data.abrasividade },
    { label: 'Formação', value: props.data.formacao },
    { label: 'Granulometria', value: props.data.granulometria },
    { label: 'Diâmetro', value: props.data.diametro },
    { label: 'Objetivo', value: props.data.objetivo },
  ])

  const kpis = computed(() => [
    { label: 'RPM sugerido', value: props.data.rpm, icon: 'ph:arrows-clockwise' },
    { label: 'WOB típico (kN)', value: props.data.wob, icon: 'ph:arrow-fat-down' },
    { label: 'Fluxo de água (L/min)', value: props.data.fluxoAgua, icon: 'ph:drop' },
    { label: 'Canais de água', value: props.data.canal, icon: 'ph:waves' },
  ])

  const brands = computed(() => [
    { name: 'Boart Longyear', value: props.data.boartLongyear },
    { name: 'Fordia / Epiroc', value: props.data.fordiaEpiroc },
    { name: 'Di-Corp', value: props.data.diCorpo },
    { name: 'Dimatec', value: props.data.dimatec },
    { name: 'Hayden', value: props.data.hayden },
  ])
</script>

<template>
  <article class="overflow-hidden rounded-[2rem] border border-line bg-rocha">
    <header class="relative overflow-hidden border-b border-line p-6 sm:p-8">
      <div
        aria-hidden="true"
        class="absolute -top-20 -right-20 size-64 rounded-full bg-red/15 blur-3xl" />
      <div class="relative flex flex-wrap items-center gap-2">
        <span class="rounded-full bg-red px-3 py-1 label text-osso">{{ text.badge }}</span>
        <span class="font-mono text-[0.75rem] text-faint">{{
          formatDate(props.data.createdAt)
        }}</span>
      </div>
      <p class="relative mt-5 label text-fg/60">{{ text.rock }}</p>
      <h2 class="relative mt-1 display text-[clamp(2.5rem,5vw,3.75rem)] leading-[0.9]">
        {{ props.data.rocha || text.unnamed }}
      </h2>
      <dl class="relative mt-5 flex flex-wrap gap-2">
        <div
          v-for="input in inputs"
          :key="input.label"
          class="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.75rem]">
          <dt class="text-faint">{{ input.label }}</dt>
          <dd class="font-semibold text-fg/90">{{ input.value }}</dd>
        </div>
      </dl>
    </header>

    <section class="grid gap-px bg-line md:grid-cols-[1.1fr_1fr]">
      <div class="bg-rocha p-6 sm:p-8">
        <p class="label text-fg/60">{{ text.matrix }}</p>
        <div class="mt-3 flex items-end gap-5">
          <Motion
            as="span"
            class="display text-[clamp(7rem,14vw,10rem)] leading-[0.78] text-red"
            :initial="{ opacity: 0, y: 30, filter: 'blur(10px)' }"
            :animate="{ opacity: 1, y: 0, filter: 'blur(0px)' }"
            :transition="{ type: 'spring', bounce: 0.2, duration: 0.9 }">
            {{ props.data.matriz }}
          </Motion>
          <span class="pb-3 text-title font-semibold capitalize">{{
            props.data.matrizPalavra
          }}</span>
        </div>
        <div class="mt-6 grid grid-cols-9 gap-1.5" aria-hidden="true">
          <Motion
            v-for="cell in cells"
            :key="cell"
            class="h-8 origin-bottom rounded-md"
            :class="cell === matrix ? 'bg-red' : cell < matrix ? 'bg-red/35' : 'bg-fg/8'"
            :initial="{ scaleY: 0 }"
            :animate="{ scaleY: cell === matrix ? 1.3 : 1 }"
            :transition="{
              type: 'spring',
              bounce: 0.3,
              duration: 0.6,
              delay: 0.2 + cell * 0.03,
            }" />
        </div>
        <div class="mt-2 flex justify-between font-mono text-[0.6875rem] text-faint">
          <span>1 · {{ text.hard }}</span>
          <span>9 · {{ text.soft }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-px bg-line">
        <div class="flex-1 bg-rocha p-6">
          <p class="label text-fg/60">{{ text.profile }}</p>
          <dl class="mt-3 grid gap-2 text-[0.9375rem]">
            <div class="flex justify-between gap-4">
              <dt class="text-muted">{{ text.series }}</dt>
              <dd class="font-semibold">{{ props.data.serie }}</dd>
            </div>
            <div v-if="props.data.serieAlt" class="flex justify-between gap-4">
              <dt class="text-muted">{{ text.alt }}</dt>
              <dd class="font-semibold">{{ props.data.serieAlt }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted">{{ text.abr }}</dt>
              <dd class="font-semibold" :class="props.data.abrVariante === 'Sim' ? 'text-red' : ''">
                {{ props.data.abrVariante }}
              </dd>
            </div>
          </dl>
        </div>
        <div class="flex-1 bg-rocha p-6">
          <p class="label text-fg/60">{{ text.crown }}</p>
          <dl class="mt-3 grid gap-2 text-[0.9375rem]">
            <div class="flex justify-between gap-4">
              <dt class="text-muted">{{ text.open }}</dt>
              <dd class="text-right font-semibold">{{ props.data.areaAberta }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-muted">{{ text.waterway }}</dt>
              <dd class="text-right font-semibold">{{ props.data.canalCoroa }}</dd>
            </div>
          </dl>
          <p class="mt-3 text-[0.8125rem] text-faint">{{ props.data.alturaCoroa }}</p>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-px border-y border-line bg-line lg:grid-cols-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="bg-rocha p-5">
        <Icon :name="kpi.icon" class="size-5 text-red" />
        <p
          class="mt-3 font-mono text-[1.0625rem] font-semibold break-words text-fg tabular-nums sm:text-[1.1875rem]">
          {{ kpi.value || '—' }}
        </p>
        <p class="mt-1 text-[0.75rem] text-muted">{{ kpi.label }}</p>
      </div>
    </section>

    <section class="p-6 sm:p-8">
      <h3 class="display text-[1.75rem] leading-none">{{ text.brands }}</h3>
      <ul class="mt-4 grid gap-2 sm:grid-cols-2">
        <li
          v-for="brand in brands"
          :key="brand.name"
          class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-furo/40 px-4 py-3">
          <span class="text-[0.875rem] text-muted">{{ brand.name }}</span>
          <span class="text-right text-[0.9375rem] font-semibold">{{ brand.value || '—' }}</span>
        </li>
      </ul>
      <p v-if="props.data.abrNota" class="mt-3 flex gap-2 text-[0.875rem] text-red">
        <Icon name="ph:warning" class="mt-0.5 size-4 shrink-0" />
        {{ props.data.abrNota }}
      </p>
      <p class="mt-3 text-[0.75rem] text-faint">{{ text.brandsNote }}</p>
    </section>

    <section v-if="props.data.diagnostico?.length" class="border-t border-line p-6 sm:p-8">
      <h3 class="display text-[1.75rem] leading-none">{{ text.diagnosis }}</h3>
      <div class="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table class="w-full min-w-[40rem] text-left text-[0.8125rem]">
          <thead class="bg-furo/50">
            <tr>
              <th
                v-for="head in ['Sintoma / condição', 'Causa provável', 'Ação imediata', 'Ajuste']"
                :key="head"
                class="px-4 py-3 label text-[0.625rem] text-fg/60">
                {{ head }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in props.data.diagnostico"
              :key="row.sintoma"
              class="border-t border-line align-top">
              <td class="px-4 py-3 font-semibold">{{ row.sintoma }}</td>
              <td class="px-4 py-3 text-muted">{{ row.causa }}</td>
              <td class="px-4 py-3 text-fg/85">{{ row.acao }}</td>
              <td class="px-4 py-3 text-fg/85">{{ row.ajuste }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="props.data.boasPraticas?.length" class="border-t border-line p-6 sm:p-8">
      <h3 class="display text-[1.75rem] leading-none">{{ text.practices }}</h3>
      <div class="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table class="w-full min-w-[40rem] text-left text-[0.8125rem]">
          <thead class="bg-furo/50">
            <tr>
              <th
                v-for="head in ['Parâmetro', 'Regra de bolso', 'Como ajustar', 'Observação']"
                :key="head"
                class="px-4 py-3 label text-[0.625rem] text-fg/60">
                {{ head }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in props.data.boasPraticas"
              :key="row.parametro"
              class="border-t border-line align-top">
              <td class="px-4 py-3 font-semibold">{{ row.parametro }}</td>
              <td class="px-4 py-3 text-fg/85">{{ row.regra }}</td>
              <td class="px-4 py-3 text-muted">{{ row.ajuste }}</td>
              <td class="px-4 py-3 text-muted">{{ row.obs }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <footer v-if="$slots.actions" class="flex flex-wrap gap-3 border-t border-line p-6 sm:p-8">
      <slot name="actions" />
    </footer>
  </article>
</template>
