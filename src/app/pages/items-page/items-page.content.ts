export interface IItems {
  label: string;
  value: string | number;
  type: string;
  code: string;
}

export const ITEMS: IItems[] = [
  {
    label: 'Standard',
    value: 'Valor sem formatação',
    type: 'standard',
    code: '<app-item label="Standard" value="Valor sem formatação" type="standard"></app-item>',
  },
  {
    label: 'Currency',
    value: '1000',
    type: 'currency',
    code: '<app-item label="Currency" value="1000" type="currency"></app-item>',
  },
  {
    label: 'CPF',
    value: '99999999999',
    type: 'cpf',
    code: '<app-item label="CPF" value="99999999999" type="cpf"></app-item>',
  },
  {
    label: 'CNPJ',
    value: '99999999999999',
    type: 'cnpj',
    code: '<app-item label="CNPJ" value="99999999999999" type="cnpj"></app-item>',
  },
  {
    label: 'Account',
    value: 1234180343,
    type: 'account',
    code: '<app-item label="Account" value="1234180343" type="account"></app-item>',
  },
  {
    label: 'Percentage',
    value: 0.1,
    type: 'percent',
    code: '<app-item label="Percentage" value="0.1" type="percent"></app-item>',
  },
];
