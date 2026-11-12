const { avaliacaoSchema } = useRecomendacaoSchema()

// Avaliação de campo. "Precisou ajustar" com ajuste possível gera a coroa ajustada,
// ligada à anterior por parentUid. Só quem gerou a recomendação pode avaliar.
export default defineEventHandler(async (event): Promise<AvaliacaoResposta> => {
  const { email } = await requireLead(event)
  const uid = getRouterParam(event, 'uid') ?? ''
  if (!/^[\da-f-]{36}$/iu.test(uid)) {
    throw createError({ status: 404, message: 'Recomendação não encontrada' })
  }
  const { status, problema } = await validBody(event, avaliacaoSchema)
  if (status === 'ajustada' && !problema) {
    throw createError({ status: 400, message: 'Diga o que aconteceu no furo' })
  }

  const doc = await Recomendacoes.findOne({ uid, email, versao: 2 }, { _id: 0, __v: 0 })
    .lean<RecomendacaoCoroa>()
    .catch(() => failed('Não foi possível ler a recomendação'))
  if (!doc) throw createError({ status: 404, message: 'Recomendação não encontrada' })
  if (doc.status !== 'aguardando') {
    throw createError({ status: 409, message: 'Esta coroa já foi avaliada' })
  }

  const avaliadoEm = new Date().toISOString()
  const recomendacao: RecomendacaoCoroa = {
    ...doc,
    status,
    problema: problema ?? null,
    avaliadoEm,
  }

  let ajustada: RecomendacaoCoroa | null = null
  if (status === 'ajustada' && problema) {
    const input = inputFromEntrada(doc.entrada)
    const rec = recommendCrown(input)
    if (rec && !feedbackDeadEnd(rec, problema)) {
      ajustada = buildCoroa(email, applyFeedback(input, problema).input, uid)
    }
  }

  await Recomendacoes.updateOne(
    { uid, email },
    { status, problema: problema ?? null, avaliadoEm },
  ).catch(() => failed('Não foi possível salvar a avaliação'))
  if (ajustada) {
    await new Recomendacoes(ajustada)
      .save()
      .catch(() => failed('Não foi possível salvar a coroa ajustada'))
  }

  return { recomendacao, ajustada }
})
