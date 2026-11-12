<script setup lang="ts">
  import type { CrownRec, Problem } from '#shared/utils/matriz.engine'
  import { brand } from '~/data/content'

  const props = defineProps({
    data: { type: Object as PropType<RecomendacaoCoroa>, required: true },
  })

  const emit = defineEmits<{ avaliada: [resposta: AvaliacaoResposta] }>()

  const text = {
    title: 'Testou no furo? Conte como foi',
    lede: 'Depois de usar a coroa por alguns metros, observe o avanço e o desgaste. Volte aqui (ou abra pelo seu histórico) e responda. Se precisar, geramos a coroa ajustada na hora.',
    ok: 'Atendeu',
    adjust: 'Precisou ajustar',
    question: 'O que você viu no furo?',
    thanks:
      'Você avaliou esta coroa como Atendeu. Obrigado: isso ajuda a melhorar as recomendações.',
    adjusted: 'Você avaliou: precisou ajustar',
    adjustedChild: 'A coroa ajustada está salva no seu histórico.',
    adjustedTech: 'Para este caso, o técnico da Explotools orienta pelo WhatsApp.',
    savedOk: 'Obrigado! Sua avaliação ajuda a melhorar as recomendações.',
    savedAdjusted: 'Pronto! Geramos a coroa ajustada e salvamos no seu histórico.',
    tech: 'Abrimos o WhatsApp com o técnico da Explotools.',
  }

  const toast = useToast()
  const open = ref(false)
  const sending = ref(false)

  const rec = computed<CrownRec | null>(() => recommendCrown(inputFromEntrada(props.data.entrada)))
  const problems = computed(() => {
    const current = rec.value
    if (!current) return []
    return (Object.keys(PROBLEMS) as Problem[]).map((key) => ({
      key,
      label: PROBLEMS[key].label,
      action: problemAction(key, current),
    }))
  })
  const problem = computed(() => {
    const key = props.data.problema
    return key && key in PROBLEMS ? (key as Problem) : null
  })
  const problemLabel = computed(() =>
    problem.value ? PROBLEMS[problem.value].label.toLowerCase() : '',
  )
  // Sem ajuste possível na coroa, quem orienta é o técnico (não há coroa ajustada).
  const withChild = computed(() => {
    if (!rec.value || !problem.value) return false
    return !feedbackDeadEnd(rec.value, problem.value)
  })

  function talkToTech(key: Problem): void {
    if (!rec.value) return
    globalThis.open(
      `https://wa.me/${brand.whatsappPhone}?text=${encodeURIComponent(techText(rec.value, key))}`,
      '_blank',
      'noopener',
    )
  }

  async function send(status: 'atendeu' | 'ajustada', problema?: Problem): Promise<void> {
    if (sending.value) return
    sending.value = true
    try {
      const resposta = await $fetch<AvaliacaoResposta>(
        `/api/recomendacoes/${props.data.uid}/avaliacao`,
        { method: 'POST', body: { status, problema } },
      )
      if (status === 'atendeu') toast.success(text.savedOk)
      else if (resposta.ajustada) toast.success(text.savedAdjusted)
      else if (problema) {
        toast.info(text.tech)
        talkToTech(problema)
      }
      emit('avaliada', resposta)
    } catch (error) {
      toast.fail(error)
    } finally {
      sending.value = false
    }
  }
</script>

<template>
  <section class="rounded-[2rem] border border-line bg-rocha p-6 sm:p-8">
    <h3 class="display text-[1.75rem] leading-none">{{ text.title }}</h3>

    <p v-if="props.data.status === 'atendeu'" class="mt-4 flex gap-2 text-[0.9375rem] text-fg/90">
      <Icon name="ph:check-circle-fill" class="mt-0.5 size-5 shrink-0 text-red" />
      {{ text.thanks }}
    </p>

    <p v-else-if="props.data.status === 'ajustada'" class="mt-4 text-[0.9375rem] text-muted">
      {{ text.adjusted }}<template v-if="problemLabel"> — {{ problemLabel }}</template
      >.
      {{ withChild ? text.adjustedChild : text.adjustedTech }}
    </p>

    <template v-else>
      <p class="mt-3 text-[0.875rem] text-muted">{{ text.lede }}</p>
      <div class="mt-5 flex flex-wrap gap-3">
        <Btn icon="ph:check-bold" :loading="sending" @click="send('atendeu')">{{ text.ok }}</Btn>
        <Btn
          variant="ghost"
          icon="ph:wrench"
          :aria-expanded="open"
          aria-controls="problemas"
          @click="open = !open">
          {{ text.adjust }}
        </Btn>
      </div>

      <Transition
        enter-active-class="transition duration-300 ease-out-quint"
        enter-from-class="-translate-y-2 opacity-0"
        leave-active-class="transition duration-150"
        leave-to-class="opacity-0">
        <div v-if="open" id="problemas" class="mt-5 flex flex-col gap-2">
          <p class="label text-fg/60">{{ text.question }}</p>
          <button
            v-for="item in problems"
            :key="item.key"
            type="button"
            :disabled="sending"
            class="flex flex-col gap-1 rounded-2xl border border-line-strong bg-furo/40 px-4 py-3 text-left transition-colors hover:border-red focus-visible:border-red disabled:opacity-50"
            @click="send('ajustada', item.key)">
            <span class="text-[0.9375rem] font-semibold">{{ item.label }}</span>
            <span class="text-[0.8125rem] text-red">→ {{ item.action }}</span>
          </button>
        </div>
      </Transition>
    </template>
  </section>
</template>
