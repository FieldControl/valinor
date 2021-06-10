import supertest from 'supertest';

const url = process.env.VUE_APP_API_URL;
const repo = '/search/repositories';
const request = supertest(url + repo);

describe('Repositories', () => {
  it('Deve retornar com sucesso a pesquisa com a palavra "FieldControl"', async () => {
    const query = encodeURIComponent('FieldControl');
    const res = await request.get(`?q=${query}`).set('User-agent', 'request');

    expect(res.statusCode).toEqual(200);
  });

  it('Deve retornar repositórios que contenha "valinor"', async () => {
    const query = 'valinor';
    const res = await request.get(`?q=${query}`).set('User-agent', 'request');

    expect(res.body).toHaveProperty('items');
  });

  it('Deve retornar repositórios que contenham "node" na segunda paginação', async () => {
    const query = 'node';
    const res = await request.get(`?q=${query}&page=2`).set('User-agent', 'request');

    expect(res.body).toHaveProperty('items');
  });

  it('Deve retornar apenas cinco repositórios que contenham "vue"', async () => {
    const query = 'vue';
    const res = await request.get(`?q=${query}&per_page=5`).set('User-agent', 'request');

    expect(res.body).toHaveProperty('items');
  });

  it('Deve retornar repositórios mais recentes que contenham "java"', async () => {
    const query = 'java';
    const res = await request.get(`?q=${query}&sort=created`).set('User-agent', 'request');

    expect(res.body).toHaveProperty('items');
  });
});
