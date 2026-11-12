<script setup lang="ts">
  definePageMeta({ layout: 'bare' })

  type SortKey =
    | 'nome'
    | 'email'
    | 'empresa'
    | 'cargo'
    | 'createdAt'
    | 'lastAccess'
    | 'recomendacoes'

  const text = {
    title: 'Painel',
    panel: 'Painel administrativo',
    logout: 'Sair',
    leads: 'Leads',
    users: 'Usuários',
    map: 'Mapa',
    total: 'Leads cadastrados',
    wireline: 'Trabalham com wireline',
    recs: 'Recomendações geradas',
    recent: 'Novos nos últimos 30 dias',
    search: 'Buscar por nome, e-mail, empresa…',
    all: 'Todos',
    yes: 'Sim',
    no: 'Não',
    add: 'Adicionar lead',
    export: 'Baixar planilha',
    empty: 'Nenhum lead encontrado.',
    emptyHint: 'Ajuste a busca ou adicione um lead.',
    noRecs: 'Este lead ainda não gerou recomendações.',
    open: 'Abrir',
    edit: 'Editar lead',
    remove: 'Excluir lead',
    removeTitle: 'Excluir lead?',
    removeText: 'O cadastro e todas as recomendações dele serão apagados. Não dá para desfazer.',
    page: 'Página',
    of: 'de',
    previous: 'Página anterior',
    next: 'Próxima página',
    addUser: 'Novo usuário',
    usersLede: 'Quem pode entrar no painel. Só administradores criam novos acessos.',
    you: 'Você',
    since: 'Desde',
    removeUser: 'Excluir usuário',
    removeUserTitle: 'Excluir usuário?',
    removeUserText: 'Essa pessoa perde o acesso ao painel imediatamente.',
    site: 'Ver site',
  }

  const columns: { key: SortKey; label: string; hide?: string }[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'empresa', label: 'Empresa', hide: 'hidden md:table-cell' },
    { key: 'cargo', label: 'Cargo', hide: 'hidden xl:table-cell' },
    { key: 'createdAt', label: 'Cadastro', hide: 'hidden lg:table-cell' },
    { key: 'lastAccess', label: 'Último acesso', hide: 'hidden 2xl:table-cell' },
    { key: 'recomendacoes', label: 'Recom.' },
  ]

  useHead({ title: text.title })
  useSeoMeta({ robots: 'noindex' })

  const { user, clear: clearSession } = useUserSession()
  const toast = useToast()

  const { data: leads, refresh: refreshLeads } = await useFetch<LeadRow[]>('/api/leads', {
    default: () => [],
  })
  const { data: admins, refresh: refreshAdmins } = await useFetch<AdminRow[]>('/api/admins', {
    default: () => [],
  })

  const tab = ref('leads')
  const search = ref('')
  const wirelineFilter = ref<'todos' | 'sim' | 'nao'>('todos')
  const sort = ref<{ key: SortKey; dir: 1 | -1 }>({ key: 'createdAt', dir: -1 })
  const page = ref(1)
  const perPage = 12
  const expanded = ref<string | null>(null)

  const stats = computed(() => {
    const month = Date.now() - 30 * 24 * 60 * 60 * 1000
    return [
      { label: text.total, value: leads.value.length, icon: 'ph:users-three' },
      {
        label: text.wireline,
        value: leads.value.filter((lead) => lead.wireline).length,
        icon: 'ph:drop-half-bottom',
      },
      {
        label: text.recs,
        value: leads.value.reduce((sum, lead) => sum + lead.recomendacoes.length, 0),
        icon: 'ph:diamond',
      },
      {
        label: text.recent,
        value: leads.value.filter((lead) => new Date(lead.createdAt).getTime() > month).length,
        icon: 'ph:trend-up',
      },
    ]
  })

  function valueOf(lead: LeadRow, key: SortKey): string | number {
    return key === 'recomendacoes' ? lead.recomendacoes.length : (lead[key] ?? '').toLowerCase()
  }

  const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()
    return leads.value
      .filter((lead) => {
        if (wirelineFilter.value === 'sim' && lead.wireline !== true) return false
        if (wirelineFilter.value === 'nao' && lead.wireline !== false) return false
        if (!term) return true
        return [lead.nome, lead.email, lead.empresa, lead.cargo, lead.telefone].some((field) =>
          field.toLowerCase().includes(term),
        )
      })
      .toSorted((a, b) => {
        const left = valueOf(a, sort.value.key)
        const right = valueOf(b, sort.value.key)
        if (left === right) return 0
        return left > right ? sort.value.dir : -sort.value.dir
      })
  })

  const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
  const rows = computed(() =>
    filtered.value.slice((page.value - 1) * perPage, page.value * perPage),
  )

  watch([search, wirelineFilter], () => {
    page.value = 1
  })

  function sortBy(key: SortKey): void {
    sort.value =
      sort.value.key === key ? { key, dir: sort.value.dir === 1 ? -1 : 1 } : { key, dir: 1 }
  }

  const leadDialog = ref(false)
  const editing = ref<LeadRow | null>(null)
  const removing = ref<LeadRow | null>(null)
  const removingAdmin = ref<AdminRow | null>(null)
  const adminDialog = ref(false)
  const busy = ref(false)

  function create(): void {
    editing.value = null
    leadDialog.value = true
  }

  function edit(lead: LeadRow): void {
    editing.value = lead
    leadDialog.value = true
  }

  const confirmLead = computed({
    get: () => removing.value !== null,
    set: (value: boolean) => {
      if (!value) removing.value = null
    },
  })

  const confirmAdmin = computed({
    get: () => removingAdmin.value !== null,
    set: (value: boolean) => {
      if (!value) removingAdmin.value = null
    },
  })

  async function removeLead(): Promise<void> {
    if (!removing.value) return
    busy.value = true
    try {
      toast.success(await $fetch(`/api/leads/${removing.value._id}`, { method: 'DELETE' }))
      removing.value = null
      await refreshLeads()
    } catch (error) {
      toast.fail(error)
    } finally {
      busy.value = false
    }
  }

  async function removeAdmin(): Promise<void> {
    if (!removingAdmin.value) return
    busy.value = true
    try {
      toast.success(await $fetch(`/api/admins/${removingAdmin.value._id}`, { method: 'DELETE' }))
      removingAdmin.value = null
      await refreshAdmins()
    } catch (error) {
      toast.fail(error)
    } finally {
      busy.value = false
    }
  }

  async function logout(): Promise<void> {
    await clearSession()
    await navigateTo('/login')
  }
</script>

<template>
  <div class="min-h-dvh">
    <header class="sticky top-0 z-40 border-b border-line glass">
      <div class="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-4 px-4 sm:px-6">
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="text-[1.125rem]" :aria-label="text.site"><Logo /></NuxtLink>
          <span class="hidden h-6 w-px bg-line-strong sm:block" />
          <span class="hidden label text-faint sm:block">{{ text.panel }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="hidden max-w-56 truncate text-[0.8125rem] text-muted md:block">{{
            user?.email
          }}</span>
          <button
            type="button"
            class="flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-[0.8125rem] font-semibold transition-colors hover:border-red hover:text-red"
            @click="logout">
            <Icon name="ph:sign-out" class="size-4" />
            {{ text.logout }}
          </button>
        </div>
      </div>
    </header>

    <div class="mx-auto max-w-[100rem] px-4 py-8 sm:px-6">
      <TabsRoot v-model="tab">
        <TabsList class="relative inline-flex gap-1 rounded-full border border-line bg-rocha p-1">
          <TabsTrigger
            v-for="option in [
              { value: 'leads', label: text.leads, icon: 'ph:address-book' },
              { value: 'users', label: text.users, icon: 'ph:shield-check' },
              { value: 'mapa', label: text.map, icon: 'ph:map-trifold' },
            ]"
            :key="option.value"
            :value="option.value"
            class="relative flex h-10 items-center gap-2 rounded-full px-5 text-[0.875rem] font-semibold transition-colors data-[state=active]:text-osso data-[state=inactive]:text-muted">
            <Motion
              v-if="tab === option.value"
              layout-id="adm-tab"
              class="absolute inset-0 rounded-full bg-red"
              :transition="{ type: 'spring', bounce: 0.2, duration: 0.45 }" />
            <Icon :name="option.icon" class="relative size-4" />
            <span class="relative">{{ option.label }}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" class="mt-8 outline-none">
          <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Motion
              v-for="(stat, index) in stats"
              :key="stat.label"
              class="rounded-3xl border border-line bg-rocha p-5"
              :initial="{ opacity: 0, y: 16 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ type: 'spring', bounce: 0, duration: 0.7, delay: index * 0.05 }">
              <Icon :name="stat.icon" class="size-5 text-red" />
              <p class="mt-4 display text-[3rem] leading-none">
                <Counter :to="stat.value" :duration="1" />
              </p>
              <p class="mt-1 text-[0.8125rem] text-muted">{{ stat.label }}</p>
            </Motion>
          </div>

          <div class="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div class="relative sm:w-80">
                <Icon
                  name="ph:magnifying-glass"
                  class="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-faint" />
                <input
                  v-model="search"
                  type="search"
                  :placeholder="text.search"
                  :aria-label="text.search"
                  class="h-11 w-full rounded-full border border-line-strong bg-rocha pr-4 pl-10 text-[0.875rem] outline-none placeholder:text-faint focus:border-red focus:ring-4 focus:ring-red/15" />
              </div>
              <RadioGroupRoot
                v-model="wirelineFilter"
                aria-label="Filtrar por wireline"
                class="inline-flex gap-1 rounded-full border border-line bg-rocha p-1">
                <span class="flex items-center px-3 label text-[0.625rem] text-faint"
                  >Wireline</span
                >
                <RadioGroupItem
                  v-for="option in [
                    { value: 'todos', label: text.all },
                    { value: 'sim', label: text.yes },
                    { value: 'nao', label: text.no },
                  ]"
                  :key="option.value"
                  :value="option.value"
                  class="h-9 rounded-full px-3.5 text-[0.8125rem] font-medium text-muted transition-colors data-[state=checked]:bg-fg data-[state=checked]:text-furo">
                  {{ option.label }}
                </RadioGroupItem>
              </RadioGroupRoot>
            </div>
            <div class="flex flex-wrap gap-2">
              <Btn variant="ghost" icon="ph:microsoft-excel-logo" to="/api/leads/export" external>{{
                text.export
              }}</Btn>
              <Btn icon="ph:user-plus" @click="create">{{ text.add }}</Btn>
            </div>
          </div>

          <div class="mt-5 overflow-hidden rounded-3xl border border-line bg-rocha">
            <table class="w-full text-left text-[0.875rem]">
              <thead class="border-b border-line">
                <tr>
                  <th class="w-12" />
                  <th
                    v-for="column in columns"
                    :key="column.key"
                    class="px-3 py-3 font-medium"
                    :class="column.hide">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 label text-[0.625rem] text-fg/60 transition-colors hover:text-fg"
                      @click="sortBy(column.key)">
                      {{ column.label }}
                      <Icon
                        :name="
                          sort.key === column.key
                            ? sort.dir === 1
                              ? 'ph:caret-up-fill'
                              : 'ph:caret-down-fill'
                            : 'ph:caret-up-down'
                        "
                        class="size-3"
                        :class="sort.key === column.key ? 'text-red' : ''" />
                    </button>
                  </th>
                  <th class="px-3 py-3 text-right label text-[0.625rem] text-fg/60">Wireline</th>
                  <th class="w-28" />
                </tr>
              </thead>
              <tbody>
                <template v-for="lead in rows" :key="lead._id">
                  <tr
                    class="border-b border-line transition-colors hover:bg-fg/[0.025]"
                    :class="expanded === lead._id ? 'bg-fg/[0.03]' : ''">
                    <td class="py-3 pl-3">
                      <button
                        type="button"
                        class="flex size-8 items-center justify-center rounded-full text-fg/60 hover:bg-fg/5 hover:text-fg"
                        :aria-expanded="expanded === lead._id"
                        :aria-label="`Recomendações de ${lead.nome}`"
                        @click="expanded = expanded === lead._id ? null : lead._id">
                        <Icon
                          name="ph:caret-down"
                          class="size-4 transition-transform duration-300"
                          :class="expanded === lead._id ? 'rotate-180' : ''" />
                      </button>
                    </td>
                    <td class="px-3 py-3">
                      <p class="font-semibold">{{ lead.nome }}</p>
                      <p class="text-[0.8125rem] text-muted">{{ lead.email }}</p>
                      <p class="text-[0.8125rem] text-faint">{{ lead.telefone }}</p>
                    </td>
                    <td class="hidden px-3 py-3 md:table-cell">{{ lead.empresa }}</td>
                    <td class="hidden px-3 py-3 text-muted xl:table-cell">{{ lead.cargo }}</td>
                    <td
                      class="hidden px-3 py-3 font-mono text-[0.8125rem] text-muted lg:table-cell">
                      {{ formatDate(lead.createdAt) }}
                    </td>
                    <td
                      class="hidden px-3 py-3 font-mono text-[0.8125rem] text-muted 2xl:table-cell">
                      {{ formatDate(lead.lastAccess) }}
                    </td>
                    <td class="px-3 py-3">
                      <span
                        class="inline-flex min-w-8 justify-center rounded-full bg-fg/8 px-2.5 py-1 font-mono text-[0.75rem]">
                        {{ lead.recomendacoes.length }}
                      </span>
                    </td>
                    <td class="px-3 py-3 text-right">
                      <span
                        class="rounded-full px-2.5 py-1 text-[0.75rem] font-semibold"
                        :class="
                          lead.wireline === true
                            ? 'bg-red/15 text-red'
                            : lead.wireline === false
                              ? 'bg-fg/8 text-fg/70'
                              : 'text-faint'
                        ">
                        {{
                          lead.wireline === true
                            ? text.yes
                            : lead.wireline === false
                              ? text.no
                              : '—'
                        }}
                      </span>
                    </td>
                    <td class="py-3 pr-3">
                      <div class="flex justify-end gap-1">
                        <button
                          type="button"
                          class="flex size-9 items-center justify-center rounded-full text-fg/60 hover:bg-fg/5 hover:text-fg"
                          :aria-label="text.edit"
                          @click="edit(lead)">
                          <Icon name="ph:pencil-simple" class="size-4" />
                        </button>
                        <button
                          type="button"
                          class="flex size-9 items-center justify-center rounded-full text-fg/60 hover:bg-red/10 hover:text-red"
                          :aria-label="text.remove"
                          @click="removing = lead">
                          <Icon name="ph:trash" class="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="expanded === lead._id" class="border-b border-line bg-furo/40">
                    <td :colspan="columns.length + 3" class="px-4 py-5 sm:px-14">
                      <p
                        v-if="!lead.recomendacoes.length"
                        class="flex items-center gap-2 text-[0.875rem] text-muted">
                        <Icon name="ph:info" class="size-4" />
                        {{ text.noRecs }}
                      </p>
                      <ol v-else class="relative flex flex-col gap-2 border-l border-red/40 pl-5">
                        <li
                          v-for="(rec, index) in lead.recomendacoes"
                          :key="rec.uid"
                          class="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-rocha px-4 py-3">
                          <span
                            class="absolute top-1/2 -left-[1.6rem] size-2.5 -translate-y-1/2 rounded-full bg-red ring-4 ring-furo" />
                          <div>
                            <p class="font-semibold">
                              {{ rec.rocha || `Recomendação ${index + 1}` }}
                            </p>
                            <p class="font-mono text-[0.75rem] text-muted">
                              {{ formatDate(rec.date) }}
                            </p>
                          </div>
                          <NuxtLink
                            :to="`/selecao-matriz/${rec.uid}`"
                            target="_blank"
                            class="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-4 text-[0.8125rem] font-semibold hover:border-red hover:text-red">
                            {{ text.open }}
                            <Icon name="ph:arrow-square-out" class="size-4" />
                          </NuxtLink>
                        </li>
                      </ol>
                    </td>
                  </tr>
                </template>
                <tr v-if="!rows.length">
                  <td :colspan="columns.length + 3" class="px-6 py-16 text-center">
                    <Icon name="ph:binoculars" class="mx-auto size-8 text-faint" />
                    <p class="mt-3 font-semibold">{{ text.empty }}</p>
                    <p class="mt-1 text-[0.875rem] text-muted">{{ text.emptyHint }}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-5 flex items-center justify-between gap-4 text-[0.875rem] text-muted">
            <span>{{ filtered.length }} {{ text.leads.toLowerCase() }}</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="flex size-10 items-center justify-center rounded-full border border-line-strong disabled:opacity-40"
                :disabled="page <= 1"
                :aria-label="text.previous"
                @click="page -= 1">
                <Icon name="ph:caret-left" class="size-4" />
              </button>
              <span class="font-mono tabular-nums"
                >{{ text.page }} {{ page }} {{ text.of }} {{ pages }}</span
              >
              <button
                type="button"
                class="flex size-10 items-center justify-center rounded-full border border-line-strong disabled:opacity-40"
                :disabled="page >= pages"
                :aria-label="text.next"
                @click="page += 1">
                <Icon name="ph:caret-right" class="size-4" />
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" class="mt-8 outline-none">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 class="display text-headline">{{ text.users }}</h2>
              <p class="mt-2 text-[0.9375rem] text-muted">{{ text.usersLede }}</p>
            </div>
            <Btn icon="ph:user-plus" @click="adminDialog = true">{{ text.addUser }}</Btn>
          </div>
          <ul class="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Motion
              v-for="(admin, index) in admins"
              :key="admin._id"
              as="li"
              class="flex items-center gap-4 rounded-3xl border border-line bg-rocha p-5"
              :initial="{ opacity: 0, y: 12 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ type: 'spring', bounce: 0, duration: 0.6, delay: index * 0.04 }">
              <span
                class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red/12 display text-[1.5rem] text-red ring-1 ring-red/30">
                {{ admin.email.charAt(0).toUpperCase() }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="flex items-center gap-2 truncate font-semibold">
                  {{ admin.email }}
                  <span
                    v-if="admin.self"
                    class="rounded-full bg-fg px-2 py-0.5 label text-[0.5625rem] text-furo"
                    >{{ text.you }}</span
                  >
                </p>
                <p class="mt-0.5 font-mono text-[0.75rem] text-muted">
                  {{ text.since }} {{ formatDate(admin.createdAt) }}
                </p>
              </div>
              <button
                v-if="!admin.self"
                type="button"
                class="flex size-10 shrink-0 items-center justify-center rounded-full text-fg/60 hover:bg-red/10 hover:text-red"
                :aria-label="text.removeUser"
                @click="removingAdmin = admin">
                <Icon name="ph:trash" class="size-4" />
              </button>
            </Motion>
          </ul>
        </TabsContent>

        <TabsContent value="mapa" class="mt-8 outline-none">
          <AdmMapa />
        </TabsContent>
      </TabsRoot>
    </div>

    <AdmLeadDialog v-model:open="leadDialog" :lead="editing" @saved="refreshLeads()" />
    <AdmAdminDialog v-model:open="adminDialog" @saved="refreshAdmins()" />
    <AdmConfirm
      v-model:open="confirmLead"
      :title="text.removeTitle"
      :description="text.removeText"
      :loading="busy"
      @confirm="removeLead" />
    <AdmConfirm
      v-model:open="confirmAdmin"
      :title="text.removeUserTitle"
      :description="text.removeUserText"
      :loading="busy"
      @confirm="removeAdmin" />
  </div>
</template>
