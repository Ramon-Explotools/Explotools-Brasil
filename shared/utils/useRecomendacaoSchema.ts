// oxlint-disable typescript/explicit-function-return-type typescript/explicit-module-boundary-types harlanzw/vue-no-faux-composables unicorn/max-nested-calls
import {
  integer,
  maxLength,
  maxValue,
  minValue,
  nullish,
  number,
  object,
  optional,
  picklist,
  pipe,
  string,
  trim,
} from 'valibot'
import type { InferInput } from 'valibot'

import { UF_SIGLAS } from './ufs'

export const ABRASIVIDADES = ['low', 'medium', 'high'] as const
export const GRANULOMETRIAS = ['fino', 'medio', 'grosso'] as const
export const DIAMETROS = ['BO', 'NO', 'NO2', 'HO', 'PO'] as const
export const TESTEMUNHOS = ['compacta', 'fraturada', 'friavel'] as const
export const AVALIACOES = ['atendeu', 'ajustada'] as const
export const PROBLEMAS = ['polindo', 'desgaste', 'lavando', 'outro'] as const
export const PRIORIDADES = ['vida', 'avanco'] as const

export function useRecomendacaoSchema() {
  const recomendacaoSchema = object(
    {
      rocha: nullish(pipe(string(), trim(), maxLength(120))),
      durezaManual: nullish(
        pipe(
          number('Defina a dureza'),
          minValue(1.5, 'A dureza vai de 1,5 a 10'),
          maxValue(10, 'A dureza vai de 1,5 a 10'),
        ),
      ),
      abrasividade: nullish(picklist(ABRASIVIDADES, 'Escolha a abrasividade')),
      granulometria: nullish(picklist(GRANULOMETRIAS, 'Escolha a granulometria')),
      diametro: picklist(DIAMETROS, 'Escolha o diâmetro da coroa'),
      testemunho: picklist(TESTEMUNHOS, 'Diga como sai o testemunho'),
      uf: picklist(UF_SIGLAS, 'Escolha o estado da sondagem'),
      municipio: pipe(
        number('Escolha a cidade da sondagem'),
        integer('Escolha a cidade da sondagem'),
      ),
    },
    'Responda as 4 perguntas',
  )

  const avaliacaoSchema = object({
    status: picklist(AVALIACOES, 'Diga se a coroa atendeu'),
    problema: optional(picklist(PROBLEMAS, 'Diga o que aconteceu no furo')),
  })

  const canalSchema = object({
    prioridade: picklist(PRIORIDADES, 'Escolha entre vida útil e avanço'),
  })

  return { recomendacaoSchema, avaliacaoSchema, canalSchema }
}

export type RecomendacaoSchema = InferInput<
  ReturnType<typeof useRecomendacaoSchema>['recomendacaoSchema']
>
export type AvaliacaoSchema = InferInput<
  ReturnType<typeof useRecomendacaoSchema>['avaliacaoSchema']
>
