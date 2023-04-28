export interface ITable {
  name: string;
  code: string;
}

export const TABLES: ITable[] = [
  {
    name: 'Standard',
    code: '<app-table [data]="data"></app-table>',
  },
];
