// Unidades da federação (IBGE). Usadas na pergunta "Onde fica a sondagem?" e no mapa do painel.
export const UFS = [
  { sigla: 'AC', nome: 'Acre', regiao: 'N' },
  { sigla: 'AL', nome: 'Alagoas', regiao: 'NE' },
  { sigla: 'AM', nome: 'Amazonas', regiao: 'N' },
  { sigla: 'AP', nome: 'Amapá', regiao: 'N' },
  { sigla: 'BA', nome: 'Bahia', regiao: 'NE' },
  { sigla: 'CE', nome: 'Ceará', regiao: 'NE' },
  { sigla: 'DF', nome: 'Distrito Federal', regiao: 'CO' },
  { sigla: 'ES', nome: 'Espírito Santo', regiao: 'SE' },
  { sigla: 'GO', nome: 'Goiás', regiao: 'CO' },
  { sigla: 'MA', nome: 'Maranhão', regiao: 'NE' },
  { sigla: 'MG', nome: 'Minas Gerais', regiao: 'SE' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', regiao: 'CO' },
  { sigla: 'MT', nome: 'Mato Grosso', regiao: 'CO' },
  { sigla: 'PA', nome: 'Pará', regiao: 'N' },
  { sigla: 'PB', nome: 'Paraíba', regiao: 'NE' },
  { sigla: 'PE', nome: 'Pernambuco', regiao: 'NE' },
  { sigla: 'PI', nome: 'Piauí', regiao: 'NE' },
  { sigla: 'PR', nome: 'Paraná', regiao: 'S' },
  { sigla: 'RJ', nome: 'Rio de Janeiro', regiao: 'SE' },
  { sigla: 'RN', nome: 'Rio Grande do Norte', regiao: 'NE' },
  { sigla: 'RO', nome: 'Rondônia', regiao: 'N' },
  { sigla: 'RR', nome: 'Roraima', regiao: 'N' },
  { sigla: 'RS', nome: 'Rio Grande do Sul', regiao: 'S' },
  { sigla: 'SC', nome: 'Santa Catarina', regiao: 'S' },
  { sigla: 'SE', nome: 'Sergipe', regiao: 'NE' },
  { sigla: 'SP', nome: 'São Paulo', regiao: 'SE' },
  { sigla: 'TO', nome: 'Tocantins', regiao: 'N' },
] as const

export type UF = (typeof UFS)[number]['sigla']

export const UF_SIGLAS = UFS.map((uf) => uf.sigla)
