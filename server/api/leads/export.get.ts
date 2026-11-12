import excel from 'exceljs'

const RED = 'FFFE0018'

function yesNo(value: boolean | undefined): string {
  if (value === undefined) return ''
  return value ? 'Sim' : 'Não'
}

// Cidades/UF distintas das sondagens do lead.
function locais(recs: { local?: LocalSondagem | null }[] | undefined): string {
  const nomes = (recs ?? []).flatMap((rec) =>
    rec.local ? [`${rec.local.cidade}/${rec.local.uf}`] : [],
  )
  return [...new Set(nomes)].join(', ')
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const [leads, recomendacoes] = await Promise.all([
    Leads.find().lean(),
    Recomendacoes.find().select('email local').lean(),
  ]).catch(() => failed('Não foi possível ler os cadastros'))

  const total = Map.groupBy(recomendacoes, (rec) => rec.email)

  const workbook = new excel.Workbook()
  workbook.creator = 'Explotools Brasil'
  const sheet = workbook.addWorksheet('Leads', { views: [{ state: 'frozen', ySplit: 1 }] })

  sheet.columns = [
    { header: 'Nome', key: 'nome', width: 32 },
    { header: 'E-mail', key: 'email', width: 34 },
    { header: 'Telefone', key: 'telefone', width: 18 },
    { header: 'Empresa', key: 'empresa', width: 26 },
    { header: 'Cargo', key: 'cargo', width: 22 },
    { header: 'Wireline', key: 'wireline', width: 10 },
    { header: 'Recomendações', key: 'recomendacoes', width: 16 },
    { header: 'Locais das sondagens', key: 'locais', width: 34 },
    { header: 'Cadastro', key: 'createdAt', width: 20 },
    { header: 'Último acesso', key: 'lastAccess', width: 20 },
  ]

  sheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RED } }
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  })

  for (const lead of leads) {
    sheet.addRow({
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      empresa: lead.empresa,
      cargo: lead.cargo,
      wireline: yesNo(lead.wireline),
      recomendacoes: total.get(lead.email)?.length ?? 0,
      locais: locais(total.get(lead.email)),
      createdAt: lead.createdAt ? new Date(lead.createdAt) : lead._id.getTimestamp(),
      lastAccess: lead.lastAccess ? new Date(lead.lastAccess) : '',
    })
  }

  sheet.getColumn('createdAt').numFmt = 'dd/mm/yyyy hh:mm'
  sheet.getColumn('lastAccess').numFmt = 'dd/mm/yyyy hh:mm'
  sheet.autoFilter = { from: 'A1', to: 'J1' }

  const buffer = await workbook.xlsx.writeBuffer()
  const day = new Date().toISOString().slice(0, 10)

  setResponseHeaders(event, {
    'Content-Disposition': `attachment; filename=explotools-leads-${day}.xlsx`,
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  return Buffer.from(buffer)
})
