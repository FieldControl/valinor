import { shallowMount } from '@vue/test-utils';
import Search from '@/views/Search/Search.vue';
import axios from 'axios';

describe('Search', () => {
  const url = process.env.VUE_APP_API_URL || '';
  const $route = {
    path: '/search',
    query: { q: encodeURIComponent('Field Control') },
  };

  const wrapper = shallowMount(Search, {
    mocks: { $route },
  });

  it('Deve receber um array de resultado no objeto "response"', async () => {
    const res = await axios.get(url, {
      params: {
        q: $route.query.q,
      },
    });

    wrapper.setData({
      response: {
        items: res.data.items,
      },
    });

    const { items } = wrapper.vm.$data.response;

    expect(Array.isArray(items)).toBe(true);
  });
});
