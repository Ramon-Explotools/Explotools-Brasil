/* ===========================================================================
   BASE DE LITOLOGIAS (foco em sondagem no Brasil)
     cls      : classe de dureza de perfuração da tabela técnica das coroas Explotools
     dt       : true = rocha citada nominalmente na tabela; false = classe por analogia
     cai      : abrasividade Cerchar típica (literatura; granito/gnaisse por medição publicada)
     eqc      : teor de quartzo equivalente típico (%)
     grain    : granulometria típica — entra na matriz e no canal de água
     ucs      : faixa típica de resistência à compressão (MPa)
     variable : rocha muito variável (alteração, cimentação, clastos)
     alias    : sinônimos e nomes de boletim de sondagem usados na busca
   A abrasividade (baixa/média/alta) não é digitada: sai do CAI por abraFromCAI().
   =========================================================================== */

type Abra = 'low' | 'medium' | 'high'
type Grain = 'fino' | 'medio' | 'grosso'
type RockClass = 'mole' | 'media' | 'dura' | 'muito_dura' | 'extrema'

interface RockData {
  n: string
  cls: RockClass
  dt: boolean
  cai: number
  eqc: number
  grain: Grain
  ucs: [number, number]
  variable?: boolean
  alias?: string
}

interface Rock extends RockData {
  abra: Abra
  variable: boolean
}

// Classes de dureza de perfuração da tabela técnica (H = ponto médio da faixa).
const CLASSES: Record<
  RockClass,
  { label: string; range: [number, number]; H: number; ex: string }
> = {
  mole: {
    label: 'Mole',
    range: [2, 3],
    H: 2.5,
    ex: 'arenito, calcário, folhelho, serpentinito, carvão',
  },
  media: { label: 'Média', range: [3, 4], H: 3.5, ex: 'dolomito, ardósia, pegmatito, greenstone' },
  dura: { label: 'Dura', range: [4, 6], H: 5, ex: 'basalto, gabro, diorito, xisto, norito' },
  muito_dura: {
    label: 'Muito dura',
    range: [6, 7],
    H: 6.5,
    ex: 'granito, gnaisse, quartzito, riolito, andesito',
  },
  extrema: {
    label: 'Extremamente dura',
    range: [7, 8],
    H: 7.5,
    ex: 'itabirito/taconito, jaspilito, quartzo, chert',
  },
}

// Classes Cerchar: baixa < 1,5 · média 1,5–3,0 · alta ≥ 3,0.
function abraFromCAI(cai: number): Abra {
  if (cai < 1.5) return 'low'
  return cai < 3 ? 'medium' : 'high'
}

const DATA: RockData[] = [
  // ---- Mole (Mohs de perfuração 2–3)
  {
    n: 'Calcário',
    cls: 'mole',
    dt: true,
    cai: 1.2,
    eqc: 2,
    grain: 'fino',
    ucs: [30, 200],
    alias:
      'limestone travertino calcilutito calcarenito calcirrudito calcario micritico calcario oolitico caliche',
  },
  {
    n: 'Lamito',
    cls: 'mole',
    dt: true,
    cai: 0.6,
    eqc: 20,
    grain: 'fino',
    ucs: [5, 80],
    alias: 'mudstone argilito lutito',
  },
  {
    n: 'Folhelho',
    cls: 'mole',
    dt: true,
    cai: 0.7,
    eqc: 20,
    grain: 'fino',
    ucs: [5, 100],
    alias: 'shale folhelho betuminoso pirobetuminoso',
  },
  {
    n: 'Carvão',
    cls: 'mole',
    dt: true,
    cai: 0.3,
    eqc: 0,
    grain: 'fino',
    ucs: [5, 50],
    alias: 'coal linhito carvao betuminoso antracito',
  },
  {
    n: 'Serpentinito',
    cls: 'mole',
    dt: true,
    cai: 0.7,
    eqc: 10,
    grain: 'fino',
    ucs: [20, 120],
    alias: 'serpentina serpentinitos',
  },
  {
    n: 'Arenito (quartzoso)',
    cls: 'mole',
    dt: true,
    cai: 3,
    eqc: 70,
    grain: 'medio',
    ucs: [20, 170],
    alias: 'sandstone quartzarenito arenito quartzoso',
  },
  {
    n: 'Arenito ferruginoso',
    cls: 'mole',
    dt: false,
    cai: 3.5,
    eqc: 65,
    grain: 'medio',
    ucs: [40, 180],
  },
  {
    n: 'Arenito arcoseano',
    cls: 'mole',
    dt: false,
    cai: 2.5,
    eqc: 55,
    grain: 'medio',
    ucs: [40, 180],
    alias: 'arcosio arcoseo arenito feldspatico arcoseano',
  },
  { n: 'Siltito', cls: 'mole', dt: false, cai: 0.8, eqc: 30, grain: 'fino', ucs: [5, 100] },
  {
    n: 'Ritmito',
    cls: 'mole',
    dt: false,
    cai: 1,
    eqc: 25,
    grain: 'fino',
    ucs: [10, 80],
    alias: 'varvito',
  },
  { n: 'Marga', cls: 'mole', dt: false, cai: 0.8, eqc: 5, grain: 'fino', ucs: [5, 50] },
  {
    n: 'Mármore',
    cls: 'mole',
    dt: false,
    cai: 0.8,
    eqc: 3,
    grain: 'medio',
    ucs: [40, 200],
    alias: 'calcita marmore dolomitico meta-limestone metacalcario',
  },
  {
    n: 'Gipsita (gesso)',
    cls: 'mole',
    dt: false,
    cai: 0.3,
    eqc: 0,
    grain: 'fino',
    ucs: [10, 40],
    alias: 'gesso gipso',
  },
  {
    n: 'Halita (sal-gema)',
    cls: 'mole',
    dt: false,
    cai: 0.3,
    eqc: 0,
    grain: 'medio',
    ucs: [10, 40],
    alias: 'sal',
  },
  {
    n: 'Silvinita',
    cls: 'mole',
    dt: false,
    cai: 0.3,
    eqc: 0,
    grain: 'medio',
    ucs: [10, 35],
    alias: 'potassio sal potassico',
  },
  {
    n: 'Esteatito (pedra-sabão)',
    cls: 'mole',
    dt: false,
    cai: 0.3,
    eqc: 0,
    grain: 'fino',
    ucs: [10, 60],
    alias: 'pedra sabao talco xisto talco talco-xisto zonas talcose zonas talcosas',
  },
  {
    n: 'Saprolito',
    cls: 'mole',
    dt: false,
    cai: 0.8,
    eqc: 20,
    grain: 'fino',
    ucs: [1, 25],
    variable: true,
    alias:
      'rocha alterada intemperizada solo residual saprolito granitico saprolito basaltico saprolito gnaissico',
  },
  {
    n: 'Bauxita',
    cls: 'mole',
    dt: false,
    cai: 1,
    eqc: 5,
    grain: 'fino',
    ucs: [5, 60],
    alias: 'minerio de aluminio',
  },
  {
    n: 'Kimberlito',
    cls: 'mole',
    dt: false,
    cai: 1,
    eqc: 10,
    grain: 'medio',
    ucs: [10, 100],
    variable: true,
  },
  {
    n: 'Itabirito friável',
    cls: 'mole',
    dt: false,
    cai: 3,
    eqc: 60,
    grain: 'fino',
    ucs: [1, 30],
    variable: true,
    alias: 'itabirito brando itabirito mole itabirito silicoso friavel minerio de ferro',
  },
  {
    n: 'Hematita macia (friável)',
    cls: 'mole',
    dt: false,
    cai: 1.5,
    eqc: 30,
    grain: 'fino',
    ucs: [1, 30],
    variable: true,
    alias: 'hematitita friavel hematita friavel minerio de ferro friavel',
  },
  // ---- Média (3–4)
  {
    n: 'Dolomito',
    cls: 'media',
    dt: true,
    cai: 1,
    eqc: 4,
    grain: 'fino',
    ucs: [40, 250],
    alias: 'dolomita dolomite',
  },
  {
    n: 'Ardósia',
    cls: 'media',
    dt: true,
    cai: 0.8,
    eqc: 18,
    grain: 'fino',
    ucs: [40, 180],
    alias: 'slate',
  },
  {
    n: 'Pegmatito',
    cls: 'media',
    dt: true,
    cai: 4,
    eqc: 50,
    grain: 'grosso',
    ucs: [100, 250],
    alias: 'pegmatita espodumenio litio',
  },
  {
    n: 'Greenstone (rocha verde)',
    cls: 'media',
    dt: true,
    cai: 2,
    eqc: 25,
    grain: 'fino',
    ucs: [100, 250],
    alias: 'rocha verde',
  },
  {
    n: 'Calcário dolomítico',
    cls: 'media',
    dt: false,
    cai: 1.4,
    eqc: 4,
    grain: 'fino',
    ucs: [40, 250],
  },
  {
    n: 'Filito',
    cls: 'media',
    dt: false,
    cai: 1,
    eqc: 15,
    grain: 'fino',
    ucs: [20, 100],
    alias: 'filito carbonoso filito grafitoso sericita filito',
  },
  {
    n: 'Clorita xisto',
    cls: 'media',
    dt: false,
    cai: 1.2,
    eqc: 10,
    grain: 'fino',
    ucs: [20, 100],
    alias: 'clorita-xisto cloritito xisto clorita',
  },
  {
    n: 'Sericita xisto',
    cls: 'media',
    dt: false,
    cai: 2,
    eqc: 35,
    grain: 'fino',
    ucs: [20, 120],
    alias: 'quartzo-sericita xisto quartzo sericita xisto',
  },
  {
    n: 'Carbonatito',
    cls: 'media',
    dt: false,
    cai: 1.5,
    eqc: 8,
    grain: 'medio',
    ucs: [40, 180],
    alias: 'fosfato niobio terras raras',
  },
  {
    n: 'Conglomerado',
    cls: 'media',
    dt: false,
    cai: 3.5,
    eqc: 55,
    grain: 'grosso',
    ucs: [40, 200],
    variable: true,
    alias: 'conglomerado matriz argilosa conglomerado matriz silica',
  },
  {
    n: 'Laterita',
    cls: 'media',
    dt: false,
    cai: 2,
    eqc: 30,
    grain: 'medio',
    ucs: [10, 100],
    variable: true,
    alias: 'laterita niquelifera lateritizacao niquel',
  },
  {
    n: 'Canga (latossolo endurecido)',
    cls: 'media',
    dt: false,
    cai: 2.5,
    eqc: 40,
    grain: 'grosso',
    ucs: [20, 120],
    variable: true,
    alias: 'ferricrete',
  },
  // ---- Dura (4–6)
  {
    n: 'Basalto',
    cls: 'dura',
    dt: true,
    cai: 2.5,
    eqc: 25,
    grain: 'fino',
    ucs: [100, 350],
    alias: 'basalto vesicular basalto amigdaloidal basalto porfiritico',
  },
  {
    n: 'Gabro',
    cls: 'dura',
    dt: true,
    cai: 2.5,
    eqc: 28,
    grain: 'grosso',
    ucs: [150, 300],
    alias: 'metagabro',
  },
  { n: 'Norito', cls: 'dura', dt: true, cai: 2.5, eqc: 28, grain: 'grosso', ucs: [150, 300] },
  { n: 'Diorito', cls: 'dura', dt: true, cai: 2.5, eqc: 25, grain: 'medio', ucs: [150, 300] },
  {
    n: 'Xisto',
    cls: 'dura',
    dt: true,
    cai: 2,
    eqc: 35,
    grain: 'medio',
    ucs: [20, 120],
    variable: true,
    alias: 'mica xisto biotita xisto muscovita xisto granada xisto schist',
  },
  {
    n: 'Metabasalto',
    cls: 'dura',
    dt: false,
    cai: 2.5,
    eqc: 25,
    grain: 'fino',
    ucs: [100, 300],
    alias: 'rocha mafica metavulcanica mafica clorita metabasalto metabasito',
  },
  {
    n: 'Diabásio',
    cls: 'dura',
    dt: false,
    cai: 2.8,
    eqc: 28,
    grain: 'medio',
    ucs: [150, 300],
    alias: 'dolerito',
  },
  {
    n: 'Sienito',
    cls: 'dura',
    dt: false,
    cai: 2.8,
    eqc: 30,
    grain: 'medio',
    ucs: [150, 300],
    alias: 'nefelina sienito sienito nefelinico foiaito',
  },
  { n: 'Anortosito', cls: 'dura', dt: false, cai: 2, eqc: 18, grain: 'grosso', ucs: [150, 300] },
  { n: 'Piroxenito', cls: 'dura', dt: false, cai: 2.5, eqc: 30, grain: 'grosso', ucs: [150, 300] },
  {
    n: 'Peridotito/Dunito',
    cls: 'dura',
    dt: false,
    cai: 2.8,
    eqc: 35,
    grain: 'medio',
    ucs: [150, 300],
    variable: true,
    alias: 'ultramafica harzburgito lherzolito',
  },
  { n: 'Anfibolito', cls: 'dura', dt: false, cai: 2.5, eqc: 30, grain: 'medio', ucs: [150, 280] },
  {
    n: 'Brecha',
    cls: 'dura',
    dt: false,
    cai: 3,
    eqc: 40,
    grain: 'grosso',
    ucs: [50, 250],
    variable: true,
    alias: 'brecha hidrotermal rocha brechada brecha sedimentar',
  },
  // ---- Muito dura (6–7)
  {
    n: 'Granito',
    cls: 'muito_dura',
    dt: true,
    cai: 4.1,
    eqc: 55,
    grain: 'grosso',
    ucs: [100, 300],
  },
  {
    n: 'Gnaisse',
    cls: 'muito_dura',
    dt: true,
    cai: 3.8,
    eqc: 55,
    grain: 'medio',
    ucs: [150, 300],
    alias: 'ortognaisse paragnaisse gnaisse bandado gnaisse granitico',
  },
  {
    n: 'Quartzito',
    cls: 'muito_dura',
    dt: true,
    cai: 5,
    eqc: 95,
    grain: 'fino',
    ucs: [150, 350],
    alias: 'quartzite',
  },
  {
    n: 'Riolito',
    cls: 'muito_dura',
    dt: true,
    cai: 3.5,
    eqc: 55,
    grain: 'fino',
    ucs: [100, 300],
    alias: 'metavulcanica felsica riolito porfiritico',
  },
  {
    n: 'Andesito',
    cls: 'muito_dura',
    dt: true,
    cai: 2.5,
    eqc: 35,
    grain: 'fino',
    ucs: [100, 300],
    alias: 'andesito porfiritico andesito vesicular',
  },
  {
    n: 'Granodiorito',
    cls: 'muito_dura',
    dt: false,
    cai: 3.6,
    eqc: 45,
    grain: 'medio',
    ucs: [150, 300],
  },
  {
    n: 'Monzogranito',
    cls: 'muito_dura',
    dt: false,
    cai: 3.9,
    eqc: 50,
    grain: 'grosso',
    ucs: [150, 300],
  },
  {
    n: 'Sienogranito',
    cls: 'muito_dura',
    dt: false,
    cai: 3.9,
    eqc: 50,
    grain: 'grosso',
    ucs: [150, 300],
  },
  {
    n: 'Tonalito',
    cls: 'muito_dura',
    dt: false,
    cai: 3.6,
    eqc: 45,
    grain: 'medio',
    ucs: [150, 300],
    alias: 'trondhjemito',
  },
  {
    n: 'Quartzodiorito',
    cls: 'muito_dura',
    dt: false,
    cai: 3.3,
    eqc: 40,
    grain: 'medio',
    ucs: [150, 300],
    alias: 'quartzo-diorito',
  },
  {
    n: 'Charnockito',
    cls: 'muito_dura',
    dt: false,
    cai: 3.3,
    eqc: 40,
    grain: 'grosso',
    ucs: [150, 300],
    alias: 'enderbito',
  },
  {
    n: 'Granulito',
    cls: 'muito_dura',
    dt: false,
    cai: 3.3,
    eqc: 40,
    grain: 'medio',
    ucs: [150, 300],
  },
  {
    n: 'Dacito',
    cls: 'muito_dura',
    dt: false,
    cai: 3.3,
    eqc: 50,
    grain: 'fino',
    ucs: [100, 300],
    alias: 'riodacito metadacito',
  },
  {
    n: 'Traquito/Fonolito',
    cls: 'muito_dura',
    dt: false,
    cai: 2.5,
    eqc: 30,
    grain: 'fino',
    ucs: [100, 250],
    alias: 'traquito fonolito tinguaito',
  },
  {
    n: 'Migmatito',
    cls: 'muito_dura',
    dt: false,
    cai: 3.8,
    eqc: 50,
    grain: 'grosso',
    ucs: [150, 300],
  },
  {
    n: 'Quartzito micáceo',
    cls: 'muito_dura',
    dt: false,
    cai: 4.5,
    eqc: 80,
    grain: 'fino',
    ucs: [120, 300],
  },
  {
    n: 'Quartzito ferruginoso',
    cls: 'muito_dura',
    dt: false,
    cai: 4.5,
    eqc: 80,
    grain: 'fino',
    ucs: [150, 300],
  },
  {
    n: 'Metarenito',
    cls: 'muito_dura',
    dt: false,
    cai: 3.5,
    eqc: 75,
    grain: 'medio',
    ucs: [100, 250],
    alias: 'meta-arenito',
  },
  {
    n: 'Metaconglomerado',
    cls: 'muito_dura',
    dt: false,
    cai: 3.8,
    eqc: 70,
    grain: 'grosso',
    ucs: [100, 250],
    alias: 'conglomerado aurifero',
  },
  {
    n: 'Greisen',
    cls: 'muito_dura',
    dt: false,
    cai: 4,
    eqc: 70,
    grain: 'medio',
    ucs: [100, 250],
    alias: 'estanho cassiterita',
  },
  {
    n: 'Hematita dura (compacta)',
    cls: 'muito_dura',
    dt: false,
    cai: 3,
    eqc: 30,
    grain: 'fino',
    ucs: [100, 300],
    alias: 'hematitita compacta hematitito compacto hematita compacta minerio de ferro',
  },
  {
    n: 'Magnetitito',
    cls: 'muito_dura',
    dt: false,
    cai: 3,
    eqc: 30,
    grain: 'fino',
    ucs: [100, 300],
    alias: 'magnetita',
  },
  // ---- Extremamente dura (7–8)
  {
    n: 'Itabirito compacto',
    cls: 'extrema',
    dt: true,
    cai: 4.5,
    eqc: 60,
    grain: 'fino',
    ucs: [100, 300],
    alias: 'taconito taconita itabirito duro bif formacao ferrifera bandada minerio de ferro',
  },
  {
    n: 'Jaspilito',
    cls: 'extrema',
    dt: true,
    cai: 4.8,
    eqc: 90,
    grain: 'fino',
    ucs: [150, 300],
    alias: 'jaspe jasperito jaspelito',
  },
  {
    n: 'Chert',
    cls: 'extrema',
    dt: true,
    cai: 5,
    eqc: 95,
    grain: 'fino',
    ucs: [150, 350],
    alias: 'silex silexito calcedonia',
  },
  {
    n: 'Quartzo maciço (veio)',
    cls: 'extrema',
    dt: true,
    cai: 5.5,
    eqc: 100,
    grain: 'medio',
    ucs: [100, 300],
    alias: 'veio de quartzo',
  },
  { n: 'Metachert', cls: 'extrema', dt: false, cai: 5, eqc: 95, grain: 'fino', ucs: [150, 350] },
]

const ROCKS: Rock[] = DATA.map((rock) =>
  Object.assign(rock, { abra: abraFromCAI(rock.cai), variable: rock.variable ?? false }),
)

// Rochas mais usadas na sondagem no Brasil (atalhos da ferramenta).
const COMMON_ROCKS = [
  'Granito',
  'Gnaisse',
  'Itabirito compacto',
  'Itabirito friável',
  'Basalto',
  'Quartzito',
  'Xisto',
  'Arenito (quartzoso)',
]

function normText(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function findRock(name?: string | null): Rock | null {
  if (!name) return null
  return ROCKS.find((rock) => rock.n === name) ?? null
}

// Busca sem acento: começa pelo nome > palavra do nome começa > nome contém >
// palavra do sinônimo começa (só no começo da palavra: "arenito" não acha "calcarenito").
function searchRocks(query: string, limit = 12): Rock[] {
  const term = normText(query).trim()
  if (!term) return []
  const hits: { rock: Rock; score: number; index: number }[] = []
  for (const [index, rock] of ROCKS.entries()) {
    const name = normText(rock.n)
    let score = -1
    if (name.startsWith(term)) score = 0
    else if (` ${name.replaceAll(/[()/-]/gu, ' ')}`.includes(` ${term}`)) score = 1
    else if (name.includes(term)) score = 2
    else if (` ${normText(rock.alias)}`.includes(` ${term}`)) score = 3
    if (score > -1) hits.push({ rock, score, index })
  }
  hits.sort((a, b) => a.score - b.score || a.index - b.index)
  return hits.slice(0, limit).map((hit) => hit.rock)
}

export type { Abra, Grain, Rock, RockClass }
export { CLASSES, COMMON_ROCKS, ROCKS, abraFromCAI, findRock, normText, searchRocks }
