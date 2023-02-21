// MODULO
var repoSearcher = angular.module('repoSearcher', ['ngRoute', 'ngResource']);

// ROTAS
repoSearcher.config(function ($routeProvider) {
   
    $routeProvider

    //rota para a home
    .when('/', {
        templateUrl: 'pages/home.htm',
        controller: 'homeController'
    })
    
    //rota para a pesquisa
    .when('/search', {
        templateUrl: 'pages/search.htm',
        controller: 'searchController'
    })

    //rota para as páginas de pesquisa
    .when('/search/:page', {
        templateUrl: 'pages/search.htm',
        controller: 'searchController'
    })
    
});

// SERVIÇOS
//Esse serviço simplesmente seta o valor inicial de repo como vazio
repoSearcher.service('repoService', function() {
   
    this.repo = "teste";
    
});

// CONTROLADORES
//cotrolador da home
//seta o $scope.repo com o do serviço e o estado watch seta o repoService.repo como sendo o atual $scope.repo
repoSearcher.controller('homeController', ['$scope', 'repoService', function($scope, repoService) {
    
    $scope.repo = repoService.repo;
    
    $scope.$watch('repo', function() {
       repoService.repo = $scope.repo; 
    });
    
}]);

//controlador da pesquisa
repoSearcher.controller('searchController', ['$scope', '$http', '$q', '$routeParams', '$window', 'repoService', function($scope, $http, $q, $routeParams, $window,repoService) {
    //busca o valor do $scope.repo com o repoService
    $scope.repo = repoService.repo;
    //seta a página de acordo com o link fornecido ou então mantém como padrão 1
    $scope.page = $routeParams.page || 1;
    //faz a busca da API utilizando a página e o nome do repositório digitado
    var promessa = $q.defer();
   $http.get('http://api.github.com/search/repositories?page='+$scope.page+'&q='+$scope.repo).then(function(gitHubresult){
    var repositorios = [];
    angular.forEach(gitHubresult.data, function(reposit, id){
        reposit.id = id;
        repositorios.push(reposit)
    });
    promessa.resolve();
    //retorna o resultado sendo somente o objeto de repositórios e joga numa array
    $scope.resultados = repositorios[2];

   },);
    // aqui faz o controle da próxima página
    $scope.next = function(){
    $scope.page = parseInt($scope.page) + 1;
    var url = '#/search/'+ $scope.page;
    $window.location.href = url;
};
    //aqui faz o controle da página anterior
    $scope.previous = function(){
    $scope.page = parseInt($scope.page) - 1;
    var url = '#/search/'+ $scope.page;
    $window.location.href = url;
};
    //seta o botão de página anterior como ativo ou não, para evitar página 0, -1... etc
    //apesar de não dar erro, optei por botar essa opção por segurança.
if ($scope.page == 1) {
    document.getElementById("previousBtn").disabled = true;
}
else {document.getElementById("previousBtn").disabled = false;};
}]);
