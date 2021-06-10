const url = process.env.VUE_APP_API_URL;

describe('API GitHub', () => {
  it('Deve ser acessível por variável de ambiente', () => {
    expect(url).toEqual('https://api.github.com');
  });
});
