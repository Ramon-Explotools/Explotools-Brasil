interface Channel {
  id: string
  name: string
  handle: string
  href: string
  icon: string
}

interface Category {
  id: string
  name: string
  short: string
  description: string
  icon: string
  photos: number[]
}

interface Photo {
  id: number
  src: string
  title: string
  category: string
  sheet: boolean
}

interface Principle {
  title: string
  accent: string
  suffix: string
  description: string
}

interface Step {
  icon: string
  title: string
  description: string
}

interface Country {
  name: string
  lat: number
  lon: number
  home?: boolean
}

interface Catalog {
  id: string
  title: string
  description: string
  cover: string
  banner: string
  pdf: string
  badge?: string
}

const brand = {
  name: 'Explotools Brasil',
  short: 'Explotools',
  tagline: 'Ferramentas para sondagem',
  promise: 'Qualidade de importado a preço nacional',
  email: 'ramoncuri@explotools.com.br',
  whatsapp: 'https://wa.link/c1di0k',
  // Mesmo número do wa.link; o wa.me aceita mensagem pronta (cotação da coroa).
  whatsappPhone: '5521989292111',
  instagram: 'https://www.instagram.com/explotools.brasil',
  diameters: ['BO', 'NO', 'NO2', 'HO', 'PO'],
}

const channels: Channel[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    handle: 'Atendimento direto com um especialista',
    href: brand.whatsapp,
    icon: 'simple-icons:whatsapp',
  },
  {
    id: 'email',
    name: 'E-mail',
    handle: brand.email,
    href: `mailto:${brand.email}`,
    icon: 'ph:envelope-simple',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@explotools.brasil',
    href: brand.instagram,
    icon: 'simple-icons:instagram',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@explotools.brasil',
    href: 'https://www.tiktok.com/@explotools.brasil',
    icon: 'simple-icons:tiktok',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'Perfil corporativo',
    href: 'https://www.linkedin.com/in/explotools-brasil-b6ba58273',
    icon: 'simple-icons:linkedin',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Página oficial',
    href: 'https://www.facebook.com/share/p1veqrfSK8BVwVUU/?mibextid=qi2Omg',
    icon: 'simple-icons:facebook',
  },
  {
    id: 'maps',
    name: 'Google Maps',
    handle: 'Como chegar',
    href: 'https://maps.app.goo.gl/FGUcQ1ZqUXyxKMsT8',
    icon: 'simple-icons:googlemaps',
  },
]

const categories: Category[] = [
  {
    id: 'overshots',
    name: 'Overshots',
    short: 'Recuperação de testemunho',
    description: 'Para recuperação de testemunho com precisão e confiabilidade.',
    icon: 'ph:anchor-simple',
    photos: [31, 6, 30, 8, 25],
  },
  {
    id: 'cabecotes',
    name: 'Cabeçotes',
    short: 'Operação contínua',
    description: 'Travam o tubo interno no barrilete e sinalizam o bloqueio do testemunho.',
    icon: 'ph:gauge',
    photos: [32, 10, 33, 34, 28, 7, 18, 3, 29, 20, 26],
  },
  {
    id: 'molas',
    name: 'Molas e caixas de mola',
    short: 'Captura de testemunho',
    description:
      'Componentes críticos para captura de testemunho, fabricados com controle rigoroso de tolerância.',
    icon: 'ph:spiral',
    photos: [35, 36, 23, 24, 27],
  },
  {
    id: 'cabecas-dagua',
    name: 'Cabeças d’água',
    short: 'Alta pressão',
    description: 'Vedação e desempenho para operação contínua em alta pressão.',
    icon: 'ph:drop',
    photos: [37, 38, 21, 39, 40, 41],
  },
  {
    id: 'cortadores',
    name: 'Cortadores de hastes e revestimentos',
    short: 'Corte limpo',
    description: 'Corte limpo, resistência ao desgaste e vida útil prolongada.',
    icon: 'ph:scissors',
    photos: [42, 43, 11, 16],
  },
  {
    id: 'bombas',
    name: 'Peças para bombas d’água',
    short: 'Manutenção em campo',
    description: 'Kits e componentes para manutenção rápida em campo.',
    icon: 'ph:wrench',
    photos: [44, 2, 45, 46, 47, 5, 4, 48, 17],
  },
  {
    id: 'acessorios',
    name: 'Acessórios de sondagem',
    short: 'Consumíveis',
    description: 'Manga trava, barriletes, adaptadores e demais itens consumíveis de operação.',
    icon: 'ph:toolbox',
    photos: [49, 50, 12, 1, 51, 52, 53],
  },
]

const titles: Record<number, string> = {
  1: 'Adaptadores',
  2: 'Componentes da bomba d’água 435',
  3: 'Bucha indicadora de chegada',
  4: 'Cilindro cerâmico',
  5: 'Cup 435',
  6: 'Destorcedor',
  7: 'Caixa do tubo de retração',
  8: 'Lifting dog',
  10: 'Cabeçote HO montado',
  11: 'Navalhas',
  12: 'Anel estabilizador de bronze',
  18: 'Corpo inferior',
  20: 'Arruela Nord-Lock',
  21: 'Gaxetas',
  23: 'Caixa de mola',
  24: 'Mola cesto',
  25: 'Telegrama',
  26: 'Molas do kit furo seco',
  27: 'Molas',
  28: 'Ponta e base do arpão',
  29: 'Válvulas interruptoras de fluido',
  30: 'Luva de segurança',
  31: 'Catálogo · Overshot HO',
  32: 'Catálogo · Cabeçote HO',
  33: 'Ponta do arpão',
  34: 'Válvulas interruptoras de fluido',
  35: 'Catálogo · Caixa de mola, mola e anel trava',
  36: 'Caixa de mola, mola e anel trava',
  37: 'Catálogo · Cabeça d’água K-25.000',
  38: 'Cabeça d’água K-25.000',
  39: 'Porta-gaxeta de bronze',
  40: 'Eixo',
  41: 'Rolamento axial',
  42: 'Catálogo · Cortador HW/HWT',
  43: 'Cortador de revestimento HW/HWT',
  44: 'Catálogo · Bomba d’água 435',
  45: 'Pistão de bronze',
  46: 'Copos',
  47: 'Assento de válvula',
  48: 'Juntas de cobre',
  49: 'Catálogo · Barrilete HO',
  50: 'Manga trava',
  51: 'Chaves',
  52: 'Armador de tubos partidos',
  53: 'Stuffing box AW',
}

// Páginas do catálogo geral: abrem cada conjunto e aparecem inteiras, sem corte.
const sheets = new Set([31, 32, 35, 37, 42, 44, 49])

const photos: Photo[] = categories.flatMap((category) =>
  category.photos.map((id) => ({
    id,
    src: `/produtos/${id}.webp`,
    title: titles[id] ?? category.name,
    category: category.id,
    sheet: sheets.has(id),
  })),
)

function photoById(id: number): Photo {
  return photos.find((photo) => photo.id === id) ?? pick(photos, 0)
}

const principles: Principle[] = [
  {
    title: 'Foco no',
    accent: 'cliente',
    suffix: '',
    description:
      'Interesse genuíno na produtividade de quem opera. Acompanhamento próximo, pós-venda ativo e atendimento que não desaparece depois da venda.',
  },
  {
    title: 'Excelência e',
    accent: 'qualidade',
    suffix: 'de ponta a ponta',
    description:
      'Nada “meia-boca”: qualidade no produto, no processo e no atendimento. Cada peça que sai da fábrica carrega a nossa reputação.',
  },
  {
    title: 'Inovação e',
    accent: 'melhoria contínua',
    suffix: '',
    description:
      'Testamos rápido, paramos o que não funciona e escalamos o que funciona. Ouvimos o campo para evoluir o portfólio.',
  },
  {
    title: 'Tecnologia como',
    accent: 'ferramenta',
    suffix: 'não como discurso',
    description:
      'Usamos IA, automação e dados para atender mais rápido, prever demanda e entregar cotação no mesmo dia.',
  },
]

const quality: Step[] = [
  {
    icon: 'ph:stack',
    title: 'Matéria-prima selecionada',
    description: 'Insumos de origem rastreada para cada lote.',
  },
  {
    icon: 'ph:crosshair-simple',
    title: 'Usinagem de precisão',
    description: 'Tolerâncias controladas em cada etapa.',
  },
  {
    icon: 'ph:clipboard-text',
    title: 'Testes funcionais',
    description: 'Validação antes da liberação de cada lote.',
  },
  {
    icon: 'ph:package',
    title: 'Embalagem e expedição',
    description: 'Padrão que protege o produto até o campo.',
  },
]

const countries: Country[] = [
  { name: 'Brasil', lat: -15.8, lon: -47.9, home: true },
  { name: 'Chile', lat: -33.4, lon: -70.6, home: true },
  { name: 'México', lat: 19.4, lon: -99.1 },
  { name: 'Argentina', lat: -34.6, lon: -58.4 },
  { name: 'Peru', lat: -12, lon: -77 },
  { name: 'Bolívia', lat: -16.5, lon: -68.1 },
  { name: 'Colômbia', lat: 4.7, lon: -74.1 },
]

const catalogs: Catalog[] = [
  {
    id: '2025',
    badge: 'Novo',
    title: 'Catálogo de produtos 2025',
    description: 'Linha atualizada de ferramentas Explotools.',
    cover: '/catalogos/capas/catalogo2025foto.webp',
    banner: '/catalogos/capas/catalogo2025foto2.webp',
    pdf: '/catalogos/catalogo2025.pdf',
  },
  {
    id: 'reparo',
    title: 'Kits de reparo',
    description: 'Kits completos para manutenção em campo.',
    cover: '/catalogos/capas/catalogo1foto.webp',
    banner: '/catalogos/capas/catalogo1foto2.webp',
    pdf: '/catalogos/catalogo1.pdf',
  },
  {
    id: 'cabecote',
    title: 'Cabeçote e overshot',
    description: 'Conjuntos e peças de reposição para recuperação de testemunho.',
    cover: '/catalogos/capas/catalogo2foto.webp',
    banner: '/catalogos/capas/catalogo2foto2.webp',
    pdf: '/catalogos/catalogo2.pdf',
  },
  {
    id: 'mordentes',
    title: 'Mordentes',
    description: 'Mordentes para operação em campo.',
    cover: '/catalogos/capas/catalogo3foto.webp',
    banner: '/catalogos/capas/catalogo3foto2.webp',
    pdf: '/catalogos/catalogo3.pdf',
  },
]

const leadPhotos = Array.from({ length: 8 }, (_, index) => `/lead/foto${index + 1}.webp`)

export type { Catalog, Category, Channel, Country, Photo, Principle, Step }
export {
  brand,
  catalogs,
  categories,
  channels,
  countries,
  leadPhotos,
  photoById,
  photos,
  principles,
  quality,
}
