const errorHandler = (err, vm, info) => {
  console.log('Vue [Error handler]: ', err, info)
  const jwtErrors = [
    'jwt malformed',
    'jwt expired',
    'jwt not active',
    'invalid token'
  ]

  if (jwtErrors.some(jwtError => err.message.includes(jwtError))) {
    vm.$router.push({
      path: '/login',
      query: { redirect: vm.$route.path }
    })
  }
}

// Formatação de Erros
const formatError = message => {
  const messageSplit = message.split(':')
  return messageSplit[messageSplit.length - 1].trim()
}

// Agrupar por algum parametro
const groupBy = (array, key, makeCurrentKey) => {
  return array.reduce((accumulated, item) => {
    const currentKey = makeCurrentKey(item, key)
    return {
      ...accumulated,
      [currentKey]: [
        ...(accumulated[currentKey] || []),
        item
      ]
    }
  }, {})
}

// Internacionalização de moedas
const currencyFormatter = ({ locale, currency } = { locale: 'pt-BR', currency: 'BRL' }) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  })
}

export {
  currencyFormatter,
  groupBy,
  errorHandler,
  formatError
}
