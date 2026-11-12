export default defineEventHandler(async (event): Promise<RecomendacaoMongo> => {
  const uid = getRouterParam(event, 'uid') ?? ''
  if (!/^[\da-f-]{36}$/iu.test(uid)) {
    throw createError({ status: 404, message: 'Recomendação não encontrada' })
  }
  await connectDb()

  const rec = await Recomendacoes.findOne({ uid }, { _id: 0, __v: 0 })
    .lean<RecomendacaoMongo>()
    .catch(() => failed('Não foi possível ler a recomendação'))
  if (!rec) throw createError({ status: 404, message: 'Recomendação não encontrada' })

  return rec
})
