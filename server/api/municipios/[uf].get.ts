// Lista pública de municípios de uma UF (IBGE), para a pergunta "Onde fica a sondagem?".
export default defineEventHandler((event): { codigo: number; nome: string }[] => {
  const uf = (getRouterParam(event, 'uf') ?? '').toUpperCase()
  if (!UFS.some((item) => item.sigla === uf)) {
    throw createError({ status: 404, message: 'Estado não encontrado' })
  }
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
  return municipiosDe(uf)
})
