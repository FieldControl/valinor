Qual ferramentas e bibliotecas (libraries, framework, tools etc) você usou
----------

- Bom, Fiz Uso o Angular 15, sem o Angular Material (não sei se vocês usam, então optei fazer sem), utilizei
também RxJs, Observable com async e fiz um pouco reponsivo.

Porque você optou pela tecnologia X e não a Y
----------

- Usei Service ao invés de @Input em alguns casos pois não era possivel passar o dado para o componente filho.
- Utilizei junto com o NgClass o @ViewChild para alterar a classe de acordo com o tamanho da tela;


Quais princípios da engenharia de software que você usou?
----------

- KISS, O que um produz outros consomem, pense

Desafios e problemas que você enfrentou e como você resolveu
----------

- Usei uma service para salvar o valor pesquisado, porque não conseguiria passar de Pai para Filho pois o HomeComponent (quem deve receber a pesquisa) está dentro do router-outlet.
- Tive um pouco de trabalho na parte da paginação, com as contas e geração de números das páginas. Utilizei
contas com base no Offset (número que indica de qual posição começa a trazer os dados), que sempre usava de 5 
em 5. E para conseguir fazer as páginas e mostrar o total de resultados, fiz um get separado na API só do "count" (número que indica a quantidade total de dados).
- Tive desafios ao fazer o dropdown do Nav dinâmico, pois ao redimencionar a tela o Nav precisa sair e voltar automáticamente, utilizei da função @HostListener('window:resize', ['$event']) que percebe quando a página é redimencionada. Com isso adicionava e removia classes através do "classList" (HMTLElement), obtido com o @ViewChild.

O que você entende que pode ser melhorado e como fazer isso
----------

- Revisar o projeto na busca de abstrações e simplificações de código. Com ajuda de outros para obeter uma visualização de melhorias de perspectivas diferentes.
- Verificações a mais para evitar possiveis erros, fazendo testes nos end-points, nas ações das páginas, nos botões, e verificando o fluxo de dados.
- Filtros do Nav, criar as funções para ordenar por Nome e por Data, adicionando mais parâmetros no End-point como "orderBy=modified" ou "orderBy=name"
