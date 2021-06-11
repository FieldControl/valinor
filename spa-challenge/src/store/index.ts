import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

Vue.use(Vuex);

interface RootState {
  search: {
    text: string,
    page: number,
    sort: string,
    order: string,
    perPage: number,
  }
}

const store: StoreOptions<RootState> = {
  state: {
    search: {
      text: '',
      page: 1,
      sort: '',
      order: 'desc',
      perPage: 10,
    },
  },
};

export default new Vuex.Store<RootState>(store);
