export function municipiosDe(uf: string): { codigo: number; nome: string }[] {
  return (MUNICIPIOS_POR_UF[uf] ?? []).map(([codigo, nome]) => ({ codigo, nome }))
}

export function findMunicipio(uf: string, codigo: number): LocalSondagem | null {
  const found = MUNICIPIOS_POR_UF[uf]?.find(([id]) => id === codigo)
  return found ? { uf, cidade: found[1], codigoIbge: found[0] } : null
}
