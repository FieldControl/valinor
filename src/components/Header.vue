<template>
  <header class="header-main p-1">
    <nav class="navbar align-items-center navbar-expand-lg navbar-dark rounded">
      <div class="header-main__sign d-lg-none navbar-buttons">
        <router-link to="#" class="btn btn-sm btn-outline-light">Sign up</router-link>
      </div>
        
      <router-link class="navbar-brand" to="/">
        <img src="@/assets/images/logotipo-github-white.png" alt="Logo Github">
      </router-link>

      <div class="d-lg-none">
        <ToggleMenu @toggle="value => menuMobileActive = value" />
      </div>

      <!-- Menu items -->
      <div class="navbar-collapse" :class="{'navbar-show': menuMobileActive}">
        <ul class="col-auto navbar-nav">
          <li v-for="(item, index) in menuItems" :key="index" class="nav-item active mt-3 mt-lg-0">
            <router-link :class="{ 'nav-link': true, 'ml-lg-3': index > 0 }" :to="item.path">
              {{ item.title }}
            </router-link>
          </li>
        </ul>

        <SearchInput
          class="col px-0 mt-4 mt-lg-0"
          :value="$route.params.searchTerm"
          @search="setSearchTerm"
          @focus="showModalSearch = !showModalSearch"
        />

        <div class="header-main__sign col-auto navbar-buttons d-lg-flex p-0 pl-lg-3">
          <router-link to="#" id="btn-signin" class="btn-sm text-light d-none d-lg-block">Sign in</router-link>
          <router-link
            to="#"
            id="btn-signin-mobile"
            class="btn bg-dark--secundary text-light d-flex d-lg-none justify-content-center mt-3 py-2"
          >
            Sign in
          </router-link>
          <router-link to="#" id="btn-signup" class="btn btn-sm btn-outline-light d-none d-lg-inline-block ml-2 text-light">Sign up</router-link>
        </div>
      </div>
    </nav>

    <!-- Modal Search -->
    <modal-dialog :show="showModalSearch" @close="showModalSearch = false" id="modal-search">
      <div class="col-lg-11 p-0 mx-lg-auto bg-light text-dark">
        <div class="pt-3 px-3">
          <SearchInput
            :value="$route.params.searchTerm"
            @search="setSearchTerm"
            @input="setSearchInputValue"
          />

          <div class="search-apresentation pt-3" v-if="searchInputValue.length > 0">
            <ul class="search-apresentation__items mb-0" >
              <li class="search-apresentation__item">
                <div @click="setSearchTerm(searchInputValue)" class="d-flex text-primary justify-content-between align-items-center p-2">
                  <p class="m-0 font-15">
                    <span class="fa-solid fa-magnifying-glass text-muted"></span>
                    <span class="ml-2 text-dark">{{ searchInputValue }}</span>
                  </p>

                  <span class="search-all font-15 text-muted">Search all of GitHub</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <hr class="mt-3 mb-1">

        <div class="search-syntax pt-1 pb-2 px-4">
          <a href="#" class="font-12">Search syntax tips</a>
        </div>
      </div>
    </modal-dialog>
  </header>
</template>

<script>
import SearchInput from "@/components/Form/SearchInput.vue";
import ModalDialog from "@/components/ModalDialog.vue";
import ToggleMenu from "@/components/Icons/ToggleMenu.vue";

export default {
  name: 'Header',
  components: {
    SearchInput,
    ModalDialog,
    ToggleMenu
  },
  data: () => ({
    showModalSearch: false,
    searchInputValue: '',
    menuMobileActive: false,
    menuItems: [
      {
        title: 'Product',
        path: '#',
        subitems: [
          {
            title: 'Teste',
            path: '#',
          }
        ]
      },
      {
        title: 'Solutions',
        path: '#',
      },
      {
        title: 'Open Source',
        path: '#',
      },
      {
        title: 'Pricing',
        path: '#',
      },
    ]
  }),
  mounted() {
    this.searchInputValue = this.$route.params.searchTerm || '';
  },
  methods: {
    setSearchTerm(searchTerm) {
      this.showModalSearch = false;
      this.$router.push({ name: 'searchRepository', params: { searchTerm } });
    },
    setSearchInputValue(value) {
      if(typeof value == 'string') {
        this.searchInputValue = value;
      }
    }
  }
}
</script>

<style>
.header-main {
  background: var(--secundary-color-background-dark);
}

.header-main .navbar-brand img {
  width: 35px;
}

.header-main__sign .btn-outline-light:hover,
.header-main__sign .btn-outline-light:active {
  background: transparent;
  color: var(--primary-color-light);
  opacity: .8;
  transition: opacity .3s;
}

#btn-signin,
#btn-signup {
  font-size: 16px;
  border-radius: 6px;
}

#btn-signup:active {
  background: transparent;
}

#btn-signup:focus {
  box-shadow: none;
}

@media (max-width: 1024px) {
  .header-main .navbar-collapse {
    position: fixed;
    background: var(--primary-color-light);
    width: 100vw;
    height: 85vh;
    top: 35px;
    left: 50px;
    z-index: 9;
    border-radius: 6px 0 0 6px;
    padding: 12px 30px;
    visibility: hidden;
  }

  .header-main .navbar-collapse.navbar-show {
    opacity: 1;
    top: 73px;
    left: 17px;
    visibility: visible;
    transition: top .5s, left .3s, visibility .2s;
  }

  .header-main .navbar-collapse .nav-link {
    color: var(--primary-color-black) !important;
    font-size: 20px;
    font-weight: 600;
  }

  #btn-signin-mobile {
    font-weight: 600;
  }

  .header-main .search-input input {
    color: var(--primary-color-black) !important;
  }

  .search-apresentation__item .search-all {
    font-size: 14px
  }
}

/* MODAL SEARCH */
#modal-search div:first-child {
  border-radius: 10px;
}

#modal-search .input-group-prepend {
  top: 5px;
}

#modal-search input {
  color: var(--primary-color-black) !important;
  height: 37px;
}

#modal-search .search-apresentation__item {
  border-radius: 7px;
}

#modal-search .search-apresentation__item:hover {
  background: var(--primary-color-gray-hover);
}

#modal-search .search-syntax:hover a {
  text-decoration: underline;
}
</style>