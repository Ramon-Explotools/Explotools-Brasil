export default defineEventHandler(async (event): Promise<RecomendacaoResumo[]> => {
  const { email } = await requireLead(event)

  const recomendacoes = await Recomendacoes.find({ email })
    .select('uid rocha matriz diametro versao status local createdAt')
    .sort({ _id: -1 })
    .limit(20)
    .lean()
    .catch(() => failed('Não foi possível ler as recomendações'))

  return recomendacoes.map((rec) => ({
    uid: rec.uid,
    rocha: rec.rocha ?? '',
    matriz: rec.matriz ?? '',
    diametro: rec.versao === 2 && rec.diametro ? normSize(rec.diametro) : (rec.diametro ?? ''),
    versao: rec.versao ?? 1,
    status: rec.status ?? null,
    local: rec.local ?? null,
    createdAt: rec.createdAt ?? rec._id.getTimestamp().toISOString(),
  }))
})
