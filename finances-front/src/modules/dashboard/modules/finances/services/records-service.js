import apollo from '@/plugins/apollo'
import moment from 'moment'
import { from } from 'rxjs'
import { map } from 'rxjs/operators'

import RecordCreateMutation from './../graphql/RecordCreate.gql'
import RecordsQuery from './../graphql/Records.gql'
import TotalBalanceQuery from './../graphql/TotalBalance.gql'

const createRecord = async variables => {
  const response = await apollo.mutate({
    mutation: RecordCreateMutation,
    variables,
    update: (proxy, { data: { createRecord } }) => {
      // RECORDS
      const month = moment(createRecord.date.substr(0, 10)).format('MM-YYYY')
      const variables = { month }

      try {
        // Leitura da query
        const recordsData = proxy.readQuery({
          query: RecordsQuery,
          variables
        })

        // Inserindo nova record
        recordsData.records = [...recordsData.records, createRecord]

        // Reescrevendo a query com os novos parametro
        proxy.writeQuery({
          query: RecordsQuery,
          variables,
          data: recordsData
        })
      } catch (e) {
        console.log('Query "Records" has not been read yet!', e)
      }

      // TOTAL BALANCE
      try {
        const currentDate = moment().endOf('day')
        const recordDate = moment(createRecord.date.substr(0, 10))
        const variables = { date: currentDate.format('YYYY-MM-DD') }

        if (recordDate.isBefore(currentDate)) {
          // Leitura da query
          const totalBalanceData = proxy.readQuery({
            query: TotalBalanceQuery,
            variables
          })

          // Inserindo novo valor
          totalBalanceData.totalBalance = +(totalBalanceData.totalBalance + createRecord.amount).toFixed(2)

          // Reescrevendo a query com os novos parametro
          proxy.writeQuery({
            query: TotalBalanceQuery,
            variables,
            data: totalBalanceData
          })
        }
      } catch (e) {
        console.log('Query "otalBalance" has not been read yet!', e)
      }
    }
  })

  return response.data.createRecord
}

// Usando RxJs
const records = variables => {
  const queryRef = apollo.watchQuery({
    query: RecordsQuery,
    variables
  })
  return from(queryRef)
    .pipe(
      map(res => res.data.records)
    )
}

const totalBalance = async () => {
  const response = await apollo.query({
    query: TotalBalanceQuery,
    variables: {
      date: moment().format('YYYY-MM-DD')
    }
  })
  return response.data.totalBalance
}

export default {
  createRecord,
  records,
  totalBalance
}
