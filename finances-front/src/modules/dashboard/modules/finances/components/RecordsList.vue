<template>
  <div>

    <TotalBalance class="mb-2" />

    <ToolbarByMonth
      class="mb-2"
      format="MM-YYYY"
      @month="changeMonth"
      :color="toolbarColor"
      :month="$route.query.month"
      :showSlot="true"
    >
      <RecordsFilter @filter="filter" />
    </ToolbarByMonth>

    <v-card>

      <!-- Lista = 0 -->
      <v-card-text
        v-if="mappedRecordsLength === 0"
        class="flex-center"
      >
        <v-icon
          size="100"
          color="grey"
        >
          assignment

        </v-icon>
        <p class="font-weight-light subheading grey--text">
          Nenhum lançamento no período
        </p>
      </v-card-text>

      <!-- Lista de Lançamentos -->
      <v-list
        v-else
        two-line
        subheader
      >
        <template v-for="(recordsMap, date, index) in mappedRecords">
          <v-subheader :key="date">{{ date }}</v-subheader>
          <RecordsListItem
            v-for="record in recordsMap"
            :key="record.id"
            :record="record"
          />
          <v-divider
            :key="`${date}-${index}`"
            v-if="showDivider(index, mappedRecords)"
          ></v-divider>
        </template>
      </v-list>

      <v-footer class="pa-2">
        <v-layout
          justify-end
          row
          mr-2
        >
          <h3 class="font-weight-light">
            <span>Saldo do mês:</span>
            <strong
              class="ml-5"
              :class="amountColor(totalAmount)"
            >{{formatCurrency(totalAmount)}}</strong>
          </h3>
        </v-layout>
      </v-footer>
    </v-card>

  </div>
</template>

<script>

import moment from 'moment'
import { Subject } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { createNamespacedHelpers } from 'vuex'
import { groupBy } from '@/utils'
import amountColorMixin from './../mixins/amount-color'
import formatCurrencyMixin from '@/mixins/format-currency'
import RecordsFilter from './RecordsFilter.vue'
import RecordsListItem from './RecordsListItem.vue'
import RecordsService from './../services/records-service'
import ToolbarByMonth from './ToolbarByMonth.vue'
import TotalBalance from './TotalBalance.vue'

const { mapState, mapActions } = createNamespacedHelpers('finances')

export default {
  name: 'RecordsList',
  components: {
    RecordsFilter,
    RecordsListItem,
    ToolbarByMonth,
    TotalBalance
  },
  mixins: [
    amountColorMixin,
    formatCurrencyMixin
  ],
  data: () => ({
    records: [],
    filtersSubject$: new Subject(),
    subscriptions: []
  }),
  computed: {
    ...mapState(['filters', 'month']),
    mappedRecords () {
      return groupBy(this.records, 'date', (record, dateKey) => {
        return moment(record[dateKey].substr(0, 10)).format('DD/MM/YYYY')
      })
    },
    mappedRecordsLength () {
      return Object.keys(this.mappedRecords).length
    },
    totalAmount () {
      return this.records.reduce((sum, record) => sum + record.amount, 0)
    },
    toolbarColor () {
      return this.totalAmount < 0 ? 'error' : 'primary'
    }
  },
  created () {
    this.setRecords()
  },
  destroyed () {
    this.subscriptions.forEach(s => s.unsubscribe())
  },
  methods: {
    ...mapActions(['setMonth']),
    changeMonth (month) {
      this.$router.push({
        path: this.$route.path,
        query: { month: month }
      })
      this.setMonth({ month })
      this.filter()
    },
    filter () {
      this.filtersSubject$.next({
        month: this.month,
        ...this.filters
      })
    },
    setRecords () {
      this.subscriptions.push(
        this.filtersSubject$
          .pipe(
            mergeMap((variables) => RecordsService.records(variables))
          ).subscribe(records => (this.records = records))
      )
    },
    showDivider (index, object) {
      return index < Object.keys(object).length - 1
    }
  }
}
</script>
<style lang="scss" scoped>
.flex-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
