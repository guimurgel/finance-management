<template>
  <v-container text-xs-center>
    <v-layout
      row
      wrap
    >

      <v-flex
        xs12
        sm6
        md4
        lg4
      >

        <NumericDisplay
          :color="color"
          v-model="$v.record.amount.$model"
        />

      </v-flex>

      <v-flex
        xs12
        sm6
        md8
        lg8
      >

        <!-- Formulario -->
        <v-card>
          <v-card-text>
            <v-form>

              <!-- Date -->
              <v-dialog
                ref="dateDialog"
                :return-value.sync="record.date"
                v-model="showDateDialog"
                persistent
                width="290px"
                full-width
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    name="date"
                    label="Vencimento"
                    prepend-icon="event"
                    type="text"
                    readonly
                    :value="formatedDate"
                    v-on="on"
                  ></v-text-field>
                </template>
                <!-- Date Picker -->
                <v-date-picker
                  :color="color"
                  locale="pt-br"
                  scrollable
                  v-model="dateDialogValue"
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    :color="color"
                    @click="cancelDateDialog"
                  >Cancelar</v-btn>
                  <v-btn
                    text
                    :color="color"
                    @click="$refs.dateDialog.save(dateDialogValue)"
                  >OK</v-btn>
                </v-date-picker>
              </v-dialog>

              <!-- Account -->
              <v-select
                name="account"
                label="Conta"
                prepend-icon="account_balance"
                :items="accounts"
                item-text="description"
                item-value="id"
                v-model="$v.record.accountId.$model"
              >
                <v-list-item
                  slot="prepend-item"
                  ripple
                  @click=""
                >
                  <v-list-item-action>
                    <v-icon>add</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>
                    Conta
                  </v-list-item-title>
                </v-list-item>
                <v-divider
                  slot="prepend-item"
                  class="mt-2"
                >
                </v-divider>
              </v-select>

              <!-- Category -->
              <v-select
                name="category"
                label="Categoria"
                prepend-icon="class"
                :items="categories"
                item-text="description"
                item-value="id"
                v-model="$v.record.categoryId.$model"
              >
                <v-list-item
                  slot="prepend-item"
                  ripple
                  @click=""
                >
                  <v-list-item-action>
                    <v-icon>add</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>
                    Categoria
                  </v-list-item-title>
                </v-list-item>
                <v-divider
                  slot="prepend-item"
                  class="mt-2"
                >
                </v-divider>
              </v-select>

              <!-- Description -->
              <v-text-field
                name="description"
                label="Descrição"
                prepend-icon="description"
                type="text"
                v-model.trim="$v.record.description.$model"
              ></v-text-field>

              <!-- Tags -->
              <v-text-field
                v-show="showTagsInput"
                name="tags"
                label="Tags (separadas por virgula)"
                prepend-icon="label"
                type="text"
                v-model.trim="record.tags"
              ></v-text-field>

              <!-- Note -->
              <v-text-field
                v-show="showNoteInput"
                name="note"
                label="Observação"
                prepend-icon="note"
                type="text"
                v-model.trim="record.note"
              ></v-text-field>

            </v-form>

            <v-layout class="flex-center mt-4">
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    smmal
                    class="mr-3"
                    v-on="on"
                    @click="showTagsInput= !showTagsInput"
                  >
                    <v-icon :color="color">label</v-icon>
                  </v-btn>
                </template>
                <span>Adicionar Tags</span>
              </v-tooltip>

              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    smmal
                    v-on="on"
                    @click="showNoteInput= !showNoteInput"
                  >
                    <v-icon :color="color">note</v-icon>
                  </v-btn>
                </template>
                <span>Observação</span>
              </v-tooltip>

            </v-layout>

          </v-card-text>
        </v-card>

        <v-layout class="flex-center mt-4">
          <!-- BTN - Cancelar -->
          <v-btn
            color="secondary"
            large
            fab
            @click="$router.back()"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <!-- BTN - Enviar -->
          <v-btn
            :color="color"
            large
            fab
            @click="submit"
            :disabled="$v.$invalid"
          >
            <v-icon>check</v-icon>
          </v-btn>
        </v-layout>

      </v-flex>

    </v-layout>
  </v-container>
</template>

<script>

import moment from 'moment'
import { decimal, minLength, required } from 'vuelidate/lib/validators'
import { mapActions } from 'vuex'

import AccountsService from './../services/accounts-service'
import CategoriesService from './../services/categories-service'
import NumericDisplay from './../components/NumericDisplay.vue'
import RecordsService from './../services/records-service'

export default {
  name: 'RecordsAdd',
  components: {
    NumericDisplay
  },
  data () {
    return {
      accounts: [],
      categories: [],
      dateDialogValue: moment().format('YYYY-MM-DD'),
      record: {
        type: this.$route.query.type.toUpperCase(),
        amount: 0,
        date: moment().format('YYYY-MM-DD'),
        accountId: '',
        categoryId: '',
        description: '',
        tags: '',
        note: ''
      },
      showDateDialog: false,
      showTagsInput: false,
      showNoteInput: false
    }
  },
  validations: {
    record: {
      type: { required },
      amount: { required, decimal, different: value => value !== 0 },
      date: { required },
      accountId: { required },
      categoryId: { required },
      description: { required, minLength: minLength(6) }
    }
  },
  computed: {
    color () {
      switch (this.record.type) {
        case 'CREDIT':
          return 'primary'
        case 'DEBIT':
          return 'error'
        default:
          return 'primary'
      }
    },
    formatedDate () {
      return moment(this.record.date).format('DD/MM/YYYY')
    }
  },
  async created () {
    this.changeTitle(this.$route.query.type)
    this.accounts = await AccountsService.accounts()
    this.categories = await CategoriesService.categories({ operation: this.$route.query.type })
  },
  async beforeRouteUpdate (to, from, next) {
    const { type } = to.query
    this.changeTitle(type)
    this.record.type = type.toUpperCase()
    this.record.categoryId = ''
    this.categories = await CategoriesService.categories({ operation: type })

    next()
  },
  methods: {
    ...mapActions(['setTitle']),
    cancelDateDialog () {
      this.showDateDialog = false
      this.dateDialogValue = this.record.date
    },
    changeTitle (recordType) {
      let title
      switch (recordType) {
        case 'credit':
          title = 'Nova Receita'
          break
        case 'debit':
          title = 'Nova Despesa'
          break
        default:
          title = 'Novo Lançamento'
          break
      }

      this.setTitle({ title })
    },
    async submit () {
      try {
        const record = await RecordsService.createRecord(this.record)
        console.log('Record: ', record)
        this.$router.push('/dashboard/records')
      } catch (e) {
        console.log('Error creating Record: ', e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.flex-center {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  button {
    margin: 0 10px;
  }
}
</style>
