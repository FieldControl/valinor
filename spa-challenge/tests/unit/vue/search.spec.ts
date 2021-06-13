import { shallowMount } from '@vue/test-utils';
import axios from 'axios';
import Search from '@/views/Search/Search.vue';

describe('Search', () => {
  const url = process.env.VUE_APP_API_URL || 'https://api.github.com/search/repositories';
  const $route = {
    path: '/search',
    query: { q: 'Field Control' },
  };

  it('Deve receber itens no objeto "response"', async () => {
    const res = await axios.get(url, {
      params: {
        q: $route.query.q,
      },
    });

    const wrapper = shallowMount(Search, {
      mocks: { $route },
      data() {
        return {
          response: {
            items: res.data.items,
          },
        };
      },
    });

    const { items } = wrapper.vm.$data.response;

    expect(Array.isArray(items)).toBe(true);
  });
});
