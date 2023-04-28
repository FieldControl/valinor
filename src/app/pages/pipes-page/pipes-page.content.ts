export interface IPipe {
  name: string;
  type: string;
  usage: string;
  value: string | number;
}

export const PIPES: IPipe[] = [
  {
    name: 'CPF',
    type: 'cpf',
    value: '99999999999',
    usage: `{{ cpf | cpf }}`,
  },
  {
    name: 'CNPJ',
    type: 'cnpj',
    value: '99999999999999',
    usage: `{{ cnpj | cnpj }}`,
  },
  {
    name: 'Currency',
    type: 'currency',
    value: 5000,
    usage: `{{ currency | currency: "BRL":"symbol" }}`,
  },
  {
    name: 'Date',
    type: 'date',
    value: '1995-07-11T20:14:00.345Z',
    usage: `{{ date | date:"MM/dd/yyyy" }}`,
  },
  {
    name: 'Percent',
    type: 'percent',
    value: 0.1,
    usage: `{{ percent | percent }}`,
  },
  {
    name: 'Account',
    type: 'account',
    value: 1234180343,
    usage: `{{ account | account }}`,
  },
  {
    name: 'CEP',
    type: 'cep',
    value: 99999999,
    usage: `{{ cep | cep }}`,
  },
  {
    name: 'Cel',
    type: 'cel',
    value: 21999999999,
    usage: `{{ cel | cel }}`,
  },
  {
    name: 'Tel',
    type: 'tel',
    value: 2199999999,
    usage: `{{ tel | tel }}`,
  },
];
