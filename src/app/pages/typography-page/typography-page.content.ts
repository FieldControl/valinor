export interface ITypography {
  name: string;
  code: string;
  id: string;
}

export const TYPOGRAPHY: ITypography[] = [
  {
    name: 'Título',
    code: '<h1 class="title">Título</h1>',
    id: 'typo-title'
  },
  {
    name: 'H1',
    code: '<h1>H1</h1>',
    id: 'typo-h1'
  },
  {
    name: 'H2',
    code: '<h2>H2</h2>',
    id: 'typo-h2'
  },
  {
    name: 'H3',
    code: '<h3>H3</h3>',
    id: 'typo-h3'
  },
  {
    name: 'H4',
    code: '<h4>H4</h4>',
    id: 'typo-h4'
  },
  {
    name: 'H5',
    code: '<h5>H5</h5>',
    id: 'typo-h5'
  },
  {
    name: 'H6',
    code: '<h6>H6</h6>',
    id: 'typo-h6'
  },
  {
    name: 'Span',
    code: '<span>Span</span>',
    id: 'typo-span'
  },
  {
    name: 'Parágrafo',
    code: '<p>Parágrafo</p>',
    id: 'typo-p'
  },
  {
    name: 'Link',
    code: '<a href="https://mmanhaes.com.br" target="_blank">Link</a>',
    id: 'typo-link'
  },
];
