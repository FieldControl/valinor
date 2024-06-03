/**
 * Este arquivo inclui polyfills necessários ao Angular e é carregado antes do aplicativo.
 * Você pode adicionar seus próprios polyfills extras a este arquivo.
 *
 * Este arquivo está dividido em 2 seções:
 * 1. Polyfills do navegador. Eles são aplicados antes de carregar o ZoneJS e são classificados pelos navegadores.
 * 2. Importações de aplicativos. Arquivos importados após ZoneJS que devem ser carregados antes do seu main
 *      arquivo.
 *
 * A configuração atual é para os chamados navegadores "perenes"; as últimas versões de navegadores que
 * atualizam-se automaticamente. Isso inclui Safari >= 10, Chrome >= 55 (incluindo Opera),
 * Edge >= 13 no desktop e iOS 10 e Chrome no celular.
 *
 * Saiba mais em https://angular.io/guide/browser-support
 */

/********************************************** **************************************************
 * POLIFILLS DO NAVEGADOR
 */

/** IE10 e IE11 requerem o seguinte para suporte NgClass em elementos SVG */
//importar 'classlist.js'; // Execute `npm install --save classlist.js`.

/**
 * Animações da Web `@angular/platform-browser/animations`
 * Necessário apenas se o AnimationBuilder for usado dentro do aplicativo e usando IE/Edge ou Safari.
 * O suporte de animação padrão em Angular NÃO requer polyfills (a partir de Angular 6.0).
 */
//importar 'web-animations-js'; // Execute `npm install --save web-animations-js`.

/**
 * Por padrão, zone.js corrigirá todos os macroTask e DomEvents possíveis
 * o usuário pode desativar partes do patch macroTask/DomEvents definindo os seguintes sinalizadores
 * porque esses sinalizadores precisam ser definidos antes de `zone.js` ser carregado e webpack
 * colocará a importação no topo do pacote, então o usuário precisará criar um arquivo separado
 * neste diretório (por exemplo: zone-flags.ts) e coloque os seguintes sinalizadores
 * nesse arquivo e adicione o código a seguir antes de importar zone.js.
 * importar './zone-flags.ts';
 *
 * Os sinalizadores permitidos em zone-flags.ts estão listados aqui.
 *
 * Os seguintes sinalizadores funcionarão para todos os navegadores.
 *
 * (janela como qualquer).__Zone_disable_requestAnimationFrame = true; // desabilita o patch requestAnimationFrame
 * (janela como qualquer).__Zone_disable_on_property = true; // desabilita o patch onProperty como onclick
 * (janela como qualquer).__zone_symbol__UNPATCHED_EVENTS = ['rolar', 'mousemove']; // desabilita eventNames especificados pelo patch
 *
 * nas ferramentas de desenvolvedor do IE/Edge, o addEventListener também será empacotado por zone.js
 * com o seguinte sinalizador, ele irá ignorar o patch `zone.js` para IE/Edge
 *
 * (janela como qualquer).__Zone_enable_cross_context_check = true;
 *
 */

/********************************************** **************************************************
 * Zone JS é obrigatório por padrão para o próprio Angular.
 */
import 'zone.js/dist/zone'; // Incluído no Angular CLI.


/********************************************** **************************************************
 * IMPORTAÇÕES DE APLICATIVOS
 */