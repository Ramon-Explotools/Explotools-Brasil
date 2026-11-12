// Exclui uma recomendação (teste ou registro errado). Só administradores.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const uid = getRouterParam(event, 'uid') ?? ''
  if (!/^[\da-f-]{36}$/iu.test(uid)) {
    throw createError({ status: 404, message: 'Recomendação não encontrada' })
  }

  const { deletedCount } = await Recomendacoes.deleteOne({ uid }).catch(() =>
    failed('Não foi possível excluir a recomendação'),
  )
  if (!deletedCount) throw createError({ status: 404, message: 'Recomendação não encontrada' })

  return 'Recomendação excluída'
})
