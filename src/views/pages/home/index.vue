<template>
  <v-container class="fill-height d-flex justify-center" fluid>
    <v-sheet width="1200" height="100%" flat>
      <v-text-field v-model="query" variant="outlined"
                    @click:append="findAll"
                    @keydown.enter="findAll"
                    append-icon="mdi-magnify" hide-details></v-text-field>
      <v-data-table-server class="mt-6" height="73vh" @click:row="selectRepository"
                           :page="page" :items-length="total_count"
                           :items-per-page="itemsPerPage" @update:options="findAll"
                           :items-per-page-options="itemsPerPageOptions" :loading="loading"
                           :items="repositories.items" :headers="headers">
        <template v-slot:item.full_name="{ item }">
          <v-row align="center" class="py-2">
            <v-col cols="2">
              <v-img :src="item.props.title.owner.avatar_url" width="55">
              </v-img>
            </v-col>
            <v-col cols="10">
              <div class="font-weight-medium text-truncate">{{ item.props.title.full_name }}</div>
              <div class="text-subtitle-2 font-weight-regular">{{ item.props.title.language }}</div>
            </v-col>
          </v-row>
        </template>
        <template v-slot:item.topics="{ item }">
          <v-row no-gutters v-if="item.props.title.topics.length > 0">
            <v-col cols="auto" v-for="topic in item.props.title.topics">
              <v-card class="mr-3 my-1 pa-2 text-truncate text-center" max-width="8rem" min-width="2rem"
                      rounded flat color="secondary">
                <span>{{ topic }}</span>
              </v-card>
            </v-col>
          </v-row>
          <div v-else class="ml-3">
            --
          </div>
        </template>
        <template v-slot:item.updated_at="{ item }">
          <div>
            {{ formatDate(item.props.title.updated_at) }}
          </div>
        </template>
        <template v-slot:item.statistics="{ item }">
          <v-row justify="center" class="py-2">
            <v-col cols="auto">
              <v-sheet color="secondary" width="5rem" rounded="lg"
                       class="pa-1 mb-1 text-subtitle-2 font-weight-regular d-flex justify-sm-space-around align-center">
                <v-icon width="8" class="pr-1">mdi-star</v-icon>
                {{ formatNumber(item.props.title.stargazers_count) }}
              </v-sheet>
              <v-sheet color="secondary" width="5rem" rounded="lg"
                       class="pa-1 text-subtitle-2 font-weight-regular d-flex justify-sm-space-around align-center">
                <v-img src="src/assets/fork.png" height="19" max-width="9">=</v-img>
                {{ formatNumber(item.props.title.forks_count) }}
              </v-sheet>
            </v-col>
          </v-row>
        </template>
      </v-data-table-server>
    </v-sheet>
  </v-container>
</template>

<script>
import date from '@/commons/filter/date'
import number from '@/commons/filter/number'
import repositories from '@/commons/api/repositories'

export default {
  name: 'Repositories',
  data() {
    return {
      loading: false,
      page: 1,
      itemsPerPage: 10,
      total_count: 0,
      itemsPerPageOptions: [
        {value: 10, title: '10'},
        {value: 25, title: '25'},
        {value: 50, title: '50'},
        {value: 100, title: '100'},
      ],
      query: 'bootstrap',
      headers: [
        {title: 'Repository', align: 'start', key: 'full_name', sortable: false, width: '20rem'},
        {title: 'Topics', align: 'start', key: 'topics', sortable: false},
        {title: 'Updated at', align: 'center', key: 'updated_at', sortable: false},
        {title: 'Statistics', align: 'center', key: 'statistics', sortable: false},
      ],
      repositories: []
    }
  },
  methods: {
    formatDate(value) {
      return date.format(value)
    },
    formatNumber(value) {
      return number.format(value)
    },
    async findAll({page, itemsPerPage}) {
      if (this.query.length > 0) {
        this.loading = true
        this.repositories = await repositories.findAll({
          page: page,
          per_page: itemsPerPage
        }, this.query).then(response => {
          this.loading = false
          this.total_count = response.total_count
          return response
        })
      }
    },
    selectRepository(e, repository) {
      window.open(repository.item.props.title.html_url)
    }
  }
}
</script>

<style scoped>

</style>
