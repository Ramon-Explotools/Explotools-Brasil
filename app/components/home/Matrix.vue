<script setup lang="ts">
  import type { Abra } from '#shared/utils/rochas'

  const text = {
    eyebrow: 'Seleção de coroa',
    title: 'Qual coroa para a sua rocha?',
    lede: 'Rocha dura pede matriz mais macia: a liga precisa se desgastar no mesmo ritmo em que a rocha gasta os diamantes. Arraste a dureza e veja a matriz responder.',
    hardness: 'Dureza de perfuração (Mohs)',
    abrasion: 'Abrasividade',
    matrix: 'Matriz sugerida',
    covers: 'Cobre Mohs',
    full: 'Fazer a seleção completa',
    note: 'A ferramenta completa considera a rocha pelo nome, o diâmetro e o testemunho, e entrega a coroa Explotools com canal de água, rotação, peso, vazão e equivalência entre marcas.',
  }

  const levels = ['Baixa', 'Média', 'Alta'] as const
  const keys: Record<(typeof levels)[number], Abra> = {
    Baixa: 'low',
    Média: 'medium',
    Alta: 'high',
  }
  const mohs = ref([6.5])
  const abrasion = ref<(typeof levels)[number]>('Média')

  const hardness = computed(() => mohs.value[0] ?? 6.5)
  // Demonstração com rocha compacta de grão médio: só dureza e abrasividade mudam a matriz.
  const matrix = computed(() =>
    selectMatrix(hardness.value, keys[abrasion.value], 'compacta', 'medio'),
  )
  const word = computed(() => CLASSES[classOf(hardness.value)].label)
  const position = computed(() => MATRICES.indexOf(matrix.value))
</script>

<template>
  <section class="relative overflow-hidden bg-furo pb-24 sm:pb-36">
    <div class="mx-auto max-w-[90rem] px-5 sm:px-8">
      <div
        class="grid overflow-hidden rounded-[2rem] border border-line bg-rocha lg:grid-cols-[1fr_1fr]">
        <div class="flex flex-col justify-between gap-10 p-7 sm:p-12">
          <Reveal>
            <Eyebrow :depth="1180">{{ text.eyebrow }}</Eyebrow>
            <h2 class="mt-5 display text-headline text-balance">{{ text.title }}</h2>
            <p class="mt-5 max-w-lg text-[0.9375rem] text-muted sm:text-base">{{ text.lede }}</p>
          </Reveal>

          <div class="flex flex-col gap-8">
            <div>
              <div class="flex items-baseline justify-between">
                <span id="home-mohs" class="label text-fg/70">{{ text.hardness }}</span>
                <span class="font-mono text-[1.25rem] text-fg tabular-nums">{{
                  hardness.toFixed(1)
                }}</span>
              </div>
              <SliderRoot
                v-model="mohs"
                :min="1.5"
                :max="10"
                :step="0.1"
                aria-labelledby="home-mohs"
                class="relative mt-4 flex h-6 touch-none items-center select-none">
                <SliderTrack
                  class="relative h-1.5 grow overflow-hidden rounded-full bg-[linear-gradient(90deg,#3a3a40,#fe0018)]">
                  <SliderRange class="absolute h-full" />
                </SliderTrack>
                <SliderThumb
                  class="block size-6 rounded-full border-4 border-furo bg-osso shadow-float transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-red"
                  aria-label="Dureza de perfuração (Mohs)" />
              </SliderRoot>
              <div class="mt-2 flex justify-between font-mono text-[0.6875rem] text-faint">
                <span>mole</span>
                <span>dura</span>
                <span>extrema</span>
              </div>
            </div>

            <div>
              <span id="home-abra" class="label text-fg/70">{{ text.abrasion }}</span>
              <RadioGroupRoot
                v-model="abrasion"
                aria-labelledby="home-abra"
                class="mt-3 grid grid-cols-3 gap-1 rounded-full border border-line bg-furo p-1">
                <RadioGroupItem
                  v-for="level in levels"
                  :key="level"
                  :value="level"
                  class="relative h-10 rounded-full text-[0.875rem] font-medium transition-colors data-[state=checked]:text-osso data-[state=unchecked]:text-muted">
                  <Motion
                    v-if="abrasion === level"
                    layout-id="home-abra"
                    class="absolute inset-0 rounded-full bg-red"
                    :transition="{ type: 'spring', bounce: 0.2, duration: 0.45 }" />
                  <span class="relative">{{ level }}</span>
                </RadioGroupItem>
              </RadioGroupRoot>
            </div>
          </div>
        </div>

        <div
          class="relative flex flex-col justify-between gap-10 border-t border-line bg-furo/60 p-7 sm:p-12 lg:border-t-0 lg:border-l">
          <div>
            <p class="label text-fg/70">{{ text.matrix }}</p>
            <div class="mt-4 flex items-end gap-6">
              <Transition
                mode="out-in"
                enter-active-class="transition duration-300 ease-spring"
                enter-from-class="translate-y-6 opacity-0"
                leave-active-class="transition duration-150"
                leave-to-class="-translate-y-6 opacity-0">
                <span
                  :key="matrix.id"
                  class="display text-[clamp(7rem,16vw,12rem)] leading-[0.78] text-red">
                  {{ matrix.id }}
                </span>
              </Transition>
              <div class="pb-3">
                <p class="text-title font-semibold">{{ word }}</p>
                <p class="mt-1 font-mono text-[0.8125rem] text-muted">
                  {{ text.covers }}:
                  <span class="text-fg">{{ fmtBR(matrix.lo) }}–{{ fmtBR(matrix.hi) }}</span>
                </p>
              </div>
            </div>
            <div class="mt-8 grid grid-cols-11 gap-1" aria-hidden="true">
              <span
                v-for="(cell, index) in MATRICES"
                :key="cell.id"
                class="h-10 rounded-md transition-[background-color,transform] duration-300 ease-spring"
                :class="
                  index === position
                    ? 'scale-y-125 bg-red'
                    : index < position
                      ? 'bg-red/35'
                      : 'bg-fg/8'
                " />
            </div>
            <div class="mt-2 flex justify-between font-mono text-[0.6875rem] text-faint">
              <span>1 · liga dura</span>
              <span>15 · liga macia</span>
            </div>
          </div>

          <div>
            <p class="max-w-md text-[0.875rem] text-muted">{{ text.note }}</p>
            <Btn to="/selecao-matriz" size="lg" trailing="ph:arrow-right" class="mt-6">{{
              text.full
            }}</Btn>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
