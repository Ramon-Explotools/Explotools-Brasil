<script setup lang="ts">
  import type { Matrix, Priority } from '#shared/utils/matriz.engine'
  import { brand } from '~/data/content'

  const props = defineProps({
    data: { type: Object as PropType<RecomendacaoCoroa>, required: true },
    editable: { type: Boolean, default: false },
  })

  const emit = defineEmits<{ canal: [recomendacao: RecomendacaoCoroa] }>()

  const text = {
    badge: 'Coroa Explotools recomendada',
    manual: 'Dureza definida manualmente',
    adjusted: 'Ajustada em campo',
    kind: 'Coroa impregnada Explotools',
    adjustedLede: 'Ajustada pela sua avaliação de campo:',
    atLimit:
      'Esta já é a ponta da linha de matrizes. Fale com o técnico da Explotools para avaliar outras opções.',
    missing:
      'A rocha desta recomendação não está mais na base. Faça uma nova seleção para ver a coroa.',
    matrix: 'Matriz',
    scale: 'escala 1–15',
    covers: 'cobre Mohs',
    hard: 'liga mais dura',
    soft: 'liga mais macia',
    waterway: 'Canal de água',
    why: 'Por que',
    choice:
      'Nesta rocha dura e compacta, os dois canais servem. Escolha o que pesa mais no seu furo:',
    chosen: 'Prioridade escolhida:',
    quote: 'Pedir cotação desta coroa',
    quoteNote:
      'O pedido de cotação já leva a ficha completa: coroa, rocha, condições do furo e parâmetros.',
    ops: 'Parâmetros de operação',
    rpm: 'Rotação (RPM)',
    wob: 'Peso na coroa (kN)',
    flow: 'Vazão de água (L/min)',
    opsNote:
      'Comece no meio da faixa de rotação. Na coroa nova, faça 2–3 min a ~50% de rotação e peso para abrir os diamantes.',
    opsBroken: ' Em rocha quebrada, trabalhe na metade inferior da rotação.',
    how: 'Como chegamos nesta coroa',
    diagnosis: 'Diagnóstico em campo',
    brands: 'Equivalente em outras marcas',
    byName: '* Indicação da própria Fordia/Epiroc para esta rocha.',
    brandsNote:
      'Alinhado pela mesma dureza na escala Mohs, que é o eixo publicado por todas as marcas. Confirme no catálogo de cada fabricante.',
    rockless: 'Rocha não listada',
    yours: ' · informada por você',
    line: 'Ver a linha completa de acessórios Explotools',
  }

  const { user } = useUserSession()
  const input = computed(() => inputFromEntrada(props.data.entrada))
  const rec = computed(() => recommendCrown(input.value))

  // Coroa gerada pela avaliação de campo só com troca de canal (Turbo ↔ Standard) também é ajuste.
  const preferMoved = computed(() => Boolean(props.data.parentUid && props.data.entrada.prioridade))
  const adjusted = computed(
    () =>
      Boolean(rec.value?.fieldShift) ||
      Boolean(props.data.entrada.canalForcado) ||
      preferMoved.value,
  )

  const choices: { value: Priority; title: string; lede: string }[] = [
    {
      value: 'vida',
      title: 'Priorizar vida útil',
      lede: 'Standard: mais diamante na face, a coroa dura mais',
    },
    {
      value: 'avanco',
      title: 'Priorizar avanço',
      lede: 'Turbo: corta com menos peso e avança mais, mas gasta mais rápido',
    },
  ]
  const canChoose = computed(() => props.editable && props.data.status === 'aguardando')
  const saving = ref(false)
  const toast = useToast()

  async function choose(value: unknown): Promise<void> {
    if (value !== 'vida' && value !== 'avanco') return
    if (saving.value || !rec.value || value === rec.value.prefer) return
    saving.value = true
    try {
      const recomendacao = await $fetch<RecomendacaoCoroa>(
        `/api/recomendacoes/${props.data.uid}/canal`,
        { method: 'PUT', body: { prioridade: value } },
      )
      emit('canal', recomendacao)
    } catch (error) {
      toast.fail(error)
    } finally {
      saving.value = false
    }
  }

  function range(matrix: Matrix): string {
    return `${fmtBR(matrix.lo)}–${fmtBR(matrix.hi)}`
  }

  const context = computed(() => {
    const r = rec.value
    if (!r) return []
    return [
      { label: 'Rocha', value: r.rock?.n ?? text.rockless },
      { label: 'Dureza', value: `${CLASSES[r.cls].label} · Mohs ${fmtBR(r.H)}` },
      {
        label: 'Abrasividade',
        value: `${PT.abra[r.abra]}${r.rock && r.abra !== r.rock.abra ? text.yours : ''}`,
      },
      {
        label: 'Granulometria',
        value: `${PT.grain[r.grain]}${r.rock && r.grain !== r.rock.grain ? text.yours : ''}`,
      },
      { label: 'Testemunho', value: PT.cond[r.cond] },
      ...(props.data.local
        ? [{ label: 'Local', value: `${props.data.local.cidade}/${props.data.local.uf}` }]
        : []),
    ]
  })

  const adjustText = computed(() => {
    const r = rec.value
    if (!r) return ''
    const parts: string[] = []
    if (r.fieldShift) {
      parts.push(
        `Matriz ${r.baseMatrix.id} → ${r.matrix.id} (${r.fieldShift > 0 ? text.soft : text.hard})`,
      )
    }
    if (props.data.entrada.canalForcado || preferMoved.value) {
      parts.push(`canal de água ${r.waterway.type}`)
    }
    return `${parts.join(' · ')}.`
  })

  const kpis = computed(() => {
    const ops = rec.value?.ops
    if (!ops) return []
    return [
      {
        label: text.rpm,
        value: `${ops.rpmRange[0]}–${ops.rpmRange[1]}`,
        icon: 'ph:arrows-clockwise',
      },
      {
        label: text.wob,
        value: `${ops.wobRange[0]}–${ops.wobRange[1]}`,
        icon: 'ph:arrow-fat-down',
      },
      { label: text.flow, value: `${ops.flowRange[0]}–${ops.flowRange[1]}`, icon: 'ph:drop' },
    ]
  })

  const steps = computed(() => {
    const r = rec.value
    if (!r) return []
    const d = r.decision
    const cls = CLASSES[r.cls]
    const list = [
      r.manual
        ? `Dureza definida manualmente: Mohs ${fmtBR(r.H)} (${cls.label}).`
        : `${r.rock?.n ?? text.rockless} → classe ${cls.label} da tabela técnica (Mohs de perfuração ${cls.range.join('–')}; usamos ${fmtBR(r.H)})${r.rock && !r.rock.dt ? ', por analogia com rochas da mesma família' : ''}.`,
      `Matrizes cuja faixa cobre essa dureza: ${d.covering.map((m) => `${m.id} (${range(m)})`).join(', ')}. Centro mais próximo: ${d.nominal.id}.`,
      d.shifts.length > 0
        ? `Ajuste pela regra da tabela: ${d.shifts.map((s) => `${s.why} (${s.d > 0 ? 'sobe' : 'desce'} uma)`).join(' · ')}${d.clamped ? `, mantendo a matriz dentro da faixa de dureza${d.brokenAbr ? ' (em rocha quebrada e abrasiva pode descer uma além)' : ''}` : ''}.`
        : 'Sem ajuste: condição, abrasividade e granulometria não pedem mudança.',
    ]
    if (r.waterway.options.length > 1) {
      list.push(
        `Rocha dura e compacta: os canais Standard (mais vida útil) e Turbo (mais avanço) servem; a escolha é sua. Prioridade: ${PT.prefer[r.prefer]}.`,
      )
    }
    if (adjusted.value) list.push(`Ajuste de campo pela sua avaliação: ${adjustText.value}`)
    list.push(
      `Resultado: Matriz ${r.matrix.id}. Canal de água ${r.waterway.type} (granulometria ${PT.grain[r.grain]}, testemunho ${PT.cond[r.cond]}, diâmetro ${r.size}).`,
    )
    return list
  })

  const diagnosis = computed(() => {
    const r = rec.value
    const up = r?.adjust.up ? `matriz ${r.adjust.up}` : text.soft
    const down = r?.adjust.down ? `matriz ${r.adjust.down}` : text.hard
    const turbo = r?.waterway.type === 'Turbo'
    const turboFree = Boolean(r?.waterway.options.includes('Turbo')) && !turbo
    return [
      {
        sintoma: 'Face polida (lisa), sem avanço',
        causa: 'Liga dura demais para a rocha; peso baixo com rotação alta',
        acao: 'Aumente o peso por 30–60 s; reduza a rotação 10–15%',
        ajuste:
          !r?.adjust.up && turboFree
            ? 'Se repetir, troque para o canal Turbo'
            : `Se repetir, suba para ${up}`,
      },
      {
        sintoma: 'Desgaste rápido da coroa',
        causa: 'Liga macia demais ou rocha mais abrasiva que o previsto; pouca água',
        acao: 'Evite o topo da faixa de rotação; aumente a vazão',
        ajuste: turbo
          ? 'Se repetir, volte para o canal Standard'
          : `Se repetir, desça para ${down}`,
      },
      {
        sintoma: 'Vibração',
        causa: 'Ressonância; estabilização deficiente',
        acao: 'Reduza a rotação 10–15%; aumente um pouco o peso',
        ajuste: 'Opere no terço inferior da rotação',
      },
      {
        sintoma: 'Lavagem do testemunho',
        causa: 'Vazão alta em rocha friável; peso alto com rotação alta',
        acao: 'Reduza a vazão e a rotação temporariamente',
        ajuste: 'Canal Lateral/Superflush (N e maiores)',
      },
      {
        sintoma: 'Coroa empastada',
        causa: 'Finos acumulados; fluido viscoso ou pouca vazão',
        acao: 'Pare o avanço, bombeie e limpe, retome com mais vazão',
        ajuste: 'Canal Wide; reduza a viscosidade',
      },
    ]
  })

  const brands = computed(() => {
    const e = rec.value?.equiv
    if (!e) return []
    return [
      { name: 'Boart Longyear', value: e.bl },
      { name: 'Fordia / Epiroc', value: `${e.hero}${e.heroByName ? '*' : ''}` },
      { name: 'Di-Corp', value: e.dicorp },
      { name: 'Dimatec', value: e.dimatec },
      { name: 'Hayden', value: e.hayden },
    ]
  })

  function quote(): void {
    if (!rec.value) return
    const message = quoteDocument(rec.value, input.value, {
      date: formatDate(new Date().toISOString()),
      cliente: user.value?.email,
      local: props.data.local ? `${props.data.local.cidade}/${props.data.local.uf}` : undefined,
    })
    globalThis.open(
      `https://wa.me/${brand.whatsappPhone}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener',
    )
  }
</script>

<template>
  <div class="flex flex-col gap-4">
    <article
      v-if="!rec"
      class="rounded-[2rem] border border-line bg-rocha p-6 text-[0.9375rem] text-muted sm:p-8">
      {{ text.missing }}
    </article>

    <template v-else>
      <article class="overflow-hidden rounded-[2rem] border border-line bg-rocha">
        <header class="relative overflow-hidden border-b border-line p-6 sm:p-8">
          <div
            aria-hidden="true"
            class="absolute -top-20 -right-20 size-64 rounded-full bg-red/15 blur-3xl" />
          <div class="relative flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-red px-3 py-1 label text-osso">{{ text.badge }}</span>
            <span
              v-if="rec.manual"
              class="rounded-full border border-red/50 px-3 py-1 label text-red"
              >{{ text.manual }}</span
            >
            <span
              v-if="adjusted"
              class="rounded-full border border-line-strong px-3 py-1 label text-fg/80"
              >{{ text.adjusted }}</span
            >
            <span class="font-mono text-[0.75rem] text-faint">{{
              formatDate(props.data.createdAt)
            }}</span>
          </div>
          <p class="relative mt-5 label text-fg/60">{{ text.kind }}</p>
          <h2 class="relative mt-1 display text-[clamp(2.5rem,5vw,3.75rem)] leading-[0.9]">
            {{ rec.size }}
          </h2>
          <dl class="relative mt-5 flex flex-wrap gap-2">
            <div
              v-for="item in context"
              :key="item.label"
              class="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.75rem]">
              <dt class="text-faint">{{ item.label }}</dt>
              <dd class="font-semibold text-fg/90 first-letter:uppercase">{{ item.value }}</dd>
            </div>
          </dl>
          <p
            v-if="adjusted"
            class="relative mt-4 rounded-2xl border border-line-strong bg-furo/50 px-4 py-3 text-[0.875rem]">
            <b>{{ text.adjustedLede }}</b> {{ adjustText }}
          </p>
          <p
            v-if="rec.atLimit"
            class="relative mt-4 flex gap-2 rounded-2xl border border-red/40 bg-red/8 px-4 py-3 text-[0.875rem] text-fg/90">
            <Icon name="ph:warning" class="mt-0.5 size-4 shrink-0 text-red" />
            {{ text.atLimit }}
          </p>
        </header>

        <section class="grid gap-px bg-line md:grid-cols-[1.15fr_1fr]">
          <div class="bg-rocha p-6 sm:p-8">
            <p class="label text-fg/60">{{ text.matrix }}</p>
            <div class="mt-3 flex items-end gap-5">
              <Motion
                as="span"
                class="display text-[clamp(6rem,13vw,9rem)] leading-[0.78] text-red"
                :initial="{ opacity: 0, y: 30, filter: 'blur(10px)' }"
                :animate="{ opacity: 1, y: 0, filter: 'blur(0px)' }"
                :transition="{ type: 'spring', bounce: 0.2, duration: 0.9 }">
                {{ rec.matrix.id }}
              </Motion>
              <span class="pb-2 font-mono text-[0.8125rem] text-muted">
                {{ text.scale }}<br />{{ text.covers }} {{ range(rec.matrix) }}
              </span>
            </div>
            <div class="mt-6 grid grid-cols-11 gap-1" aria-hidden="true">
              <Motion
                v-for="(cell, index) in MATRICES"
                :key="cell.id"
                class="flex h-8 origin-bottom items-center justify-center rounded-md font-mono text-[0.5625rem] sm:text-[0.625rem]"
                :class="
                  cell.id === rec.matrix.id
                    ? 'bg-red text-osso'
                    : index < MATRICES.indexOf(rec.matrix)
                      ? 'bg-red/30 text-fg/70'
                      : 'bg-fg/8 text-faint'
                "
                :initial="{ scaleY: 0 }"
                :animate="{ scaleY: cell.id === rec.matrix.id ? 1.3 : 1 }"
                :transition="{
                  type: 'spring',
                  bounce: 0.3,
                  duration: 0.6,
                  delay: 0.2 + index * 0.03,
                }">
                <span :class="cell.id === rec.matrix.id ? '' : 'hidden sm:inline'">{{
                  cell.id
                }}</span>
              </Motion>
            </div>
            <div class="mt-2 flex justify-between font-mono text-[0.6875rem] text-faint">
              <span>← {{ text.hard }}</span>
              <span>{{ text.soft }} →</span>
            </div>
          </div>

          <div class="flex flex-col bg-rocha p-6 sm:p-8">
            <p class="label text-fg/60">{{ text.waterway }}</p>
            <p class="mt-3 display text-[2.25rem] leading-none">{{ rec.waterway.type }}</p>
            <p class="mt-1 font-mono text-[0.75rem] text-faint">{{ rec.waterway.trigger }}</p>
            <template v-if="rec.waterway.options.length > 1">
              <template v-if="canChoose">
                <p id="canal-escolha" class="mt-4 text-[0.8125rem] text-muted">{{ text.choice }}</p>
                <RadioGroupRoot
                  :model-value="rec.prefer"
                  :disabled="saving"
                  aria-labelledby="canal-escolha"
                  class="mt-2 grid gap-2"
                  @update:model-value="choose">
                  <RadioGroupItem
                    v-for="option in choices"
                    :key="option.value"
                    :value="option.value"
                    class="rounded-2xl border p-3 text-left transition-colors data-[state=checked]:border-red data-[state=checked]:bg-red/10 data-[state=unchecked]:border-line-strong data-[state=unchecked]:hover:border-fg/50">
                    <span class="block text-[0.9375rem] font-semibold">{{ option.title }}</span>
                    <span class="block text-[0.75rem] text-muted">{{ option.lede }}</span>
                  </RadioGroupItem>
                </RadioGroupRoot>
              </template>
              <p v-else class="mt-3 text-[0.8125rem] text-muted">
                {{ text.chosen }} <b class="text-fg/90">{{ PT.prefer[rec.prefer] }}</b>
              </p>
            </template>
            <p class="mt-4 text-[0.875rem] text-fg/85">
              <b>{{ text.why }} {{ rec.waterway.type }}:</b> {{ rec.waterway.reason }}
            </p>
            <p v-if="rec.waterway.note" class="mt-3 text-[0.8125rem] text-muted">
              {{ rec.waterway.note }}
            </p>
          </div>
        </section>

        <div class="flex flex-col gap-3 border-t border-line p-6 sm:p-8">
          <div class="flex flex-wrap gap-3">
            <Btn icon="simple-icons:whatsapp" @click="quote">{{ text.quote }}</Btn>
            <slot name="actions" />
          </div>
          <p class="text-[0.8125rem] text-faint">{{ text.quoteNote }}</p>
        </div>

        <AccordionRoot type="multiple" class="border-t border-line">
          <AccordionItem value="ops" class="border-b border-line">
            <AccordionHeader>
              <AccordionTrigger
                class="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[0.9375rem] font-semibold sm:px-8">
                {{ text.ops }} · {{ rec.size }}
                <Icon
                  name="ph:plus"
                  class="size-4 shrink-0 text-red transition-transform duration-300 group-data-[state=open]:rotate-45" />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="fold">
              <div class="grid grid-cols-1 gap-px border-y border-line bg-line sm:grid-cols-3">
                <div v-for="kpi in kpis" :key="kpi.label" class="bg-rocha p-5">
                  <Icon :name="kpi.icon" class="size-5 text-red" />
                  <p class="mt-3 font-mono text-[1.1875rem] font-semibold text-fg tabular-nums">
                    {{ kpi.value }}
                  </p>
                  <p class="mt-1 text-[0.75rem] text-muted">{{ kpi.label }}</p>
                </div>
              </div>
              <p class="px-6 py-5 text-[0.8125rem] text-muted sm:px-8">
                {{ text.opsNote }}{{ rec.cond === 'compacta' ? '' : text.opsBroken }}
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="brands">
            <AccordionHeader>
              <AccordionTrigger
                class="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[0.9375rem] font-semibold sm:px-8">
                {{ text.brands }}
                <Icon
                  name="ph:plus"
                  class="size-4 shrink-0 text-red transition-transform duration-300 group-data-[state=open]:rotate-45" />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="fold">
              <div class="px-6 pb-6 sm:px-8">
                <ul class="grid gap-2 sm:grid-cols-2">
                  <li
                    v-for="item in brands"
                    :key="item.name"
                    class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-furo/40 px-4 py-3">
                    <span class="text-[0.875rem] text-muted">{{ item.name }}</span>
                    <span class="text-right text-[0.9375rem] font-semibold">{{ item.value }}</span>
                  </li>
                </ul>
                <p v-if="rec.equiv.abr" class="mt-3 flex gap-2 text-[0.875rem] text-red">
                  <Icon name="ph:warning" class="mt-0.5 size-4 shrink-0" />
                  {{ rec.equiv.abr }}
                </p>
                <p v-if="rec.equiv.heroByName" class="mt-3 text-[0.75rem] text-faint">
                  {{ text.byName }}
                </p>
                <p class="mt-2 text-[0.75rem] text-faint">{{ text.brandsNote }}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>
      </article>

      <slot name="feedback" />

      <AccordionRoot type="multiple" class="flex flex-col gap-4">
        <AccordionItem
          value="how"
          class="overflow-hidden rounded-[2rem] border border-line bg-rocha">
          <AccordionHeader>
            <AccordionTrigger
              class="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[0.9375rem] font-semibold sm:px-8">
              {{ text.how }}
              <Icon
                name="ph:plus"
                class="size-4 shrink-0 text-red transition-transform duration-300 group-data-[state=open]:rotate-45" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent class="fold">
            <ol
              class="flex list-decimal flex-col gap-2 px-6 pb-6 pl-11 text-[0.875rem] text-fg/85 sm:px-8 sm:pl-13">
              <li v-for="step in steps" :key="step">{{ step }}</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="diagnosis"
          class="overflow-hidden rounded-[2rem] border border-line bg-rocha">
          <AccordionHeader>
            <AccordionTrigger
              class="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[0.9375rem] font-semibold sm:px-8">
              {{ text.diagnosis }}
              <Icon
                name="ph:plus"
                class="size-4 shrink-0 text-red transition-transform duration-300 group-data-[state=open]:rotate-45" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent class="fold">
            <div class="px-6 pb-6 sm:px-8">
              <div class="overflow-x-auto rounded-2xl border border-line">
                <table class="w-full min-w-[40rem] text-left text-[0.8125rem]">
                  <thead class="bg-furo/50">
                    <tr>
                      <th
                        v-for="head in ['Sintoma', 'Causa provável', 'Ação imediata', 'Na coroa']"
                        :key="head"
                        class="px-4 py-3 label text-[0.625rem] text-fg/60">
                        {{ head }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in diagnosis"
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>

      <NuxtLink
        to="/produtos"
        class="group inline-flex items-center gap-2 self-start px-2 py-1 text-[0.875rem] font-semibold text-muted hover:text-fg">
        {{ text.line }}
        <Icon
          name="ph:arrow-right"
          class="size-4 text-red transition-transform duration-300 group-hover:translate-x-0.5" />
      </NuxtLink>
    </template>
  </div>
</template>
