import mongoose, { Schema } from 'mongoose'

interface LeadDoc extends LeadOutput {
  createdAt?: string
  lastAccess?: string
}

// Um documento guarda a versão antiga (matriz 1–9) ou a coroa Explotools (versão 2).
type RecomendacaoDoc = Omit<Partial<RecomendacaoLegada>, 'versao'> &
  Omit<Partial<RecomendacaoCoroa>, 'versao'> & { uid: string; email: string; versao?: number }

interface AdmDoc {
  user: string
  senha: string
  createdAt?: string
}

let connecting: Promise<typeof mongoose> | null = null

async function connectDb(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) return mongoose
  const { mongoUrl, mongoDbName } = useRuntimeConfig()
  if (!mongoUrl) throw createError({ status: 500, message: 'Banco de dados não configurado' })
  connecting ??= mongoose.connect(mongoUrl, { dbName: mongoDbName })
  try {
    return await connecting
  } catch (error) {
    connecting = null
    throw error
  }
}

const DiagRowSchema = new Schema(
  {
    sintoma: { type: String, required: true },
    causa: { type: String, required: true },
    acao: { type: String, required: true },
    ajuste: { type: String, required: true },
  },
  { _id: false },
)

const BoaPraticaRowSchema = new Schema(
  {
    parametro: { type: String, required: true },
    regra: { type: String, required: true },
    ajuste: { type: String, required: true },
    obs: { type: String, required: true },
  },
  { _id: false },
)

const Leads = mongoose.model(
  'lead',
  new Schema<LeadDoc>({
    nome: { type: String, required: true },
    email: { type: String, required: true, index: true },
    telefone: { type: String, required: true },
    empresa: { type: String, required: true },
    cargo: { type: String, required: true },
    wireline: { type: Boolean, required: false },
    createdAt: { type: String, required: false },
    lastAccess: { type: String, required: false },
  }),
)

const Adm = mongoose.model(
  'adm',
  new Schema<AdmDoc>({
    user: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    createdAt: { type: String, required: false },
  }),
)

const EntradaSchema = new Schema(
  {
    rocha: { type: String, required: false, default: null },
    durezaManual: { type: Number, required: false, default: null },
    abrasividade: { type: String, required: false, default: null },
    diametro: { type: String, required: true },
    testemunho: { type: String, required: true },
    ajusteMatriz: { type: Number, required: true, default: 0 },
    canalForcado: { type: String, required: false, default: null },
    prioridade: { type: String, required: false, default: null },
    granulometria: { type: String, required: false, default: null },
  },
  { _id: false },
)

const ResultadoSchema = new Schema(
  {
    matriz: { type: String, required: true },
    canal: { type: String, required: true },
    dureza: { type: Number, required: true },
    classe: { type: String, required: true },
    abrasividade: { type: String, required: true },
    granulometria: { type: String, required: true },
    manual: { type: Boolean, required: true },
  },
  { _id: false },
)

const LocalSchema = new Schema(
  {
    uf: { type: String, required: true },
    cidade: { type: String, required: true },
    codigoIbge: { type: Number, required: true },
  },
  { _id: false },
)

// Campos da versão antiga ficam opcionais: os documentos antigos continuam abrindo.
const Recomendacoes = mongoose.model(
  'recomendacao',
  new Schema<RecomendacaoDoc>({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, index: true },
    versao: { type: Number, required: false },
    rocha: { type: String, required: false },
    matriz: { type: String, required: true },
    diametro: { type: String, required: true },
    entrada: { type: EntradaSchema, required: false },
    resultado: { type: ResultadoSchema, required: false },
    status: { type: String, required: false },
    problema: { type: String, required: false, default: null },
    avaliadoEm: { type: String, required: false, default: null },
    parentUid: { type: String, required: false, default: null },
    local: { type: LocalSchema, required: false, default: null },
    mohs: { type: Number, required: false },
    eqc: { type: Number, required: false },
    cai: { type: Number, required: false },
    caiClasse: { type: String, required: false },
    ucs: { type: String, required: false },
    abrasividade: { type: String, required: false },
    granulometria: { type: String, required: false },
    formacao: { type: String, required: false },
    objetivo: { type: String, required: false },
    matrizPalavra: { type: String, required: false },
    abrVariante: { type: String, required: false },
    serie: { type: String, required: false },
    serieAlt: { type: String, required: false },
    areaAberta: { type: String, required: false },
    canalCoroa: { type: String, required: false },
    alturaCoroa: { type: String, required: false },
    diCorpo: { type: String, required: false },
    fordiaEpiroc: { type: String, required: false },
    boartLongyear: { type: String, required: false },
    dimatec: { type: String, required: false },
    hayden: { type: String, required: false },
    abrNota: { type: String, required: false },
    rpm: { type: String, required: false },
    wob: { type: String, required: false },
    fluxoAgua: { type: String, required: false },
    canal: { type: String, required: false },
    diagnostico: { type: [DiagRowSchema], required: false, default: undefined },
    boasPraticas: { type: [BoaPraticaRowSchema], required: false, default: undefined },
    createdAt: { type: String, required: false },
  }),
)

export { Adm, Leads, Recomendacoes, connectDb }
