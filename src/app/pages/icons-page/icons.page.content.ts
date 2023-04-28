export interface IIcon {
  name: string;
  class: string;
  code: string;
  label?: string;
  isLoading?: boolean;
}

export interface ICountry {
  name: string;
  icon: string;
  code: string;
}

export const ICONS: IIcon[] = [
  {
    name: 'Loading',
    class: '',
    code: '<app-spinner [size]="1.3"></app-spinner>',
    label: '',
    isLoading: true,
  },
  {
    name: '',
    class: '',
    code: '<app-spinner label="Carregando..." [size]="1.3"></app-spinner>',
    label: 'Carregando...',
    isLoading: true,
  },
  {
    name: 'GitHub',
    class: 'fa fa-github',
    code: '<i class="fa fa-github"></i>',
  },
  {
    name: 'Home',
    class: 'fa fa-home',
    code: '<i class="fa fa-home"></i>',
  },
  {
    name: 'Font',
    class: 'fa fa-font',
    code: '<i class="fa fa-font"></i>',
  },
  {
    name: 'Paint Brush',
    class: 'fa fa-paint-brush',
    code: '<i class="fa fa-paint-brush"></i>',
  },
  {
    name: 'Keyboard',
    class: 'fa fa-keyboard-o',
    code: '<i class="fa fa-keyboard-o"></i>',
  },
  {
    name: 'Toggle',
    class: 'fa fa-toggle-off',
    code: '<i class="fa fa-toggle-off"></i>',
  },
  {
    name: 'Table',
    class: 'fa fa-table',
    code: '<i class="fa fa-table"></i>',
  },
  {
    name: 'Server',
    class: 'fa fa-server',
    code: '<i class="fa fa-server"></i>',
  },
  {
    name: 'Smile',
    class: 'fa fa-smile-o',
    code: '<i class="fa fa-smile-o"></i>',
  },
  {
    name: 'Money',
    class: 'fa fa-money',
    code: '<i class="fa fa-money"></i>',
  },
  {
    name: 'Arrows',
    class: 'fa fa-arrows-alt',
    code: '<i class="fa fa-arrows-alt"></i>',
  },
  {
    name: 'Cogs',
    class: 'fa fa-cogs',
    code: '<i class="fa fa-cogs"></i>',
  },
];

export const COUNTRIES: ICountry[] = [
  {
    name: 'Catar',
    icon: 'assets/countries/catar.png',
    code: '<img src="assets/countries/catar.png">',
  },
  {
    name: 'Equador',
    icon: 'assets/countries/equador.png',
    code: '<img src="assets/countries/equador.png">',
  },
  {
    name: 'Senegal',
    icon: 'assets/countries/senegal.png',
    code: '<img src="assets/countries/senegal.png">',
  },
  {
    name: 'Países Baixos',
    icon: 'assets/countries/paises-baixos.png',
    code: '<img src="assets/countries/paises-baixos.png">',
  },
  {
    name: 'Inglaterra',
    icon: 'assets/countries/inglaterra.png',
    code: '<img src="assets/countries/inglaterra.png">',
  },
  {
    name: 'Irã',
    icon: 'assets/countries/ira.png',
    code: '<img src="assets/countries/ira.png">',
  },
  {
    name: 'Estados Unidos',
    icon: 'assets/countries/estados-unidos.png',
    code: '<img src="assets/countries/estados-unidos.png">',
  },
  {
    name: 'País de Gales',
    icon: 'assets/countries/pais-de-gales.png',
    code: '<img src="assets/countries/pais-de-gales.png">',
  },
  {
    name: 'Argentina',
    icon: 'assets/countries/argentina.png',
    code: '<img src="assets/countries/argentina.png">',
  },
  {
    name: 'Arábia Saudita',
    icon: 'assets/countries/arabia-saudita.png',
    code: '<img src="assets/countries/arabia-saudita.png">',
  },
  {
    name: 'México',
    icon: 'assets/countries/mexico.png',
    code: '<img src="assets/countries/mexico.png">',
  },
  {
    name: 'Polônia',
    icon: 'assets/countries/polonia.png',
    code: '<img src="assets/countries/polonia.png">',
  },
  {
    name: 'França',
    icon: 'assets/countries/franca.png',
    code: '<img src="assets/countries/franca.png">',
  },
  {
    name: 'Austrália',
    icon: 'assets/countries/australia.png',
    code: '<img src="assets/countries/australia.png">',
  },
  {
    name: 'Dinamarca',
    icon: 'assets/countries/dinamarca.png',
    code: '<img src="assets/countries/dinamarca.png">',
  },
  {
    name: 'Tunísia',
    icon: 'assets/countries/tunisia.png',
    code: '<img src="assets/countries/tunisia.png">',
  },
  {
    name: 'Espanha',
    icon: 'assets/countries/espanha.png',
    code: '<img src="assets/countries/espanha.png">',
  },
  {
    name: 'Costa Rica',
    icon: 'assets/countries/costa-rica.png',
    code: '<img src="assets/countries/costa-rica.png">',
  },
  {
    name: 'Alemanha',
    icon: 'assets/countries/alemanha.png',
    code: '<img src="assets/countries/alemanha.png">',
  },
  {
    name: 'Japão',
    icon: 'assets/countries/japao.png',
    code: '<img src="assets/countries/japao.png">',
  },
  {
    name: 'Bélgica',
    icon: 'assets/countries/belgica.png',
    code: '<img src="assets/countries/belgica.png">',
  },
  {
    name: 'Canadá',
    icon: 'assets/countries/canada.png',
    code: '<img src="assets/countries/canada.png">',
  },
  {
    name: 'Marrocos',
    icon: 'assets/countries/marrocos.png',
    code: '<img src="assets/countries/marrocos.png">',
  },
  {
    name: 'Croácia',
    icon: 'assets/countries/croacia.png',
    code: '<img src="assets/countries/croacia.png">',
  },
  {
    name: 'Brasil',
    icon: 'assets/countries/brasil.png',
    code: '<img src="assets/countries/brasil.png">',
  },
  {
    name: 'Sérvia',
    icon: 'assets/countries/servia.png',
    code: '<img src="assets/countries/servia.png">',
  },
  {
    name: 'Suíça',
    icon: 'assets/countries/suica.png',
    code: '<img src="assets/countries/suica.png">',
  },
  {
    name: 'Camarões',
    icon: 'assets/countries/camaroes.png',
    code: '<img src="assets/countries/camaroes.png">',
  },
  {
    name: 'Portugal',
    icon: 'assets/countries/portugal.png',
    code: '<img src="assets/countries/portugal.png">',
  },
  {
    name: 'Gana',
    icon: 'assets/countries/gana.png',
    code: '<img src="assets/countries/gana.png">',
  },
  {
    name: 'Uruguai',
    icon: 'assets/countries/uruguai.png',
    code: '<img src="assets/countries/uruguai.png">',
  },
  {
    name: 'Coreia do Sul',
    icon: 'assets/countries/coreia-do-sul.png',
    code: '<img src="assets/countries/coreia-do-sul.png">',
  },
];
