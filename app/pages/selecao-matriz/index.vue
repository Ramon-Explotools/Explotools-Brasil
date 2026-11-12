<script setup lang="ts">
  import { safeParse } from 'valibot'

  import type { Cond } from '#shared/utils/matriz.engine'
  import type { Abra, Grain, Rock, RockClass } from '#shared/utils/rochas'

  const text = {
    title: 'Seleção de coroa',
    description:
      'Ferramenta gratuita da Explotools para escolher a coroa diamantada impregnada certa: matriz, canal de água e parâmetros de operação pela rocha, diâmetro e testemunho.',
    eyebrow: 'Ferramenta Explotools',
    heading: ['Seleção', 'de coroa.'],
    lede: 'Responda 4 perguntas e toque em Obter recomendação. A ferramenta indica a coroa Explotools, a matriz, o canal de água e os parâmetros de operação.',
    step1: 'Qual é a rocha?',
    step1Lede:
      'Digite o nome. Dureza, abrasividade e granulometria vêm da rocha, e você pode ajustar.',
    search: 'Buscar rocha',
    searchPlaceholder: 'Ex.: granito, basalto, itabirito…',
    noRock: 'Nenhuma rocha com esse nome. Use “Não achei minha rocha” para definir a dureza.',
    common: 'Mais comuns, toque para escolher:',
    manualLink: 'Não achei minha rocha: definir a dureza manualmente',
    listed: 'classificação da tabela técnica',
    analogy: 'classificada por analogia',
    unlisted: 'Rocha não listada',
    unlistedTag: 'dureza definida por você',
    variable:
      'Rocha muito variável (alteração, cimentação ou fragmentos). Se a sua for mais dura ou mais mole que o normal, ajuste no cadeado.',
    hardness: 'Dureza de perfuração',
    auto: 'automática pela rocha',
    manual: 'definida manualmente',
    edit: 'Editar dureza',
    editHint:
      'Estes são os valores típicos desta rocha. Seu boletim ou o furo mostram outra coisa? Ajuste aqui: a recomendação usa o que você informar.',
    manualOn: 'Manual',
    unlock: 'Destravar para editar a dureza',
    relock: 'Voltar ao automático',
    cancel: 'Cancelar',
    warnTitle: 'Modo manual ativado.',
    warnText:
      'A partir de agora a dureza é definida por você e não vem mais da rocha selecionada. A recomendação usa este valor. Use só se tiver medição ou experiência no local.',
    warnTextNoRock:
      'A partir de agora a dureza é definida por você. A recomendação usa este valor. Use só se tiver medição ou experiência no local.',
    examples: 'Exemplos:',
    abrasion: 'Abrasividade',
    abrasionRock: '(estimada pela rocha)',
    abrasionUser: '(ajustada por você)',
    abrasionDefault: '(padrão: ajuste se souber)',
    grain: 'Granulometria',
    grainRock: '(típica da rocha)',
    grainUser: '(ajustada por você)',
    step2: 'Qual o diâmetro?',
    diameter: 'Diâmetro da coroa',
    step3: 'Como sai o testemunho?',
    step4: 'Onde fica a sondagem?',
    step4Lede: 'Estado e cidade do furo. Na próxima vez, já vem preenchido.',
    step4Privacy: 'Usamos a cidade para mapear onde as coroas Explotools trabalham.',
    uf: 'Estado',
    city: 'Cidade',
    cityPlaceholder: 'Digite a cidade…',
    cityFirst: 'Escolha o estado primeiro',
    noCity: 'Nenhuma cidade com esse nome neste estado.',
    answer: 'Responda as 4 perguntas',
    submit: 'Obter recomendação',
    update: 'Atualizar recomendação',
    ready: 'Recomendação pronta',
    readyNote: 'Mudou alguma resposta? O botão fica vermelho de novo.',
    stale: 'Você mudou as respostas. Toque em Atualizar recomendação para ver a coroa certa.',
    empty: 'Sua coroa aparece aqui.',
    emptyLede: 'Responda as 4 perguntas e toque em “Obter recomendação”.',
    emptyItems: ['Rocha ou dureza', 'Diâmetro', 'Condição do testemunho', 'Local da sondagem'],
    copy: 'Copiar link',
    copied: 'Link copiado',
    recent: 'Meu histórico',
    noRecent: 'Nenhuma coroa ainda. As recomendações que você gerar ficam guardadas aqui.',
    logout: 'Sair',
    tipsTitle: 'Dicas operacionais',
    faqTitle: 'Perguntas frequentes',
    sessionOut: 'Você saiu da ferramenta',
  }

  useHead({ title: text.title })
  useSeoMeta({ description: text.description })
  defineOgImage('Explotools.takumi', {
    title: 'Seleção de coroa.',
    description: 'Qual coroa para a sua rocha? Ferramenta gratuita.',
  })

  const ABRA_LABELS: Record<Abra, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' }
  const GRAIN_LABELS: Record<Grain, string> = { fino: 'Fina', medio: 'Média', grosso: 'Grossa' }
  const STATUS_LABELS: Record<StatusCoroa, string> = {
    aguardando: 'Aguardando teste',
    atendeu: 'Atendeu',
    ajustada: 'Precisou ajustar',
  }

  const conditions: { value: Cond; title: string; lede: string }[] = [
    { value: 'compacta', title: 'Compacto', lede: 'Sai inteiro, com poucas fraturas' },
    { value: 'fraturada', title: 'Fraturado', lede: 'Sai em pedaços, rocha quebrada' },
    {
      value: 'friavel',
      title: 'Friável',
      lede: 'Desagrega, lava o testemunho ou perde circulação',
    },
  ]

  const tips = [
    'Na coroa nova, faça 2–3 minutos a cerca de 50% de rotação e peso para abrir os diamantes.',
    'Peso na coroa: use o mínimo que mantenha o avanço; peso demais danifica a coroa.',
    'Aumente a vazão de água quando a penetração subir; evite fluido muito viscoso.',
    'Em terreno quebrado, trabalhe na metade inferior da rotação e mantenha peso suficiente para avançar.',
    'Face polida e sem avanço pede liga mais macia; desgaste rápido pede liga mais dura. Avalie a coroa aqui depois do teste.',
  ]

  const faq = [
    {
      q: 'Como a matriz é escolhida?',
      a: 'Usamos o guia de seleção de matrizes da tabela técnica das coroas Explotools. Cada matriz cobre uma faixa de dureza da rocha na escala Mohs. Escolhemos a matriz cuja faixa cobre a dureza da sua rocha e cujo centro está mais próximo dela. Depois aplicamos a regra da tabela: rocha fraturada, friável, abrasiva ou de grão grosso pede um número menor; rocha compacta, pouco abrasiva ou de grão fino pede um número maior.',
    },
    {
      q: 'O que significa o número da matriz?',
      a: 'É a dureza da liga metálica que segura os diamantes, numa escala de 1 a 15. A matriz 1 é a mais dura e a 15 é a mais macia. Rocha dura e não abrasiva pede liga macia (número maior), que se desgasta e expõe diamantes novos. Rocha mole ou abrasiva pede liga dura (número menor), para a coroa não se gastar rápido demais.',
    },
    {
      q: 'Por que o arenito e o itabirito friável aparecem como “mole”?',
      a: 'A dureza usada aqui é a dureza de perfuração da rocha, não a do mineral. O grão de quartzo é duro, mas a rocha como um todo perfura como uma rocha mole. A abrasividade alta é considerada à parte e desce a matriz.',
    },
    {
      q: 'Quando definir a dureza manualmente?',
      a: 'Quando a sua rocha não está na lista, quando ela está marcada como “muito variável”, ou quando você tem medição ou experiência local que indica uma dureza diferente. Toque no cadeado para destravar. Enquanto o modo manual estiver ativo, a recomendação usa o valor que você definir, e isso aparece destacado no resultado.',
    },
    {
      q: 'Qual canal de água usar?',
      a: 'Standard para rocha compacta e de grão fino: tem mais diamantes na face e dura mais. Em rocha dura e compacta, você escolhe entre Standard (mais vida útil) e Turbo (menos área de contato: avança mais, mas gasta mais rápido). Wide para rocha de grão grosso, fraturada ou quebrada: dá mais vazão e penetra mais. Lateral/Superflush para formação friável, que lava o testemunho ou perde circulação. Turbo, Wide e Superflush são indicados a partir do diâmetro N.',
    },
    {
      q: 'Como funciona o histórico e a avaliação?',
      a: 'Toda coroa que você gera fica no seu histórico. Depois de testar no furo, abra pelo “Meu histórico” e conte como foi: se atendeu, ou o que precisou ajustar. Se precisou, a ferramenta gera na hora a coroa ajustada. As avaliações ajudam a Explotools a refinar as recomendações.',
    },
    {
      q: 'Como são definidas as outras marcas?',
      a: 'Não existe tabela pública que diga “grade X de uma marca = grade Y de outra”. O eixo que todos os fabricantes publicam é a escala Mohs, então alinhamos pela mesma dureza: Boart Longyear, Fordia/Epiroc (HERO), Di-Corp, Dimatec e Hayden. Quando a própria marca indica um grade pelo nome da rocha, usamos a indicação dela. Confirme sempre no catálogo do fabricante.',
    },
    {
      q: 'Os números são exatos?',
      a: 'São o ponto de partida recomendado pela tabela técnica. O que fecha a escolha é a resposta do furo — por isso a avaliação depois do teste é tão importante.',
    },
  ]

  const { recomendacaoSchema } = useRecomendacaoSchema()
  const { loggedIn, fetch: refreshSession, clear: clearSession } = useUserSession()
  const toast = useToast()
  const gate = ref(false)
  const loading = ref(false)
  const result = ref<RecomendacaoCoroa | null>(null)
  const resultKey = ref<string | null>(null)
  const resultEl = useTemplateRef<HTMLElement>('resultEl')
  const { $lenis } = useNuxtApp()

  /* ===== 1. Rocha ===== */
  const rock = ref<Rock | null>(null)
  const picked = ref<string>('')
  const term = ref('')
  const searchOpen = ref(false)
  const manual = ref(false)
  const manualH = ref(5)
  const abra = ref<Abra | null>(null)
  const grain = ref<Grain | null>(null)
  const matches = computed(() => searchRocks(term.value, 12))

  watch(term, (value) => {
    if (!value.trim()) searchOpen.value = false
  })

  watch(picked, (name) => {
    const found = findRock(name)
    if (found) pickRock(found)
  })

  function pickRock(found: Rock): void {
    rock.value = found
    picked.value = found.n
    term.value = found.n
    manual.value = false
    abra.value = found.abra
    grain.value = found.grain
    searchOpen.value = false
  }

  function setManual(on: boolean): void {
    // Começa na dureza atual, antes de ligar o modo: destravar não muda a recomendação.
    if (on && !manual.value) manualH.value = startManualH(rock.value)
    manual.value = on
    if (on && !abra.value) abra.value = 'medium'
    if (on && !grain.value) grain.value = 'medio'
    if (!on && !rock.value) {
      abra.value = null
      grain.value = null
    }
  }

  const hardnessValue = computed(() => {
    if (manual.value) return manualH.value
    return rock.value ? CLASSES[rock.value.cls].H : null
  })
  const hardnessClass = computed<RockClass | null>(() =>
    hardnessValue.value === null ? null : classOf(hardnessValue.value),
  )
  const slider = computed({
    get: () => [manualH.value],
    set: (value: number[]) => {
      manualH.value = value[0] ?? manualH.value
    },
  })
  const abraLabel = computed({
    get: () => (abra.value ? ABRA_LABELS[abra.value] : ''),
    set: (label: string) => {
      const key = (Object.keys(ABRA_LABELS) as Abra[]).find((item) => ABRA_LABELS[item] === label)
      if (key) abra.value = key
    },
  })
  const grainLabel = computed({
    get: () => (grain.value ? GRAIN_LABELS[grain.value] : ''),
    set: (label: string) => {
      const key = (Object.keys(GRAIN_LABELS) as Grain[]).find(
        (item) => GRAIN_LABELS[item] === label,
      )
      if (key) grain.value = key
    },
  })
  const grainNote = computed(() => {
    if (!rock.value) return text.abrasionDefault
    return grain.value === rock.value.grain ? text.grainRock : text.grainUser
  })
  const abraNote = computed(() => {
    if (!rock.value) return text.abrasionDefault
    return abra.value === rock.value.abra ? text.abrasionRock : text.abrasionUser
  })

  /* ===== 2 e 3. Diâmetro e testemunho ===== */
  const size = ref('')
  const cond = ref('')

  /* ===== 4. Local da sondagem ===== */
  const uf = ref('')
  const municipio = ref('')
  const cityTerm = ref('')
  const cityOpen = ref(false)
  const cidades = ref<{ codigo: number; nome: string }[]>([])
  const cidade = computed(
    () => cidades.value.find((item) => String(item.codigo) === municipio.value) ?? null,
  )
  const cityMatches = computed(() => {
    const query = normText(cityTerm.value).trim()
    if (!query) return []
    const starts = cidades.value.filter((item) => normText(item.nome).startsWith(query))
    const contains = cidades.value.filter(
      (item) => !normText(item.nome).startsWith(query) && normText(item.nome).includes(query),
    )
    return [...starts, ...contains].slice(0, 12)
  })

  async function loadCidades(sigla: string): Promise<void> {
    cidades.value = sigla
      ? await $fetch<{ codigo: number; nome: string }[]>(`/api/municipios/${sigla}`).catch(() => [])
      : []
  }

  watch(uf, async (sigla, previous) => {
    if (previous) {
      municipio.value = ''
      cityTerm.value = ''
    }
    await loadCidades(sigla)
  })

  // Nome exibido no campo para o código IBGE escolhido (antes da lista carregar, usa o último local).
  const lastLocal = ref<LocalSondagem | null>(null)
  function cityLabel(value: string): string {
    if (cidade.value && String(cidade.value.codigo) === value) return cidade.value.nome
    return lastLocal.value && String(lastLocal.value.codigoIbge) === value
      ? lastLocal.value.cidade
      : ''
  }

  watch(cityTerm, (value) => {
    if (!value.trim()) cityOpen.value = false
  })

  /* ===== Botão Obter recomendação ===== */
  const answered = computed(
    () =>
      (hardnessValue.value === null ? 0 : 1) +
      (size.value ? 1 : 0) +
      (cond.value ? 1 : 0) +
      (municipio.value ? 1 : 0),
  )
  const formKey = computed(() =>
    answered.value < 4
      ? null
      : JSON.stringify([
          rock.value?.n ?? null,
          manual.value ? manualH.value : null,
          abra.value,
          grain.value,
          size.value,
          cond.value,
          municipio.value,
        ]),
  )
  const fresh = computed(
    () => Boolean(result.value) && formKey.value !== null && formKey.value === resultKey.value,
  )
  const stale = computed(() => Boolean(result.value) && !fresh.value)
  const goLabel = computed(() => {
    if (answered.value < 4) return `${text.answer} (${answered.value}/4)`
    if (fresh.value) return text.ready
    return result.value ? text.update : text.submit
  })

  const { data: recent, refresh: refreshRecent } = await useFetch<RecomendacaoResumo[]>(
    '/api/recomendacoes',
    { default: () => [], immediate: loggedIn.value },
  )

  // Começa com o último local usado pela pessoa (fica no cadastro, vale em qualquer aparelho).
  watch(
    recent,
    (list) => {
      const last = list.find((item) => item.local)?.local
      if (!last || uf.value) return
      lastLocal.value = last
      uf.value = last.uf
      municipio.value = String(last.codigoIbge)
    },
    { immediate: true },
  )

  onMounted(() => {
    if (!loggedIn.value) gate.value = true
  })

  async function entered(): Promise<void> {
    await refreshRecent()
  }

  async function scrollToResult(): Promise<void> {
    await nextTick()
    if (!resultEl.value) return
    if ($lenis) $lenis.scrollTo(resultEl.value, { offset: -90, duration: 1.2 })
    else resultEl.value.scrollIntoView({ behavior: 'smooth' })
  }

  async function submit(): Promise<void> {
    if (answered.value < 4 || loading.value) return
    if (fresh.value) {
      await scrollToResult()
      return
    }
    if (!loggedIn.value) {
      gate.value = true
      return
    }
    const body = safeParse(recomendacaoSchema, {
      rocha: rock.value?.n ?? null,
      durezaManual: manual.value ? manualH.value : null,
      abrasividade: abra.value,
      granulometria: grain.value,
      diametro: size.value,
      testemunho: cond.value,
      uf: uf.value,
      municipio: Number(municipio.value),
    })
    if (!body.success) {
      toast.error(body.issues[0]?.message ?? 'Confira as respostas')
      return
    }
    loading.value = true
    try {
      const key = formKey.value
      result.value = await $fetch('/api/recomendacoes', { method: 'POST', body: body.output })
      resultKey.value = key
      await refreshRecent()
      if (globalThis.innerWidth < 1024) await scrollToResult()
    } catch (error) {
      toast.fail(error)
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 401) {
        await refreshSession()
        gate.value = true
      }
    } finally {
      loading.value = false
    }
  }

  async function evaluated(resposta: AvaliacaoResposta): Promise<void> {
    result.value = resposta.ajustada ?? resposta.recomendacao
    await refreshRecent()
    if (resposta.ajustada) await scrollToResult()
  }

  const { copy } = useClipboard()

  async function share(): Promise<void> {
    if (!result.value) return
    await copy(`${globalThis.location.origin}/selecao-matriz/${result.value.uid}`)
    toast.success(text.copied)
  }

  async function logout(): Promise<void> {
    await clearSession()
    result.value = null
    recent.value = []
    toast.info(text.sessionOut)
    gate.value = true
  }
</script>

<template>
  <div>
    <section class="relative overflow-hidden pt-32 pb-12 sm:pt-40">
      <div aria-hidden="true" class="absolute inset-x-0 bottom-0 h-full opacity-60">
        <Strata :layers="6" :seed="31" :depth="180" :vein="3" />
      </div>
      <div
        aria-hidden="true"
        class="absolute inset-0 bg-linear-to-b from-furo/30 via-furo/60 to-furo" />
      <div
        class="relative mx-auto flex max-w-[90rem] flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Motion
            as="p"
            class="label text-red"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :transition="{ delay: 0.15 }">
            {{ text.eyebrow }}
          </Motion>
          <h1 class="mt-5 display text-[clamp(4rem,12vw,10rem)] leading-[0.82]">
            <span v-for="(line, index) in text.heading" :key="line" class="block overflow-hidden">
              <Motion
                as="span"
                class="block"
                :class="index === 1 ? 'text-red' : ''"
                :initial="{ y: '105%' }"
                :animate="{ y: '0%' }"
                :transition="{
                  type: 'spring',
                  bounce: 0.1,
                  duration: 1.1,
                  delay: 0.2 + index * 0.1,
                }">
                {{ line }}
              </Motion>
            </span>
          </h1>
          <Reveal :delay="0.4">
            <p class="mt-6 max-w-xl text-lede text-muted">{{ text.lede }}</p>
          </Reveal>
        </div>

        <div v-if="loggedIn" class="flex items-center gap-2">
          <PopoverRoot>
            <PopoverTrigger
              class="flex h-11 items-center gap-2 rounded-full border border-line-strong bg-furo/50 px-4 text-[0.875rem] font-semibold backdrop-blur hover:border-fg/50">
              <Icon name="ph:clock-counter-clockwise" class="size-4" />
              {{ text.recent }}
              <span class="rounded-full bg-red px-2 py-0.5 font-mono text-[0.6875rem] text-osso">{{
                recent.length
              }}</span>
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent
                align="end"
                :side-offset="8"
                class="pop z-60 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-line-strong bg-rocha-2 p-2 shadow-float">
                <p v-if="!recent.length" class="p-3 text-[0.875rem] text-muted">
                  {{ text.noRecent }}
                </p>
                <NuxtLink
                  v-for="item in recent"
                  :key="item.uid"
                  :to="`/selecao-matriz/${item.uid}`"
                  class="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-fg/5">
                  <span class="min-w-0">
                    <span class="block truncate text-[0.875rem] font-semibold">
                      {{ item.rocha || text.unlisted }}
                      <span v-if="item.diametro" class="font-normal text-muted">
                        · {{ item.diametro }}</span
                      >
                    </span>
                    <span class="block font-mono text-[0.6875rem] text-faint">
                      {{ formatDate(item.createdAt) }}
                      <template v-if="item.status"> · {{ STATUS_LABELS[item.status] }}</template>
                    </span>
                  </span>
                  <span class="display text-[1.75rem] leading-none text-red">{{
                    item.matriz
                  }}</span>
                </NuxtLink>
              </PopoverContent>
            </PopoverPortal>
          </PopoverRoot>
          <button
            type="button"
            class="flex size-11 items-center justify-center rounded-full border border-line-strong bg-furo/50 backdrop-blur hover:border-red hover:text-red"
            :aria-label="text.logout"
            @click="logout">
            <Icon name="ph:sign-out" class="size-4" />
          </button>
        </div>
      </div>
    </section>

    <section class="relative bg-furo pb-20">
      <div
        class="mx-auto grid max-w-[90rem] gap-6 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <form
          class="flex flex-col gap-6 rounded-[2rem] border border-line bg-rocha p-6 sm:p-8"
          novalidate
          @submit.prevent="submit">
          <!-- 1. Rocha -->
          <div>
            <p class="flex items-center gap-3">
              <span
                class="flex size-7 items-center justify-center rounded-lg font-mono text-[0.8125rem] font-semibold"
                :class="hardnessValue === null ? 'bg-red text-osso' : 'bg-fg/10 text-fg'">
                <Icon v-if="hardnessValue !== null" name="ph:check-bold" class="size-3.5" />
                <template v-else>1</template>
              </span>
              <span class="text-title font-semibold">{{ text.step1 }}</span>
            </p>
            <p class="mt-2 text-[0.875rem] text-muted">{{ text.step1Lede }}</p>

            <label for="rocha" class="sr-only">{{ text.search }}</label>
            <ComboboxRoot
              v-model="picked"
              v-model:open="searchOpen"
              ignore-filter
              :reset-search-term-on-blur="false"
              class="relative mt-4">
              <ComboboxAnchor
                class="flex h-12 items-center gap-2 rounded-xl border border-line-strong bg-furo/60 px-4 focus-within:border-red focus-within:ring-4 focus-within:ring-red/20">
                <Icon name="ph:magnifying-glass" class="size-4 shrink-0 text-faint" />
                <ComboboxInput
                  id="rocha"
                  v-model="term"
                  :placeholder="text.searchPlaceholder"
                  autocomplete="off"
                  class="h-full flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-faint" />
              </ComboboxAnchor>
              <ComboboxPortal>
                <ComboboxContent
                  position="popper"
                  :side-offset="6"
                  class="pop z-60 max-h-72 w-(--reka-combobox-trigger-width) overflow-hidden rounded-2xl border border-line-strong bg-rocha-2 shadow-float">
                  <ComboboxViewport class="max-h-72 overflow-y-auto p-1.5">
                    <ComboboxEmpty class="p-3 text-[0.8125rem] text-muted">{{
                      text.noRock
                    }}</ComboboxEmpty>
                    <ComboboxItem
                      v-for="item in matches"
                      :key="item.n"
                      :value="item.n"
                      class="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-[0.875rem] outline-none data-highlighted:bg-red data-highlighted:text-osso">
                      <span>{{ item.n }}</span>
                      <span class="text-right font-mono text-[0.6875rem] opacity-70"
                        >{{ CLASSES[item.cls].label }} · abras. {{ PT.abra[item.abra] }}</span
                      >
                    </ComboboxItem>
                  </ComboboxViewport>
                </ComboboxContent>
              </ComboboxPortal>
            </ComboboxRoot>

            <p class="mt-4 text-[0.75rem] text-faint">{{ text.common }}</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="name in COMMON_ROCKS"
                :key="name"
                type="button"
                :aria-pressed="rock?.n === name"
                class="h-9 rounded-full border px-3.5 text-[0.8125rem] font-medium transition-colors"
                :class="
                  rock?.n === name
                    ? 'border-red bg-red text-osso'
                    : 'border-line-strong text-fg/85 hover:border-fg/50'
                "
                @click="pickRock(findRock(name) as Rock)">
                {{ name }}
              </button>
            </div>
            <button
              v-if="!rock && !manual"
              type="button"
              class="mt-4 text-[0.8125rem] font-semibold text-red hover:underline"
              @click="setManual(true)">
              {{ text.manualLink }}
            </button>

            <Transition
              enter-active-class="transition duration-300 ease-out-quint"
              enter-from-class="-translate-y-2 opacity-0"
              leave-active-class="transition duration-150"
              leave-to-class="opacity-0">
              <div
                v-if="rock || manual"
                class="mt-4 flex flex-col gap-4 rounded-2xl border border-red/30 bg-red/8 p-4">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <p class="display text-[1.5rem] leading-none">{{ rock?.n ?? text.unlisted }}</p>
                  <span
                    class="rounded-full border border-line-strong px-2.5 py-1 text-[0.6875rem] text-muted">
                    {{ rock ? (rock.dt ? text.listed : text.analogy) : text.unlistedTag }}
                  </span>
                </div>

                <p v-if="rock && !manual" class="flex gap-2 text-[0.8125rem] text-fg/85">
                  <Icon name="ph:pencil-simple-line" class="mt-0.5 size-4 shrink-0 text-red" />
                  {{ text.editHint }}
                </p>

                <p v-if="rock?.variable && !manual" class="flex gap-2 text-[0.8125rem] text-fg/85">
                  <Icon name="ph:warning" class="mt-0.5 size-4 shrink-0 text-red" />
                  {{ text.variable }}
                </p>

                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-[0.75rem] text-muted">{{ text.hardness }}</p>
                    <p v-if="hardnessClass" class="text-[1.0625rem] font-semibold">
                      {{ CLASSES[hardnessClass].label }} · Mohs {{ fmtBR(hardnessValue ?? 0) }}
                    </p>
                    <p class="font-mono text-[0.6875rem] text-faint">
                      {{ manual ? text.manual : text.auto }}
                    </p>
                  </div>
                  <button
                    v-if="rock"
                    type="button"
                    :aria-pressed="manual"
                    :title="manual ? text.relock : text.unlock"
                    class="flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[0.8125rem] font-semibold transition-colors"
                    :class="
                      manual
                        ? 'border-red bg-red text-osso'
                        : 'border-line-strong hover:border-fg/50'
                    "
                    @click="setManual(!manual)">
                    <Icon :name="manual ? 'ph:lock-open' : 'ph:lock'" class="size-4" />
                    {{ manual ? text.manualOn : text.edit }}
                  </button>
                </div>

                <template v-if="manual">
                  <p
                    role="alert"
                    class="rounded-xl border border-red/50 bg-furo/60 px-3 py-2.5 text-[0.8125rem] text-fg/90">
                    <b>{{ text.warnTitle }}</b> {{ rock ? text.warnText : text.warnTextNoRock }}
                    <button
                      type="button"
                      class="ml-1 font-semibold text-red hover:underline"
                      @click="setManual(false)">
                      {{ rock ? text.relock : text.cancel }}
                    </button>
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="(info, key) in CLASSES"
                      :key="key"
                      type="button"
                      :aria-pressed="hardnessClass === key"
                      class="h-9 rounded-full border px-3 text-[0.8125rem] font-medium transition-colors"
                      :class="
                        hardnessClass === key
                          ? 'border-red bg-red text-osso'
                          : 'border-line-strong text-fg/85 hover:border-fg/50'
                      "
                      @click="manualH = info.H">
                      {{ info.label }}
                    </button>
                  </div>
                  <SliderRoot
                    v-model="slider"
                    :min="1.5"
                    :max="10"
                    :step="0.1"
                    class="relative flex h-6 touch-none items-center select-none">
                    <SliderTrack
                      class="relative h-1.5 grow overflow-hidden rounded-full bg-[linear-gradient(90deg,#3a3a40,#fe0018)]">
                      <SliderRange class="absolute h-full" />
                    </SliderTrack>
                    <SliderThumb
                      class="block size-6 rounded-full border-4 border-rocha bg-osso shadow-float transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-red"
                      aria-label="Dureza de perfuração (Mohs)" />
                  </SliderRoot>
                  <p v-if="hardnessClass" class="text-[0.75rem] text-muted">
                    {{ text.examples }} {{ CLASSES[hardnessClass].ex }}
                  </p>
                </template>

                <MatrizSegmented
                  v-model="abraLabel"
                  :label="`${text.abrasion} ${abraNote}`"
                  :options="Object.values(ABRA_LABELS)" />
                <MatrizSegmented
                  v-model="grainLabel"
                  :label="`${text.grain} ${grainNote}`"
                  :options="Object.values(GRAIN_LABELS)" />
              </div>
            </Transition>
          </div>

          <div class="h-px bg-line" />

          <!-- 2. Diâmetro -->
          <div>
            <p class="flex items-center gap-3">
              <span
                class="flex size-7 items-center justify-center rounded-lg font-mono text-[0.8125rem] font-semibold"
                :class="size ? 'bg-fg/10 text-fg' : 'bg-red text-osso'">
                <Icon v-if="size" name="ph:check-bold" class="size-3.5" />
                <template v-else>2</template>
              </span>
              <span class="text-title font-semibold">{{ text.step2 }}</span>
            </p>
            <MatrizSegmented v-model="size" class="mt-4" :label="text.diameter" :options="SIZES" />
          </div>

          <div class="h-px bg-line" />

          <!-- 3. Testemunho -->
          <div>
            <p id="testemunho" class="flex items-center gap-3">
              <span
                class="flex size-7 items-center justify-center rounded-lg font-mono text-[0.8125rem] font-semibold"
                :class="cond ? 'bg-fg/10 text-fg' : 'bg-red text-osso'">
                <Icon v-if="cond" name="ph:check-bold" class="size-3.5" />
                <template v-else>3</template>
              </span>
              <span class="text-title font-semibold">{{ text.step3 }}</span>
            </p>
            <RadioGroupRoot
              v-model="cond"
              aria-labelledby="testemunho"
              class="mt-4 grid gap-2 sm:grid-cols-3">
              <RadioGroupItem
                v-for="option in conditions"
                :key="option.value"
                :value="option.value"
                class="flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors data-[state=checked]:border-red data-[state=checked]:bg-red/10 data-[state=unchecked]:border-line-strong data-[state=unchecked]:hover:border-fg/50 sm:flex-col sm:items-start">
                <svg
                  viewBox="0 0 58 30"
                  fill="currentColor"
                  class="h-7 w-14 shrink-0"
                  :class="cond === option.value ? 'text-red' : 'text-fg/60'"
                  aria-hidden="true">
                  <rect
                    v-if="option.value === 'compacta'"
                    x="2"
                    y="9"
                    width="54"
                    height="12"
                    rx="3" />
                  <template v-else-if="option.value === 'fraturada'">
                    <path d="M4 9h13l3 12H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
                    <path d="M21 9h13l-3 12h-7z" />
                    <path d="M38 9h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H35z" />
                  </template>
                  <template v-else>
                    <rect x="3" y="12" width="9" height="8" rx="2.5" />
                    <rect x="15" y="9" width="7" height="6" rx="2" />
                    <circle cx="20" cy="20" r="2" />
                    <rect x="26" y="13" width="8" height="7" rx="2.5" />
                    <circle cx="38" cy="11" r="2.2" />
                    <circle cx="41" cy="19" r="2.8" />
                    <rect x="46" y="12" width="6" height="5" rx="2" />
                    <circle cx="54" cy="19" r="1.8" />
                  </template>
                </svg>
                <span>
                  <span class="block text-[0.9375rem] font-semibold">{{ option.title }}</span>
                  <span class="block text-[0.75rem] text-muted">{{ option.lede }}</span>
                </span>
              </RadioGroupItem>
            </RadioGroupRoot>
          </div>

          <div class="h-px bg-line" />

          <!-- 4. Local da sondagem -->
          <div>
            <p class="flex items-center gap-3">
              <span
                class="flex size-7 items-center justify-center rounded-lg font-mono text-[0.8125rem] font-semibold"
                :class="municipio ? 'bg-fg/10 text-fg' : 'bg-red text-osso'">
                <Icon v-if="municipio" name="ph:check-bold" class="size-3.5" />
                <template v-else>4</template>
              </span>
              <span class="text-title font-semibold">{{ text.step4 }}</span>
            </p>
            <p class="mt-2 text-[0.875rem] text-muted">{{ text.step4Lede }}</p>
            <div class="mt-4 grid gap-2 sm:grid-cols-[11rem_1fr]">
              <label for="uf" class="sr-only">{{ text.uf }}</label>
              <select
                id="uf"
                v-model="uf"
                class="h-12 rounded-xl border border-line-strong bg-furo/60 px-3 text-[0.9375rem] outline-none focus:border-red focus:ring-4 focus:ring-red/20">
                <option value="" disabled class="bg-rocha">{{ text.uf }}</option>
                <option v-for="item in UFS" :key="item.sigla" :value="item.sigla" class="bg-rocha">
                  {{ item.sigla }} · {{ item.nome }}
                </option>
              </select>
              <label for="cidade" class="sr-only">{{ text.city }}</label>
              <ComboboxRoot
                v-model="municipio"
                v-model:open="cityOpen"
                ignore-filter
                :reset-search-term-on-blur="false"
                :disabled="!uf"
                class="relative">
                <ComboboxAnchor
                  class="flex h-12 items-center gap-2 rounded-xl border border-line-strong bg-furo/60 px-4 focus-within:border-red focus-within:ring-4 focus-within:ring-red/20 data-disabled:opacity-50">
                  <Icon name="ph:map-pin" class="size-4 shrink-0 text-faint" />
                  <ComboboxInput
                    id="cidade"
                    v-model="cityTerm"
                    :display-value="cityLabel"
                    :placeholder="uf ? text.cityPlaceholder : text.cityFirst"
                    autocomplete="off"
                    class="h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-faint" />
                </ComboboxAnchor>
                <ComboboxPortal>
                  <ComboboxContent
                    position="popper"
                    :side-offset="6"
                    class="pop z-60 max-h-72 w-(--reka-combobox-trigger-width) overflow-hidden rounded-2xl border border-line-strong bg-rocha-2 shadow-float">
                    <ComboboxViewport class="max-h-72 overflow-y-auto p-1.5">
                      <ComboboxEmpty class="p-3 text-[0.8125rem] text-muted">{{
                        text.noCity
                      }}</ComboboxEmpty>
                      <ComboboxItem
                        v-for="item in cityMatches"
                        :key="item.codigo"
                        :value="String(item.codigo)"
                        class="cursor-pointer rounded-xl px-3 py-2 text-[0.875rem] outline-none data-highlighted:bg-red data-highlighted:text-osso">
                        {{ item.nome }}
                      </ComboboxItem>
                    </ComboboxViewport>
                  </ComboboxContent>
                </ComboboxPortal>
              </ComboboxRoot>
            </div>
            <p class="mt-2 text-[0.75rem] text-faint">{{ text.step4Privacy }}</p>
          </div>

          <div>
            <Btn
              type="submit"
              size="lg"
              :variant="answered < 4 || fresh ? 'ghost' : 'red'"
              :loading="loading"
              :disabled="answered < 4 || loading"
              :icon="fresh ? 'ph:check-bold' : 'ph:diamond'"
              class="w-full">
              {{ goLabel }}
            </Btn>
            <p v-if="fresh" class="mt-2 text-center text-[0.75rem] text-faint" aria-live="polite">
              {{ text.readyNote }}
            </p>
          </div>
        </form>

        <div ref="resultEl" class="flex flex-col gap-4 lg:sticky lg:top-24">
          <p
            v-if="stale"
            role="status"
            class="rounded-2xl border border-red/50 bg-red/10 px-4 py-3 text-[0.875rem] text-fg/90">
            {{ text.stale }}
          </p>
          <Transition
            mode="out-in"
            enter-active-class="transition duration-500 ease-out-quint"
            enter-from-class="translate-y-6 opacity-0 blur-sm"
            leave-active-class="transition duration-200"
            leave-to-class="opacity-0">
            <MatrizCoroa
              v-if="result"
              :key="result.uid"
              :data="result"
              editable
              :class="stale ? 'pointer-events-none opacity-40 grayscale' : ''"
              :aria-hidden="stale"
              @canal="(recomendacao) => (result = recomendacao)">
              <template #actions>
                <Btn variant="ghost" icon="ph:link" @click="share">{{ text.copy }}</Btn>
              </template>
              <template #feedback>
                <MatrizAvaliacao :data="result" @avaliada="evaluated" />
              </template>
            </MatrizCoroa>
            <div
              v-else
              class="relative flex min-h-[28rem] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-dashed border-line-strong p-8 text-center">
              <div
                aria-hidden="true"
                class="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgb(254_0_24/0.1),transparent_60%)]" />
              <svg
                :viewBox="MARK_VIEWBOX"
                class="relative h-20 w-auto text-red/80"
                aria-hidden="true">
                <path fill="currentColor" :d="MARK_PATH" />
              </svg>
              <p class="relative mt-6 display text-[2rem] leading-none">{{ text.empty }}</p>
              <p class="relative mt-3 max-w-sm text-[0.9375rem] text-muted">{{ text.emptyLede }}</p>
              <ul class="relative mt-6 flex flex-col gap-2 text-left text-[0.875rem]">
                <li
                  v-for="(item, index) in text.emptyItems"
                  :key="item"
                  class="flex items-center gap-2"
                  :class="
                    [hardnessValue !== null, Boolean(size), Boolean(cond), Boolean(municipio)][
                      index
                    ]
                      ? 'text-fg'
                      : 'text-faint'
                  ">
                  <Icon
                    :name="
                      [hardnessValue !== null, Boolean(size), Boolean(cond), Boolean(municipio)][
                        index
                      ]
                        ? 'ph:check-circle-fill'
                        : 'ph:circle'
                    "
                    class="size-4 text-red" />
                  {{ item }}
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>

      <div class="mx-auto mt-6 grid max-w-[90rem] gap-6 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal class="rounded-[2rem] border border-line bg-rocha p-6 sm:p-8">
          <h2 class="display text-[2rem] leading-none">{{ text.tipsTitle }}</h2>
          <ul class="mt-5 flex flex-col gap-3">
            <li v-for="tip in tips" :key="tip" class="flex gap-3 text-[0.9375rem] text-fg/85">
              <Icon name="ph:lightning-fill" class="mt-1 size-4 shrink-0 text-red" />
              {{ tip }}
            </li>
          </ul>
        </Reveal>

        <Reveal :delay="0.08" class="rounded-[2rem] border border-line bg-rocha p-6 sm:p-8">
          <h2 class="display text-[2rem] leading-none">{{ text.faqTitle }}</h2>
          <AccordionRoot type="single" collapsible class="mt-4">
            <AccordionItem
              v-for="item in faq"
              :key="item.q"
              :value="item.q"
              class="border-b border-line last:border-b-0">
              <AccordionHeader>
                <AccordionTrigger
                  class="group flex w-full items-center justify-between gap-4 py-4 text-left text-[0.9375rem] font-semibold">
                  {{ item.q }}
                  <Icon
                    name="ph:plus"
                    class="size-4 shrink-0 text-red transition-transform duration-300 group-data-[state=open]:rotate-45" />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent class="fold">
                <p class="pb-4 text-[0.9375rem] text-muted">{{ item.a }}</p>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </Reveal>
      </div>
    </section>

    <MatrizGate v-model:open="gate" @entered="entered" />
  </div>
</template>
