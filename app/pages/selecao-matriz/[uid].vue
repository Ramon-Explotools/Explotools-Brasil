<script setup lang="ts">
  import { brand } from '~/data/content'

  const text = {
    title: 'Recomendação de coroa',
    back: 'Fazer nova seleção',
    missing: 'Recomendação não encontrada.',
    missingLede: 'O link pode estar incompleto ou a recomendação foi removida.',
    talk: 'Falar com um especialista',
  }

  const route = useRoute()
  const uid = computed(() => String(route.params.uid ?? ''))
  const { data } = await useFetch<RecomendacaoMongo>(() => `/api/recomendacoes/${uid.value}`)
  const { user } = useUserSession()

  // Documentos antigos (matriz 1–9) continuam abrindo no formato antigo.
  const coroa = computed(() =>
    data.value && 'versao' in data.value && data.value.versao === 2 ? data.value : null,
  )
  const legada = computed(() =>
    data.value && !coroa.value ? (data.value as RecomendacaoLegada) : null,
  )
  const owner = computed(() => Boolean(coroa.value && user.value?.email === coroa.value.email))

  async function evaluated(resposta: AvaliacaoResposta): Promise<void> {
    data.value = resposta.recomendacao
    if (resposta.ajustada) await navigateTo(`/selecao-matriz/${resposta.ajustada.uid}`)
  }

  useHead({ title: () => (data.value?.rocha ? `${text.title} · ${data.value.rocha}` : text.title) })
  useSeoMeta({ robots: 'noindex' })
</script>

<template>
  <section class="relative min-h-dvh bg-furo pt-28 pb-20 sm:pt-32">
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgb(254_0_24/0.16)_0%,transparent_70%)]" />
    <div class="relative mx-auto max-w-5xl px-5 sm:px-8">
      <NuxtLink
        to="/selecao-matriz"
        class="inline-flex items-center gap-2 text-[0.875rem] font-semibold text-muted hover:text-fg">
        <Icon name="ph:arrow-left" class="size-4" />
        {{ text.back }}
      </NuxtLink>

      <Reveal v-if="coroa" class="mt-6">
        <MatrizCoroa
          :key="coroa.uid"
          :data="coroa"
          :editable="owner"
          @canal="(recomendacao) => (data = recomendacao)">
          <template v-if="owner" #feedback>
            <MatrizAvaliacao :data="coroa" @avaliada="evaluated" />
          </template>
        </MatrizCoroa>
      </Reveal>

      <Reveal v-else-if="legada" class="mt-6">
        <MatrizResult :data="legada">
          <template #actions>
            <Btn :to="brand.whatsapp" icon="simple-icons:whatsapp">{{ text.talk }}</Btn>
          </template>
        </MatrizResult>
      </Reveal>

      <div
        v-else
        class="mt-10 flex min-h-[50vh] flex-col items-center justify-center rounded-[2rem] border border-dashed border-line-strong p-10 text-center">
        <Icon name="ph:magnifying-glass-minus" class="size-10 text-red" />
        <p class="mt-5 display text-[2.5rem] leading-none">{{ text.missing }}</p>
        <p class="mt-3 text-muted">{{ text.missingLede }}</p>
        <Btn to="/selecao-matriz" class="mt-8" trailing="ph:arrow-right">{{ text.back }}</Btn>
      </div>
    </div>
  </section>
</template>
