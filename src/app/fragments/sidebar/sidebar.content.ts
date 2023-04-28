export interface IContent {
  route: string;
  icon: string;
  label: string;
}

export const SIDEBAR_CONTENT: IContent[] = [
  {
    route: '/home',
    icon: 'fa fa-home fa-2x',
    label: 'Início',
  },
  {
    route: '/typography',
    icon: 'fa fa-font fa-2x',
    label: 'Typography',
  },
  {
    route: '/colors',
    icon: 'fa fa-paint-brush fa-2x',
    label: 'Colors',
  },
  {
    route: '/inputs',
    icon: 'fa fa-keyboard-o fa-2x',
    label: 'Inputs',
  },
  {
    route: '/buttons',
    icon: 'fa fa-toggle-off fa-2x',
    label: 'Buttons',
  },
  {
    route: '/tables',
    icon: 'fa fa-table fa-2x',
    label: 'Tables',
  },
  {
    route: '/items',
    icon: 'fa fa-server fa-2x',
    label: 'Items',
  },
  {
    route: '/icons',
    icon: 'fa fa-smile-o fa-2x',
    label: 'Icons',
  },
  {
    route: '/pipes',
    icon: 'fa fa-money fa-2x',
    label: 'Pipes',
  },
];
