const { getUserId } = require('./../utils')

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

function records (_, { type, accountsIds, categoriesIds }, ctx, info) {

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

  return ctx.db.query.records({
    where: { AND },
    orderBy: "date_ASC"
  }, info)

}

function user (_, args, ctx, info) {

  const userId = getUserId(ctx)
  return ctx.db.query.user({ where: { id: userId }}, info)

}

module.exports = {
  accounts,
  categories,
  records,
  user
}