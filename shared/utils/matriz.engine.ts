/* ===========================================================================
   MOTOR DE SELEÇÃO DA COROA EXPLOTOOLS
   Escala de matrizes 1–15 da tabela técnica das coroas Explotools:
   1 = liga mais DURA (rocha mole, abrasiva, quebrada);
   15 = liga mais MACIA (rocha dura, de grão fino, competente, pouco abrasiva).
   A dureza de perfuração da rocha escolhe a faixa; abrasividade, condição do
   testemunho e granulometria ajustam dentro dela. Canal de água pelas regras
   escritas da mesma tabela; Turbo como opção de avanço em rocha dura e inteira.
   Mudanças técnicas: confirmar com o Rafael.
   =========================================================================== */
import { CLASSES, findRock } from './rochas'
import type { Abra, Grain, Rock, RockClass } from './rochas'

type Size = 'BO' | 'NO' | 'NO2' | 'HO' | 'PO'
type Cond = 'compacta' | 'fraturada' | 'friavel'
type Waterway = 'Standard' | 'Turbo' | 'Wide' | 'Lateral/Superflush'
type Priority = 'vida' | 'avanco'
type Problem = 'polindo' | 'desgaste' | 'lavando' | 'outro'

interface Matrix {
  id: string
  lo: number
  hi: number
}

interface Shift {
  why: string
  d: number
}

interface MatrixDecision {
  matrix: Matrix
  nominal: Matrix
  covering: Matrix[]
  shifts: Shift[]
  clamped: boolean
  brokenAbr: boolean
}

interface WaterwayChoice {
  type: Waterway
  options: Waterway[]
  reason: string
  note: string
  trigger: string
}

interface OpNumbers {
  rpmRange: [number, number]
  wobRange: [number, number]
  flowRange: [number, number]
}

interface Equivalents {
  bl: string
  hero: string
  heroByName: boolean
  dicorp: string
  dimatec: string
  hayden: string
  abr: string
}

interface CrownInput {
  rock?: Rock | null
  size?: Size | null
  cond?: Cond | null
  manualH?: number | null
  abra?: Abra | null
  grain?: Grain | null
  matrixShift?: number
  forceWaterway?: Waterway | null
  prefer?: Priority | null
}

interface CrownRec {
  H: number
  manual: boolean
  cls: RockClass
  rock: Rock | null
  abra: Abra
  grain: Grain
  size: Size
  cond: Cond
  matrix: Matrix
  baseMatrix: Matrix
  decision: MatrixDecision
  fieldShift: number
  atLimit: boolean
  waterway: WaterwayChoice
  prefer: Priority
  adjust: { up: string | null; down: string | null }
  ops: OpNumbers
  equiv: Equivalents
}

// Entrada salva no banco: dá para recalcular exatamente a mesma coroa.
interface Entrada {
  rocha: string | null
  durezaManual: number | null
  abrasividade: Abra | null
  diametro: Size
  testemunho: Cond
  ajusteMatriz: number
  canalForcado: Waterway | null
  prioridade: Priority | null
  granulometria: Grain | null
}

/* Faixa de dureza (Mohs de perfuração) coberta por cada matriz, medida no guia
   de seleção de matrizes. Ordem: liga mais dura → mais macia. */
const MATRICES: Matrix[] = [
  { id: '1', lo: 1.58, hi: 2.45 },
  { id: '2', lo: 2.02, hi: 2.92 },
  { id: '3', lo: 2.62, hi: 3.44 },
  { id: '4', lo: 2.77, hi: 4.15 },
  { id: '6', lo: 3.09, hi: 5.53 },
  { id: '7', lo: 3.95, hi: 6.04 },
  { id: '8', lo: 4.14, hi: 6.33 },
  { id: '9', lo: 5.38, hi: 7.25 },
  { id: '10', lo: 6.18, hi: 7.92 },
  { id: '12-14', lo: 6.14, hi: 8.52 },
  { id: '14-15', lo: 8.12, hi: 10 },
]

const SIZES: readonly Size[] = ['BO', 'NO', 'NO2', 'HO', 'PO']
const CONDITIONS: readonly Cond[] = ['compacta', 'fraturada', 'friavel']
const N_OR_LARGER: Record<Size, boolean> = { BO: false, NO: true, NO2: true, HO: true, PO: true }

// Parâmetros por diâmetro — referências de fabricantes (Boart Longyear, Dimatec).
const DIAMETERS: Record<
  Size,
  { rpm: [number, number]; wob: [number, number]; flow: [number, number] }
> = {
  BO: { rpm: [800, 1600], wob: [10, 24], flow: [20, 35] },
  NO: { rpm: [600, 1250], wob: [13, 37], flow: [35, 50] },
  NO2: { rpm: [600, 1250], wob: [13, 37], flow: [35, 50] },
  HO: { rpm: [400, 1000], wob: [20, 56], flow: [50, 70] },
  PO: { rpm: [300, 800], wob: [31, 84], flow: [80, 100] },
}

const WATERWAYS: Record<Waterway, string> = {
  Standard:
    'Boa vazão para formação competente e de grão fino. Maior área de contato (mais diamantes na face) e maior vida da coroa.',
  Turbo:
    'Menos área de contato na face: corta com menos peso e avança mais. Em troca, gasta mais rápido que o Standard. Para rocha dura e inteira (testemunho compacto).',
  Wide: 'Mais vazão para condição difícil: grão grosso, rocha fraturada ou quebrada. A área de contato menor aumenta a penetração.',
  'Lateral/Superflush':
    'Para testemunho que lava e perda de circulação (formação inconsolidada ou quebrada). Reduz a lavagem do testemunho e os entupimentos. Disponível para tubo padrão ou triplo.',
}

// Matriz pela posição na escala (o índice sempre vem limitado à escala).
function matrixAt(index: number): Matrix {
  const matrix = MATRICES[Math.min(Math.max(index, 0), MATRICES.length - 1)]
  if (!matrix) throw new Error('Escala de matrizes vazia')
  return matrix
}

function center(matrix: Matrix): number {
  return (matrix.lo + matrix.hi) / 2
}

function classOf(H: number): RockClass {
  if (H < 3) return 'mole'
  if (H < 4) return 'media'
  if (H < 6) return 'dura'
  if (H < 7) return 'muito_dura'
  return 'extrema'
}

// Matrizes cuja faixa cobre a dureza. Fora da escala, a matriz da ponta.
function coveringMatrices(H: number): Matrix[] {
  const first = matrixAt(0)
  const last = matrixAt(MATRICES.length - 1)
  if (H < first.lo) return [first]
  if (H > last.hi) return [last]
  return MATRICES.filter((matrix) => H >= matrix.lo && H <= matrix.hi)
}

/* Regra escrita da tabela: "quanto maior o número, mais dura, de grão mais fino,
   mais competente e menos abrasiva a rocha; quanto menor, mais quebrada,
   fraturada e abrasiva a formação". */
function matrixDecision(H: number, abra: Abra, cond: Cond, grain?: Grain): MatrixDecision {
  const covering = coveringMatrices(H)
  const lowest = covering[0] ?? matrixAt(0)
  const highest = covering.at(-1) ?? lowest
  let nominal = lowest
  let best = Infinity
  for (const matrix of covering) {
    const distance = Math.abs(center(matrix) - H)
    if (distance < best - 1e-9) {
      best = distance
      nominal = matrix
    }
  }
  const shifts: Shift[] = []
  if (cond === 'fraturada') shifts.push({ why: 'testemunho fraturado', d: -1 })
  if (cond === 'friavel') shifts.push({ why: 'formação friável', d: -1 })
  if (abra === 'high') shifts.push({ why: 'abrasividade alta', d: -1 })
  if (cond === 'compacta' && abra === 'low') {
    shifts.push({ why: 'rocha compacta e pouco abrasiva', d: 1 })
  }
  if (grain === 'fino') shifts.push({ why: 'grão fino', d: 1 })
  if (grain === 'grosso') shifts.push({ why: 'grão grosso', d: -1 })

  const target = MATRICES.indexOf(nominal) + shifts.reduce((sum, shift) => sum + shift.d, 0)
  const brokenAbr = cond !== 'compacta' && abra === 'high'
  const minIdx = Math.max(0, MATRICES.indexOf(lowest) - (brokenAbr ? 1 : 0))
  const maxIdx = MATRICES.indexOf(highest)
  const fin = Math.min(Math.max(target, minIdx), maxIdx)
  return {
    matrix: matrixAt(fin),
    nominal,
    covering,
    shifts,
    clamped: fin !== target,
    brokenAbr,
  }
}

function selectMatrix(H: number, abra: Abra, cond: Cond, grain?: Grain): Matrix {
  return matrixDecision(H, abra, cond, grain).matrix
}

// Ajuste em campo: subir = liga mais macia (polindo); descer = liga mais dura (desgaste rápido).
function fieldAdjust(id: string): { up: string | null; down: string | null } {
  const index = MATRICES.findIndex((matrix) => matrix.id === id)
  return {
    up: MATRICES[index + 1]?.id ?? null,
    down: index > 0 ? (MATRICES[index - 1]?.id ?? null) : null,
  }
}

/* Turbo (Dimatec, Hayden, Diamond Innovations, Epiroc): rocha dura a muito dura e inteira.
   Não é regra da tabela, é escolha do cliente entre vida útil (Standard) e avanço (Turbo). */
const TURBO_CLASSES: readonly RockClass[] = ['dura', 'muito_dura', 'extrema']

function selectWaterway(
  cond: Cond,
  grain: Grain,
  size: Size,
  cls?: RockClass,
  prefer?: Priority | null,
): WaterwayChoice {
  const big = N_OR_LARGER[size]
  let type: Waterway = 'Standard'
  let note = ''
  if (big && cond === 'friavel') type = 'Lateral/Superflush'
  else if (big && (cond === 'fraturada' || grain === 'grosso')) type = 'Wide'
  const turbo = type === 'Standard' && big && cls !== undefined && TURBO_CLASSES.includes(cls)
  const options: Waterway[] = turbo ? ['Standard', 'Turbo'] : [type]
  if (turbo && prefer === 'avanco') type = 'Turbo'
  const smallHard = !big && (cond !== 'compacta' || grain === 'grosso')
  if (smallHard) {
    note = 'Em BO a indicação é o Standard: os canais Wide e Superflush são para N e maiores.'
  }
  if (type === 'Standard' && (size === 'HO' || size === 'PO')) {
    note = `O Standard é indicado para N e menores. Em ${size}, se faltar limpeza da face, use o canal Wide.`
  }
  let trigger = 'rocha compacta de grão fino ou médio'
  if (smallHard) trigger = 'diâmetro BO'
  else if (cond === 'friavel') trigger = 'formação friável'
  else if (cond === 'fraturada') trigger = 'testemunho fraturado'
  else if (grain === 'grosso') trigger = 'rocha de grão grosso'
  if (type === 'Turbo') {
    trigger = 'rocha dura e compacta, priorizando o avanço'
    note = ''
  }
  return { type, options, reason: WATERWAYS[type], note, trigger }
}

// Ao destravar o cadeado, o valor manual começa na dureza atual (não muda a recomendação).
function startManualH(rock?: Rock | null): number {
  return rock ? CLASSES[rock.cls].H : 5
}

function opNumbers(size: Size, abra: Abra, grain: Grain, cond: Cond): OpNumbers {
  const base = DIAMETERS[size]
  const rpm: [number, number] = [...base.rpm]
  const wob: [number, number] = [...base.wob]
  const flow: [number, number] = [...base.flow]
  if (abra === 'high') {
    rpm[1] = Math.round(rpm[1] * 0.9)
    flow[0] += 3
    flow[1] += 3
  }
  if (cond === 'fraturada' || cond === 'friavel') {
    rpm[0] = Math.round(rpm[0] * 0.6)
    rpm[1] = Math.round(rpm[1] * 0.7)
    wob[0] = Math.max(0, wob[0] - 3)
    flow[0] = Math.max(0, flow[0] - 2)
  }
  if (grain === 'grosso') {
    flow[0] += 5
    flow[1] += 5
  }
  if (rpm[1] <= rpm[0]) rpm[1] = rpm[0] + 100
  return { rpmRange: rpm, wobRange: wob, flowRange: flow }
}

/* Outras marcas, alinhadas pela mesma dureza (eixo Mohs publicado por todas):
   Boart Longyear (cores + UMX), Fordia/Epiroc (HERO), Di-Corp (CoreMatrix),
   Dimatec (séries S/XT) e Hayden (escala 1–16). */
const XREF_TOP = {
  max: 99,
  bl: 'Vermelho · 10UMX',
  hero: 'HERO 13',
  dicorp: '11–13F',
  dimatec: 'XT13–XT15',
  hayden: '13–16',
}

const XREF = [
  { max: 4.5, bl: 'Roxo · 07UMX', hero: 'HERO 3', dicorp: '2A–5', dimatec: 'S3–S6', hayden: '2–4' },
  {
    max: 5.5,
    bl: 'Roxo–Verde · 07UMX',
    hero: 'HERO 5 / 7',
    dicorp: '5–7',
    dimatec: 'S6–XT8',
    hayden: '4–7',
  },
  {
    max: 6,
    bl: 'Verde · 07UMX',
    hero: 'HERO 5 / 7',
    dicorp: '5–7',
    dimatec: 'S6–XT8',
    hayden: '4–7',
  },
  {
    max: 7,
    bl: 'Verde–Amarelo · 09UMX',
    hero: 'HERO 8 / 9',
    dicorp: '7–9',
    dimatec: 'XT8–XT10',
    hayden: '7–10',
  },
  {
    max: 7.5,
    bl: 'Amarelo · 09UMX',
    hero: 'HERO 9 / 11',
    dicorp: '9–11',
    dimatec: 'XT10–XT13',
    hayden: '10–13',
  },
  {
    max: 8,
    bl: 'Vermelho · 09UMX',
    hero: 'HERO 13',
    dicorp: '11–13F',
    dimatec: 'XT13–XT15',
    hayden: '13–16',
  },
  XREF_TOP,
]

/* Quando a própria marca cita a rocha pelo nome, vale a indicação dela (Epiroc/Fordia:
   HERO 11 para basalto e material vulcânico; HERO 13 para quartzito e taconito). */
const HERO_BY_ROCK: Record<string, string> = {
  Basalto: 'HERO 11',
  Metabasalto: 'HERO 11',
  Andesito: 'HERO 11',
  Riolito: 'HERO 11',
  Dacito: 'HERO 11',
  'Traquito/Fonolito': 'HERO 11',
  Quartzito: 'HERO 13',
  'Quartzito micáceo': 'HERO 13',
  'Quartzito ferruginoso': 'HERO 13',
  'Itabirito compacto': 'HERO 13',
}

function equivalents(H: number, abra: Abra, rock?: Rock | null): Equivalents {
  const row = XREF.find((item) => H < item.max) ?? XREF_TOP
  const byName = rock ? HERO_BY_ROCK[rock.n] : undefined
  return {
    bl: row.bl,
    hero: byName ?? row.hero,
    heroByName: Boolean(byName),
    dicorp: row.dicorp,
    dimatec: row.dimatec,
    hayden: row.hayden,
    abr:
      abra === 'high'
        ? 'Em rocha abrasiva, essas marcas têm variantes próprias: HERO Abrasive, Di-Corp sufixo “A”, Boart Longyear Abrasive.'
        : '',
  }
}

/* Recomendação completa. matrixShift/forceWaterway vêm da avaliação de campo
   ("Precisou ajustar"). Sem rocha nem dureza manual, ou sem diâmetro/testemunho: null. */
function recommendCrown(input: CrownInput): CrownRec | null {
  const { manualH, size, cond } = input
  const manual = typeof manualH === 'number' && !Number.isNaN(manualH)
  const rock = input.rock ?? null
  let H: number | null = null
  if (manual) H = manualH
  else if (rock) ({ H } = CLASSES[rock.cls])
  if (H === null || size === null || size === undefined || cond === null || cond === undefined) {
    return null
  }

  const abra = input.abra ?? rock?.abra ?? 'medium'
  const grain = input.grain ?? rock?.grain ?? 'medio'
  const cls = manual || !rock ? classOf(H) : rock.cls
  const decision = matrixDecision(H, abra, cond, grain)
  const shift = input.matrixShift ?? 0
  const want = MATRICES.indexOf(decision.matrix) + shift
  const index = Math.min(Math.max(want, 0), MATRICES.length - 1)
  const matrix = matrixAt(index)

  let waterway = selectWaterway(cond, grain, size, cls, input.prefer)
  if (input.forceWaterway) {
    waterway = N_OR_LARGER[size]
      ? {
          type: input.forceWaterway,
          options: [input.forceWaterway],
          reason: WATERWAYS[input.forceWaterway],
          note: '',
          trigger: 'ajuste de campo: testemunho lavando',
        }
      : {
          ...waterway,
          note: 'Em BO o canal Lateral/Superflush não está disponível: reduza a vazão e a rotação para proteger o testemunho.',
        }
  }

  return {
    H,
    manual,
    cls,
    rock,
    abra,
    grain,
    size,
    cond,
    matrix,
    baseMatrix: decision.matrix,
    decision,
    fieldShift: shift,
    atLimit: want !== index,
    waterway,
    prefer: waterway.type === 'Turbo' ? 'avanco' : 'vida',
    adjust: fieldAdjust(matrix.id),
    ops: opNumbers(size, abra, grain, cond),
    equiv: equivalents(H, abra, manual ? null : rock),
  }
}

/* ---------- Avaliação de campo ---------- */
const PROBLEMS: Record<
  Problem,
  { label: string; action: string; shift?: number; waterway?: Waterway; contact?: boolean }
> = {
  polindo: {
    label: 'A face ficou lisa (polida) e a coroa não avança',
    action: 'Subir uma matriz: liga mais macia, que solta diamante novo',
    shift: 1,
  },
  desgaste: {
    label: 'A coroa gastou rápido',
    action: 'Descer uma matriz: liga mais dura, que dura mais',
    shift: -1,
  },
  lavando: {
    label: 'O testemunho está lavando ou a água não volta (perda de circulação)',
    action: 'Trocar o canal de água para Lateral/Superflush',
    waterway: 'Lateral/Superflush',
  },
  outro: {
    label: 'Vibração ou outro problema',
    action: 'Falar com o técnico da Explotools',
    contact: true,
  },
}

// O que a avaliação muda no canal: Turbo que gastou volta ao Standard (antes de mexer na
// matriz); polindo já na liga mais macia, em rocha que aceita Turbo, passa ao Turbo.
function turboMove(rec: CrownRec | null, problem: Problem): Priority | null {
  if (!rec) return null
  if (problem === 'desgaste' && rec.waterway.type === 'Turbo') return 'vida'
  const turboFree = rec.waterway.options.includes('Turbo') && rec.waterway.type !== 'Turbo'
  if (problem === 'polindo' && !rec.adjust.up && turboFree) return 'avanco'
  return null
}

function applyFeedback(
  input: CrownInput,
  problem: Problem,
): { input: CrownInput; contact: boolean } {
  const move = turboMove(recommendCrown(input), problem)
  if (move) return { input: { ...input, prefer: move }, contact: false }
  const found = PROBLEMS[problem]
  const next: CrownInput = { ...input, matrixShift: (input.matrixShift ?? 0) + (found.shift ?? 0) }
  if (found.waterway) next.forceWaterway = found.waterway
  return { input: next, contact: Boolean(found.contact) }
}

// Sem saída na própria coroa (ponta da escala, BO ou já em Superflush): falar com o técnico.
function feedbackDeadEnd(rec: CrownRec, problem: Problem): boolean {
  if (problem === 'outro') return true
  if (turboMove(rec, problem)) return false
  if (problem === 'polindo') return !rec.adjust.up
  if (problem === 'desgaste') return !rec.adjust.down
  return !N_OR_LARGER[rec.size] || rec.waterway.type === 'Lateral/Superflush'
}

function problemAction(problem: Problem, rec: CrownRec): string {
  const move = turboMove(rec, problem)
  if (move === 'vida') return 'Vamos voltar para o canal Standard (mais vida útil), na mesma matriz'
  if (move === 'avanco') {
    return 'Já é a liga mais macia: vamos trocar para o canal Turbo, que corta com menos peso'
  }
  if (problem === 'polindo') {
    return rec.adjust.up
      ? `Vamos subir para a Matriz ${rec.adjust.up} (liga mais macia)`
      : 'Já é a liga mais macia: vamos te pôr em contato com o técnico'
  }
  if (problem === 'desgaste') {
    return rec.adjust.down
      ? `Vamos descer para a Matriz ${rec.adjust.down} (liga mais dura)`
      : 'Já é a liga mais dura: vamos te pôr em contato com o técnico'
  }
  if (problem === 'lavando') {
    if (!N_OR_LARGER[rec.size]) {
      return 'Em BO não existe Superflush: vamos orientar a redução de vazão e rotação'
    }
    return rec.waterway.type === 'Lateral/Superflush'
      ? 'Já está com Superflush: vamos te pôr em contato com o técnico'
      : 'Vamos trocar o canal de água para Lateral/Superflush'
  }
  return 'Abrimos o WhatsApp com o técnico da Explotools'
}

/* ---------- Entrada salva (histórico no banco) ---------- */
// Recomendações salvas antes da troca para a série O (BQ, NQ, HQ…) continuam abrindo.
function normSize(value: string): Size {
  const size = value.replace(/^(?<serie>[BNHP])Q/u, '$<serie>O')
  return SIZES.find((item) => item === size) ?? 'NO'
}

function makeEntrada(input: CrownInput, rec: CrownRec): Entrada {
  return {
    rocha: input.rock?.n ?? null,
    durezaManual: typeof input.manualH === 'number' ? input.manualH : null,
    abrasividade: input.abra ?? null,
    diametro: rec.size,
    testemunho: rec.cond,
    ajusteMatriz: input.matrixShift ?? 0,
    canalForcado: input.forceWaterway ?? null,
    prioridade: input.prefer ?? null,
    granulometria: input.grain ?? null,
  }
}

function inputFromEntrada(entrada: Entrada): CrownInput {
  return {
    rock: findRock(entrada.rocha),
    size: normSize(entrada.diametro),
    cond: entrada.testemunho,
    manualH: entrada.durezaManual,
    abra: entrada.abrasividade,
    matrixShift: entrada.ajusteMatriz,
    forceWaterway: entrada.canalForcado,
    prefer: entrada.prioridade ?? null,
    grain: entrada.granulometria ?? null,
  }
}

/* ---------- Textos ---------- */
const PT = {
  abra: { low: 'baixa', medium: 'média', high: 'alta' } as Record<Abra, string>,
  cond: { compacta: 'compacto', fraturada: 'fraturado', friavel: 'friável' } as Record<
    Cond,
    string
  >,
  grain: { fino: 'fina', medio: 'média', grosso: 'grossa' } as Record<Grain, string>,
  prefer: { vida: 'vida útil', avanco: 'avanço' } as Record<Priority, string>,
}

function fmtBR(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

// Texto completo do pedido de cotação (vai na mensagem do WhatsApp).
function quoteDocument(
  rec: CrownRec,
  input: CrownInput,
  meta: { date?: string; cliente?: string; local?: string } = {},
): string {
  const { ops } = rec
  const lines = ['*PEDIDO DE COTAÇÃO — Coroa Explotools*']
  if (meta.date) lines.push(`Data: ${meta.date}`)
  if (meta.cliente) lines.push(`Cliente: ${meta.cliente}`)
  lines.push(
    '',
    '*COROA*',
    '• Coroa impregnada Explotools',
    `• Diâmetro: ${rec.size}`,
    `• Matriz: ${rec.matrix.id} (escala 1–15)`,
    `• Canal de água: ${rec.waterway.type}${rec.waterway.options.length > 1 ? ` (prioridade: ${PT.prefer[rec.prefer]})` : ''}`,
    '• Quantidade: (informar)',
  )
  let grainNote = ''
  if (rec.rock) {
    grainNote = rec.grain === rec.rock.grain ? ' (típica da rocha)' : ' (ajustada pelo usuário)'
  }
  let abraNote = ''
  if (rec.rock) {
    abraNote =
      rec.abra === rec.rock.abra
        ? ` (CAI típico ${fmtBR(rec.rock.cai)})`
        : ' (ajustada pelo usuário)'
  }
  lines.push(
    '',
    '*APLICAÇÃO*',
    `• Rocha: ${rec.rock ? rec.rock.n : 'não listada'}`,
    `• Dureza de perfuração: ${CLASSES[rec.cls].label} (Mohs ${fmtBR(rec.H)})${rec.manual ? ' — definida manualmente' : ''}`,
    `• Abrasividade: ${PT.abra[rec.abra]}${abraNote}`,
    `• Granulometria: ${PT.grain[rec.grain]}${grainNote}`,
    `• Testemunho: ${PT.cond[rec.cond]}`,
  )
  if (meta.local) lines.push(`• Local da sondagem: ${meta.local}`)
  if (rec.fieldShift) {
    lines.push(
      `• Ajuste de campo: Matriz ${rec.baseMatrix.id} → ${rec.matrix.id} após teste no furo`,
    )
  }
  if (input.forceWaterway) lines.push('• Ajuste de campo: canal de água trocado após teste no furo')
  lines.push(
    '',
    '*PARÂMETROS DE OPERAÇÃO SUGERIDOS*',
    `• Rotação: ${ops.rpmRange[0]}–${ops.rpmRange[1]} RPM`,
    `• Peso na coroa: ${ops.wobRange[0]}–${ops.wobRange[1]} kN`,
    `• Vazão de água: ${ops.flowRange[0]}–${ops.flowRange[1]} L/min`,
    '',
    'Gerado na Seleção de Coroa Explotools',
  )
  return lines.join('\n')
}

// Mensagem para o técnico quando a avaliação não tem ajuste possível na coroa.
function techText(rec: CrownRec, problem: Problem): string {
  return [
    'Olá, Explotools! Preciso de apoio técnico com esta coroa:',
    `• Coroa impregnada Explotools ${rec.size} · Matriz ${rec.matrix.id} · Canal ${rec.waterway.type}`,
    `• Rocha: ${rec.rock ? rec.rock.n : 'rocha não listada'} (${CLASSES[rec.cls].label}, abrasividade ${PT.abra[rec.abra]})`,
    `• Testemunho: ${PT.cond[rec.cond]}`,
    `• O que aconteceu no furo: ${PROBLEMS[problem].label}`,
    '(Gerado na Seleção de Coroa Explotools)',
  ].join('\n')
}

export type {
  Cond,
  CrownInput,
  CrownRec,
  Entrada,
  Equivalents,
  Matrix,
  MatrixDecision,
  OpNumbers,
  Priority,
  Problem,
  Size,
  Waterway,
  WaterwayChoice,
}
export {
  CONDITIONS,
  DIAMETERS,
  MATRICES,
  N_OR_LARGER,
  PROBLEMS,
  PT,
  SIZES,
  TURBO_CLASSES,
  applyFeedback,
  classOf,
  coveringMatrices,
  equivalents,
  feedbackDeadEnd,
  fieldAdjust,
  fmtBR,
  inputFromEntrada,
  normSize,
  makeEntrada,
  matrixDecision,
  opNumbers,
  problemAction,
  quoteDocument,
  recommendCrown,
  selectMatrix,
  selectWaterway,
  startManualH,
  techText,
}
