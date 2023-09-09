<template>
  <aside class="sidebar-menu d-none d-xl-block sticky-top border-right border-dark">
    <div class="pl-3 pr-2 py-3">
      <h2 class="h6 mb-4">Filter by</h2>

      <ul v-for="(menu, index) in menuFilters" :key="index" class="sidebar-menu__filters m-0 pr-2">
        <li :class="`sidebar-menu__filter-${menu.code}`">
          <h3 class="font-13 text-muted ml-2" v-if="menu.code !== 'main'">
            {{ menu.title }}
          </h3>

          <ul class="sidebar-menu__filter-items">
            <li
              v-for="(menuItem, index) in menu.items"
              :key="index"
              :class="{'rounded': true, 'active': menuItem.active }"
            >
              <router-link :to="menuItem.url" class="d-flex align-items-center font-14 px-2">
                <span
                  :class="menuItem.icon"
                  :style="menuItem.iconColor ? `background-color: ${menuItem.iconColor}` : ''"
                ></span>

                <div class="d-flex w-100 justify-content-between pl-3">
                  <span>{{ menuItem.title }}</span>
                  <span v-if="menuItem.count" class="count text-center px-2">
                    {{ menuItem.count }}
                  </span>
                </div>
              </router-link>
            </li>
          </ul>
        </li>

        <hr v-if="index < menuFilters.length -1" class="mt-2 mb-3 bg-dark">
      </ul>
    </div>
  </aside>
</template>

<script>
import { useGithubRepositorySearchStore } from '@/stores/github/repository/search';
import { mapState } from 'pinia';

export default {
  data: () => ({ }),
  computed: {
    ...mapState(useGithubRepositorySearchStore, ['repositoriesCountFormatted']),
    menuFilters() {
      return [
        {
          code: 'main',
          title: 'Principal',
          items: [
            {
              title: 'Code',
              icon: 'fa-solid fa-code',
              count: '...',
              url: '#',
              active: false
            },
            {
              title: 'Repositories',
              icon: 'fa-solid fa-box-open',
              count: this.repositoriesCountFormatted,
              url: '#',
              active: true
            },
            {
              title: 'Issues',
              icon: 'fa-regular fa-circle-dot',
              count: '...',
              url: '#',
              active: false
            },
            {
              title: 'Pull requests',
              icon: 'fa-solid fa-code-pull-request',
              count: '...',
              url: '#',
              active: false
            },
            {
              title: 'Discussions',
              icon: 'fa-regular fa-message',
              count: '...',
              url: '#',
              active: false
            },
            {
              title: 'Users',
              icon: 'fa-solid fa-user-group',
              count: '...',
              url: '#',
              active: false
            },
            {
              title: 'More',
              icon: 'fa-solid fa-angle-down',
              url: '#',
              active: false
            },
          ]
        },
        {
          code: 'languages',
          title: 'Languages',
          items: [
            {
              title: 'JavaScript',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(241, 224, 90)',
              active: false
            },
            {
              title: 'TypeScript',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(49, 120, 198)',
              active: false
            },
            {
              title: 'HTML',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(227, 76, 38)',
              active: false
            },
            {
              title: 'CSS',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(86, 61, 124)',
              active: false
            },
            {
              title: 'C',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(243, 75, 125)',
              active: false
            },
            {
              title: 'C++',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(243, 75, 125)',
              active: false
            },
            {
              title: 'C#',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(243, 75, 125)',
              active: false
            },
            {
              title: 'EJS',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(169, 30, 80)',
              active: false
            },
            {
              title: 'Python',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(53, 114, 165)',
              active: false
            },
            {
              title: 'Shell',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(137, 224, 81)',
              active: false
            },
            {
              title: 'Dockerfile',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(56, 77, 84)',
              active: false
            },
            {
              title: 'Java',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(176, 114, 25)',
              active: false
            },
            {
              title: 'PHP',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(49, 120, 198)',
              active: false
            },
            {
              title: 'Assembly',
              icon: 'circle',
              url: '#',
              iconColor: 'rgb(137, 224, 81)',
              active: false
            },
          ]
        }
      ];
    }
  }
}
</script>

<style scoped>
.sidebar-menu {
  min-width: 297px;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-menu__filter-items li.active,
.sidebar-menu__filter-items li:hover {
  background-color: var(--secundary-color-background-dark);
}

.sidebar-menu__filter-items li a {
  padding-top: 6px;
  padding-bottom: 6px;
  color: var(--primary-color-light);
}

.sidebar-menu__filter-items li .circle {
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
  width: 10px;
  height: 10px;
}

.sidebar-menu__filter-items li a svg {
  color: rgb(125, 133, 144);
}

.sidebar-menu__filter-items li .count {
  height: 20px;
  min-width: 30px;
  background-color: rgba(110, 118, 129, 0.4);
  font-size: 11.5px;
  padding-top: 2px;
  border-radius: 10px;
}
</style>