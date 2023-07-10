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
          <div class="d-flex">
            <v-card v-for="topic in item.props.title.topics"
                    class="mr-3 pa-2 text-truncate text-center" max-width="8rem" min-width="2rem"
                    rounded flat color="secondary">
              {{topic}}
            </v-card>
          </div>
        </template>
        <template v-slot:item.updated_at="{ item }">
          <div>
            {{ formatDate(item.props.title.updated_at) }}
          </div>
        </template>
        <template v-slot:item.statistics="{ item }">
          <v-row justify="center" class="py-2 ml-1">
            <v-col cols="9">
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
        {title: 'Repository', align: 'start', key: 'full_name', sortable: false, width: '40%'},
        {title: 'Topics', align: 'start', key: 'topics', sortable: false, width: '20%'},
        {title: 'Updated at', align: 'center', key: 'updated_at', sortable: false, width: '20%'},
        {title: 'Statistics', align: 'center', key: 'statistics', sortable: false, width: '20%'},
      ],
      repositories: [
        {
          id: 2126244,
          node_id: "MDEwOlJlcG9zaXRvcnkyMTI2MjQ0",
          name: "bootstrap",
          full_name: "twbs/bootstrap",
          private: false,
          owner: {
            login: "twbs",
            id: 2918581,
            node_id: "MDEyOk9yZ2FuaXphdGlvbjI5MTg1ODE=",
            avatar_url: "https://avatars.githubusercontent.com/u/2918581?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/twbs",
            html_url: "https://github.com/twbs",
            followers_url: "https://api.github.com/users/twbs/followers",
            following_url: "https://api.github.com/users/twbs/following{/other_user}",
            gists_url: "https://api.github.com/users/twbs/gists{/gist_id}",
            starred_url: "https://api.github.com/users/twbs/starred{/owner}{/repo}",
            subscriptions_url: "https://api.github.com/users/twbs/subscriptions",
            organizations_url: "https://api.github.com/users/twbs/orgs",
            repos_url: "https://api.github.com/users/twbs/repos",
            events_url: "https://api.github.com/users/twbs/events{/privacy}",
            received_events_url: "https://api.github.com/users/twbs/received_events",
            type: "Organization",
            site_admin: false
          },
          html_url: "https://github.com/twbs/bootstrap",
          description: "The most popular HTML, CSS, and JavaScript framework for developing responsive, mobile first projects on the web.",
          fork: false,
          url: "https://api.github.com/repos/twbs/bootstrap",
          forks_url: "https://api.github.com/repos/twbs/bootstrap/forks",
          keys_url: "https://api.github.com/repos/twbs/bootstrap/keys{/key_id}",
          collaborators_url: "https://api.github.com/repos/twbs/bootstrap/collaborators{/collaborator}",
          teams_url: "https://api.github.com/repos/twbs/bootstrap/teams",
          hooks_url: "https://api.github.com/repos/twbs/bootstrap/hooks",
          issue_events_url: "https://api.github.com/repos/twbs/bootstrap/issues/events{/number}",
          events_url: "https://api.github.com/repos/twbs/bootstrap/events",
          assignees_url: "https://api.github.com/repos/twbs/bootstrap/assignees{/user}",
          branches_url: "https://api.github.com/repos/twbs/bootstrap/branches{/branch}",
          tags_url: "https://api.github.com/repos/twbs/bootstrap/tags",
          blobs_url: "https://api.github.com/repos/twbs/bootstrap/git/blobs{/sha}",
          git_tags_url: "https://api.github.com/repos/twbs/bootstrap/git/tags{/sha}",
          git_refs_url: "https://api.github.com/repos/twbs/bootstrap/git/refs{/sha}",
          trees_url: "https://api.github.com/repos/twbs/bootstrap/git/trees{/sha}",
          statuses_url: "https://api.github.com/repos/twbs/bootstrap/statuses/{sha}",
          languages_url: "https://api.github.com/repos/twbs/bootstrap/languages",
          stargazers_url: "https://api.github.com/repos/twbs/bootstrap/stargazers",
          contributors_url: "https://api.github.com/repos/twbs/bootstrap/contributors",
          subscribers_url: "https://api.github.com/repos/twbs/bootstrap/subscribers",
          subscription_url: "https://api.github.com/repos/twbs/bootstrap/subscription",
          commits_url: "https://api.github.com/repos/twbs/bootstrap/commits{/sha}",
          git_commits_url: "https://api.github.com/repos/twbs/bootstrap/git/commits{/sha}",
          comments_url: "https://api.github.com/repos/twbs/bootstrap/comments{/number}",
          issue_comment_url: "https://api.github.com/repos/twbs/bootstrap/issues/comments{/number}",
          contents_url: "https://api.github.com/repos/twbs/bootstrap/contents/{+path}",
          compare_url: "https://api.github.com/repos/twbs/bootstrap/compare/{base}...{head}",
          merges_url: "https://api.github.com/repos/twbs/bootstrap/merges",
          archive_url: "https://api.github.com/repos/twbs/bootstrap/{archive_format}{/ref}",
          downloads_url: "https://api.github.com/repos/twbs/bootstrap/downloads",
          issues_url: "https://api.github.com/repos/twbs/bootstrap/issues{/number}",
          pulls_url: "https://api.github.com/repos/twbs/bootstrap/pulls{/number}",
          milestones_url: "https://api.github.com/repos/twbs/bootstrap/milestones{/number}",
          notifications_url: "https://api.github.com/repos/twbs/bootstrap/notifications{?since,all,participating}",
          labels_url: "https://api.github.com/repos/twbs/bootstrap/labels{/name}",
          releases_url: "https://api.github.com/repos/twbs/bootstrap/releases{/id}",
          deployments_url: "https://api.github.com/repos/twbs/bootstrap/deployments",
          created_at: "2011-07-29T21:19:00Z",
          updated_at: "2023-07-10T11:29:22Z",
          pushed_at: "2023-07-10T10:25:59Z",
          git_url: "git://github.com/twbs/bootstrap.git",
          ssh_url: "git@github.com:twbs/bootstrap.git",
          clone_url: "https://github.com/twbs/bootstrap.git",
          svn_url: "https://github.com/twbs/bootstrap",
          homepage: "https://getbootstrap.com",
          size: 232526,
          stargazers_count: 164517,
          watchers_count: 164517,
          language: "JavaScript",
          has_issues: true,
          has_projects: true,
          has_downloads: true,
          has_wiki: false,
          has_pages: true,
          has_discussions: true,
          forks_count: 78658,
          mirror_url: null,
          archived: false,
          disabled: false,
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
