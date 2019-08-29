const { getUserId } = require('./../utils')
const moment = require('moment')

function accounts (_, args, ctx, info) {

  const userId = getUserId(ctx)
  return ctx.db.query.accounts({
    where: {
      OR: [
        {
          user: {
            id: userId
          }
        },
        {
          user: null
        }
      ]
    },
    orderBy: "description_ASC"
  }, info)

}

function categories (_, { operation }, ctx, info) {
  
  const userId = getUserId(ctx)

  let AND = [
    {
      OR: [
        { user: { id: userId } },
        { user: null }
      ]
    },
  ]

  AND = !operation ? AND :[ ...AND, { operation: operation }]


  return ctx.db.query.categories({
    where: { AND },
    orderBy: "description_ASC"
  }, info)

}

function records (_, { month, type, accountsIds, categoriesIds }, ctx, info) {

  const userId = getUserId(ctx)

  let AND = [ { user: { id: userId } } ]

  //Verifica se tem Operation para filtrar
  AND = !type ? AND : [ ...AND, { type } ]

  //Verifica se tem Accounts para filtrar
  AND = !accountsIds || accountsIds.length === 0
    ? AND
    : [
      ...AND,
      { OR: accountsIds.map(id => ({ account: { id } })) }
    ]
  
  //Verifica se tem Categories para filtrar
  AND = !categoriesIds || categoriesIds.length === 0
    ? AND
    : [
      ...AND,
      { OR: categoriesIds.map(id => ({ category: { id } })) }
    ]
  
  //Verifica se tem Data para filtrar
  if (month) {
    const date = moment(month, 'MM-YYYY')
    const startDate = date.startOf('month').toISOString()
    const endDate = date.endOf('month').toISOString();

    AND = [
      ...AND,
      {date_gte: startDate},
      {date_lte: endDate}
    ]
  }

  return ctx.db.query.records({
    where: { AND },
    orderBy: "date_ASC"
  }, info)

}

function totalBalance (_, { date }, ctx, info) {

  const userId = getUserId(ctx)
  const dateISO = moment(date, 'YYYY-MM-DD').endOf('day').toISOString()
  const pgSchema = `${process.env.PRISMA_SERVICE}$${process.env.PRISMA_STAGE}`

  const mutation = `
    mutation TotalBalance($database: PrismaDatabase, $query: String!) {
      executeRaw(database: $database, query: $query)
    }
  `

  const variables = {
    database: 'default',
    query: `
    SELECT 
      SUM ("${pgSchema}"."Record"."amount") AS totalbalance
    FROM
      "${pgSchema}"."Record"
    INNER JOIN 
      "${pgSchema}"."_RecordToUser"
    ON 
      "${pgSchema}"."_RecordToUser"."A" = "${pgSchema}"."Record"."id"
    WHERE
      "${pgSchema}"."_RecordToUser"."B" = '${userId}'
    AND 
      "${pgSchema}"."Record"."date" <= '${dateISO}'
    `
  }

  return ctx.prisma.$graphql(mutation, variables)
    .then(response => {
      const totalBalance = response.executeRaw[0].totalbalance
      return totalBalance ? totalBalance : 0
    })

}

function user (_, args, ctx, info) {

  const userId = getUserId(ctx)
  return ctx.db.query.user({ where: { id: userId }}, info)

}

module.exports = {
  accounts,
  categories,
  records,
  totalBalance,
  user
}