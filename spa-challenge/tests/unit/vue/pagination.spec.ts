import axios from 'axios';

// GitHub permite até 1000 resultados por pesquisa
describe('Pagination', () => {
  const url = process.env.VUE_APP_API_URL || '';
  const q = encodeURIComponent('node');

  it('Deve retornar itens na última página disponível', async () => {
    const perPage = 30;
    const params = { q, per_page: perPage };
    const searchResult = await axios(url, { params });

    const totalItems = Number(searchResult.data.total_count);
    let lastPage;

    if (totalItems < 1000) {
      lastPage = Math.ceil(totalItems / perPage);
    } else {
      lastPage = Math.ceil(1000 / perPage);
    }

    const lastResult = await axios.get(url, {
      params: { ...params, page: lastPage },
    });
    const lastItems = lastResult.data.items;

    expect(lastItems.length).not.toEqual(0);
  });
});
