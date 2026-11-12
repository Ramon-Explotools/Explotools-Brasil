import type { Entrada, Size, Waterway } from '#shared/utils/matriz.engine'
import type { Abra, Grain, RockClass } from '#shared/utils/rochas'

export interface LeadRow {
  _id: string
  nome: string
  email: string
  telefone: string
  empresa: string
  cargo: string
  wireline?: boolean
  createdAt: string
  lastAccess: string
  recomendacoes: { uid: string; date: string; rocha: string }[]
}

export interface AdminRow {
  _id: string
  email: string
  createdAt: string
  self: boolean
}

// Linhas das tabelas da recomendação antiga (versão 1, matriz 1–9).
export interface DiagRow {
  sintoma: string
  causa: string
  acao: string
  ajuste: string
}

export interface BoaPraticaRow {
  parametro: string
  regra: string
  ajuste: string
  obs: string
}

// Recomendação antiga (matriz 1–9). Continua no banco e abre pelo link.
export interface RecomendacaoLegada {
  uid: string
  email: string
  versao?: 1
  rocha?: string
  mohs: number
  eqc: number
  cai: number
  caiClasse: string
  ucs: string
  abrasividade: string
  granulometria: string
  diametro: string
  formacao: string
  objetivo: string
  matriz: string
  matrizPalavra: string
  abrVariante: string
  serie: string
  serieAlt: string
  areaAberta: string
  canalCoroa: string
  alturaCoroa: string
  diCorpo: string
  fordiaEpiroc: string
  boartLongyear: string
  dimatec: string
  hayden: string
  abrNota: string
  rpm: string
  wob: string
  fluxoAgua: string
  canal: string
  diagnostico: DiagRow[]
  boasPraticas: BoaPraticaRow[]
  createdAt?: string
}

// Onde fica a sondagem (município do IBGE).
export interface LocalSondagem {
  uf: string
  cidade: string
  codigoIbge: number
}

export type StatusCoroa = 'aguardando' | 'atendeu' | 'ajustada'

// Recomendação da coroa Explotools (versão 2, escala 1–15). A entrada recalcula a coroa;
// o resultado guarda o que foi mostrado, para análise.
export interface RecomendacaoCoroa {
  uid: string
  email: string
  versao: 2
  rocha: string
  matriz: string
  diametro: Size
  entrada: Entrada
  resultado: {
    matriz: string
    canal: Waterway
    dureza: number
    classe: RockClass
    abrasividade: Abra
    granulometria: Grain
    manual: boolean
  }
  status: StatusCoroa
  problema: string | null
  avaliadoEm: string | null
  parentUid: string | null
  local: LocalSondagem | null
  createdAt: string
}

export type RecomendacaoMongo = RecomendacaoLegada | RecomendacaoCoroa

export interface RecomendacaoResumo {
  uid: string
  rocha: string
  matriz: string
  diametro: string
  versao: number
  status: StatusCoroa | null
  local: LocalSondagem | null
  createdAt: string
}

export interface MapaResumo {
  total: number
  semLocal: number
  porUf: { uf: string; total: number }[]
  cidades: { uf: string; cidade: string; total: number }[]
  rochasPorUf: Record<string, { rocha: string; total: number }[]>
}

export interface AvaliacaoResposta {
  recomendacao: RecomendacaoCoroa
  ajustada: RecomendacaoCoroa | null
}
