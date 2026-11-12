// Onde as coroas estão sendo recomendadas: totais por estado, cidades e rochas. Só administradores.
const PERIODOS: Record<string, number> = { '30': 30, '90': 90, '365': 365 }

export default defineEventHandler(async (event): Promise<MapaResumo> => {
  await requireAdmin(event)
  const { periodo } = getQuery(event)
  const dias = typeof periodo === 'string' ? PERIODOS[periodo] : undefined
  const desde = dias ? new Date(Date.now() - dias * 86_400_000).toISOString() : ''

  const recomendacoes = await Recomendacoes.find({
    versao: 2,
    ...(desde ? { createdAt: { $gte: desde } } : {}),
  })
    .select('local rocha')
    .lean()
    .catch(() => failed('Não foi possível ler as recomendações'))

  const porUf = new Map<string, number>()
  const cidades = new Map<number, { uf: string; cidade: string; total: number }>()
  const rochas = new Map<string, Map<string, number>>()
  let semLocal = 0
  for (const rec of recomendacoes) {
    const { local } = rec
    if (local?.uf) {
      porUf.set(local.uf, (porUf.get(local.uf) ?? 0) + 1)
      const cidade = cidades.get(local.codigoIbge) ?? {
        uf: local.uf,
        cidade: local.cidade,
        total: 0,
      }
      cidade.total += 1
      cidades.set(local.codigoIbge, cidade)
      const nome = rec.rocha ?? ''
      const rocha = nome === '' ? 'Rocha não listada' : nome
      const daUf = rochas.get(local.uf) ?? new Map<string, number>()
      daUf.set(rocha, (daUf.get(rocha) ?? 0) + 1)
      rochas.set(local.uf, daUf)
    } else {
      semLocal += 1
    }
  }

  return {
    total: recomendacoes.length,
    semLocal,
    porUf: [...porUf].map(([uf, total]) => ({ uf, total })).toSorted((a, b) => b.total - a.total),
    cidades: [...cidades.values()].toSorted((a, b) => b.total - a.total).slice(0, 15),
    rochasPorUf: Object.fromEntries(
      [...rochas].map(([uf, mapa]) => [
        uf,
        [...mapa]
          .map(([rocha, total]) => ({ rocha, total }))
          .toSorted((a, b) => b.total - a.total)
          .slice(0, 3),
      ]),
    ),
  }
})
