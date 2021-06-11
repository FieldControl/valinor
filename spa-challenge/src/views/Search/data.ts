interface Type {
  sortOptions: { name: string, sort: string, order: string }[],
  resultOptions: { name: string, code: number }[],
}

const data: Type = {
  sortOptions: [
    {
      name: 'Mais relevantes',
      sort: '',
      order: '',
    },
    {
      name: 'Mais avaliados',
      sort: 'stars',
      order: 'desc',
    },
    {
      name: 'Menos avaliados',
      sort: 'stars',
      order: 'asc',
    },
    {
      name: 'Mais forks',
      sort: 'forks',
      order: 'desc',
    },
    {
      name: 'Menos forks',
      sort: 'forks',
      order: 'asc',
    },
  ],
  resultOptions: [
    {
      name: '10 por página',
      code: 10,
    },
    {
      name: '30 por página',
      code: 30,
    },
    {
      name: '50 por página',
      code: 50,
    },
    {
      name: '70 por página',
      code: 70,
    },
    {
      name: '100 por página',
      code: 100,
    },
  ],
};

export default data;
