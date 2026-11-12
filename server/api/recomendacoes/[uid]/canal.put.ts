const { canalSchema } = useRecomendacaoSchema()

// Escolha do cliente entre vida útil (Standard) e avanço (Turbo), quando a coroa tem as duas
// opções. Só quem gerou a recomendação escolhe, e só antes de avaliar no furo.
export default defineEventHandler(async (event): Promise<RecomendacaoCoroa> => {
  const { email } = await requireLead(event)
  const uid = getRouterParam(event, 'uid') ?? ''
  if (!/^[\da-f-]{36}$/iu.test(uid)) {
    throw createError({ status: 404, message: 'Recomendação não encontrada' })
  }
  const { prioridade } = await validBody(event, canalSchema)

  const doc = await Recomendacoes.findOne({ uid, email, versao: 2 }, { _id: 0, __v: 0 })
    .lean<RecomendacaoCoroa>()
    .catch(() => failed('Não foi possível ler a recomendação'))
  if (!doc) throw createError({ status: 404, message: 'Recomendação não encontrada' })
  if (doc.status !== 'aguardando') {
    throw createError({ status: 409, message: 'Esta coroa já foi avaliada: o canal não muda mais' })
  }

  const rec = recommendCrown({ ...inputFromEntrada(doc.entrada), prefer: prioridade })
  if (!rec || rec.waterway.options.length < 2) {
    throw createError({ status: 400, message: 'Esta coroa não tem opção de canal para escolher' })
  }

  const entrada = { ...doc.entrada, prioridade }
  const resultado = { ...doc.resultado, canal: rec.waterway.type }
  await Recomendacoes.updateOne({ uid, email }, { entrada, resultado }).catch(() =>
    failed('Não foi possível salvar a escolha do canal'),
  )

  return { ...doc, entrada, resultado }
})
