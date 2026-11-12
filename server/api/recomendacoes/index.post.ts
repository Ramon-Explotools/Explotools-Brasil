const { recomendacaoSchema } = useRecomendacaoSchema()

export default defineEventHandler(async (event): Promise<RecomendacaoCoroa> => {
  const { email } = await requireLead(event)
  const { rocha, durezaManual, abrasividade, granulometria, diametro, testemunho, uf, municipio } =
    await validBody(event, recomendacaoSchema)

  const rock = findRock(rocha)
  if (rocha && !rock && durezaManual === undefined) {
    throw createError({
      status: 400,
      message: 'Rocha não encontrada. Escolha uma da lista ou defina a dureza manualmente',
    })
  }

  const local = findMunicipio(uf, municipio)
  if (!local) {
    throw createError({ status: 400, message: 'Escolha a cidade da sondagem na lista' })
  }

  const recomendacao = buildCoroa(
    email,
    {
      rock,
      size: diametro,
      cond: testemunho,
      manualH: durezaManual ?? null,
      abra: abrasividade ?? null,
      grain: granulometria ?? null,
    },
    local,
  )

  await new Recomendacoes(recomendacao)
    .save()
    .catch(() => failed('Não foi possível salvar a recomendação'))

  return recomendacao
})
