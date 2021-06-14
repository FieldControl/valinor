import axios from 'axios';

// GitHub permite até 1000 resultados por pesquisa
describe('Pagination', () => {
  const url = process.env.VUE_APP_API_URL || '';
  const q = encodeURIComponent('node');

  it('Deve retornar itens na última página disponível', async () => {
    const perPage = 30;
    const params = { q, per_page: perPage };
    const searchResult = await axios(url, { params });

    let totalItems = Number(searchResult.data.total_count);

    if (totalItems < 1000) {
      totalItems = 1000;
    }

    const lastPage = Math.ceil(totalItems / perPage);

    const lastResult = await axios.get(url, {
      params: { ...params, page: lastPage },
    });
    const lastItems = lastResult.data.items;

    expect(lastItems.length).not.toEqual(0);
  });
});
