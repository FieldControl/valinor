<template>
  <v-container class="fill-height d-flex justify-center" fluid>
    <v-card width="1200" height="100%" flat>
      <v-text-field variant="outlined" append-icon="mdi-magnify" hide-details></v-text-field>
      <v-data-table class="mt-6" :items="repositories" :headers="headers" height="73vh">
        <template v-slot:item.full_name="{ item }">
          <v-row align="center" class="py-2">
            <v-col cols="2">
              <v-img src="https://avatars.githubusercontent.com/u/1530011?s=40&v=4" width="55">
              </v-img>
            </v-col>
            <v-col cols="10">
              <div class="font-weight-medium text-truncate">{{ item.props.title.full_name }}</div>
              <div class="text-subtitle-2 font-weight-regular">{{ item.props.title.language }}</div>
            </v-col>
          </v-row>
        </template>
        <template v-slot:item.topics="{ item }">
            <v-row no-gutters>
              <v-col cols="auto" v-for="topic in item.props.title.topics">
                <v-card class="mr-3 my-1 pa-2 text-truncate text-center" max-width="8rem" min-width="2rem"
                        rounded flat color="secondary">
                  {{topic}}
                </v-card>
              </v-col>
            </v-row>
        </template>
        <template v-slot:item.updated_at="{ item }">
          <div>
            {{ formatDate(item.props.title.updated_at) }}
          </div>
        </template>
        <template v-slot:item.statistics="{ item }">
          <v-row justify="center" class="py-2">
            <v-col cols="auto">
              <v-sheet color="secondary" width="5rem" rounded="lg" class="pa-1 mb-1 text-subtitle-2 font-weight-regular d-flex justify-sm-space-around align-center">
                <v-icon width="8" class="pr-1">mdi-star</v-icon>
                {{ formatNumber(item.props.title.stargazers_count) }}
              </v-sheet>
              <v-sheet color="secondary" width="5rem" rounded="lg" class="pa-1 text-subtitle-2 font-weight-regular d-flex justify-sm-space-around align-center">
                <v-img src="src/assets/fork.png" height="19" max-width="9">=</v-img>
                {{ formatNumber(item.props.title.forks_count) }}
              </v-sheet>
            </v-col>
          </v-row>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import date from '@/commons/filter/date'
import number from '@/commons/filter/number'

export default {
  name: 'Repositories',
  data() {
    return {
      headers: [
        {title: 'Repository', align: 'start', key: 'full_name', sortable: false, width: '20rem'},
        {title: 'Topics', align: 'start', key: 'topics', sortable: false},
        {title: 'Updated at', align: 'center', key: 'updated_at', sortable: false},
        {title: 'Statistics', align: 'center', key: 'statistics', sortable: false},
      ],
      repositories: [
        {
          id: 2126244,
          full_name: "twbs/bootstrap",
          owner: {
            avatar_url: "https://avatars.githubusercontent.com/u/2918581?v=4",
            url: "https://api.github.com/users/twbs",
            starred_url: "https://api.github.com/users/twbs/starred{/owner}{/repo}",
          },
          url: "https://api.github.com/repos/twbs/bootstrap",
          forks_url: "https://api.github.com/repos/twbs/bootstrap/forks",
          languages_url: "https://api.github.com/repos/twbs/bootstrap/languages",
          stargazers_url: "https://api.github.com/repos/twbs/bootstrap/stargazers",
          created_at: "2011-07-29T21:19:00Z",
          updated_at: "2023-07-10T11:29:22Z",
          pushed_at: "2023-07-10T10:25:59Z",
          git_url: "git://github.com/twbs/bootstrap.git",
          size: 232526,
          stargazers_count: 164517,
          watchers_count: 164517,
          language: "JavaScript",
          forks_count: 78658,
          open_issues_count: 419,
          license: {
            key: "mit",
            name: "MIT License",
            spdx_id: "MIT",
            url: "https://api.github.com/licenses/mit",
            node_id: "MDc6TGljZW5zZTEz"
          },
          allow_forking: true,
          is_template: false,
          web_commit_signoff_required: false,
          topics: [
            'bootstrap',
            'css',
            'css-framework',
            'html',
            'javascript',
            'sass',
            'css',
            'css-framework',
            'html',
            'javascript',
            'sass',
            'scss'
          ],
          visibility: "public",
          forks: 78658,
          open_issues: 419,
          watchers: 164517,
          default_branch: "main",
          score: 1.0
        },
      ]
    }
  },
  methods: {
    formatDate(value) {
      return date.format(value)
    },
    formatNumber(value) {
      return number.format(value)
    }
  }
}
</script>

<style scoped>

</style>
