import { randomUUID } from 'node:crypto'

import type { CrownInput } from '#shared/utils/matriz.engine'

// Calcula a coroa e monta o documento da versão 2. Sem dados suficientes: erro 400.
export function buildCoroa(
  email: string,
  input: CrownInput,
  local: LocalSondagem | null,
  parentUid: string | null = null,
): RecomendacaoCoroa {
  const rec = recommendCrown(input)
  if (!rec) {
    throw createError({
      status: 400,
      message: 'Escolha a rocha na lista ou defina a dureza manualmente',
    })
  }
  const entrada = makeEntrada(input, rec)
  return {
    uid: randomUUID(),
    email,
    versao: 2,
    rocha: rec.rock?.n ?? '',
    matriz: rec.matrix.id,
    diametro: rec.size,
    entrada,
    resultado: {
      matriz: rec.matrix.id,
      canal: rec.waterway.type,
      dureza: rec.H,
      classe: rec.cls,
      abrasividade: rec.abra,
      granulometria: rec.grain,
      manual: rec.manual,
    },
    status: 'aguardando',
    problema: null,
    avaliadoEm: null,
    parentUid,
    local,
    createdAt: new Date().toISOString(),
  }
}
