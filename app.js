// MODULE
var repoSearcher = angular.module('repoSearcher', ['ngRoute', 'ngResource']);

// ROUTES
repoSearcher.config(function ($routeProvider) {
   
    $routeProvider
    
    .when('/', {
        templateUrl: 'pages/home.htm',
        controller: 'homeController'
    })
    
    .when('/search', {
        templateUrl: 'pages/search.htm',
        controller: 'searchController'
    })

    .when('/search/:page', {
        templateUrl: 'pages/search.htm',
        controller: 'searchController'
    })
    
});

// SERVICES
repoSearcher.service('repoService', function() {
   
    this.repo = "";
    
});

// CONTROLLERS
repoSearcher.controller('homeController', ['$scope', 'repoService', function($scope, repoService) {
    
    $scope.repo = repoService.repo;
    
    $scope.$watch('repo', function() {
       repoService.repo = $scope.repo; 
    });
    
}]);

repoSearcher.controller('searchController', ['$scope', '$http', '$q', '$routeParams', '$window', 'repoService', function($scope, $http, $q, $routeParams, $window,repoService) {
    
    $scope.repo = repoService.repo;
    $scope.page = $routeParams.page || 1;
    var promessa = $q.defer();
   $http.get('http://api.github.com/search/repositories?page='+$scope.page+'&q='+$scope.repo).then(function(gitHubresult){
    var repositorios = [];
    angular.forEach(gitHubresult.data, function(reposit, id){
        reposit.id = id;
        repositorios.push(reposit)
    });
    promessa.resolve();
    $scope.resultados = repositorios[2];

   },);
   
   $scope.next = function(){
    $scope.page = parseInt($scope.page) + 1;
    var url = '#/search/'+ $scope.page;
    $window.location.href = url;
};

$scope.previous = function(){
    $scope.page = parseInt($scope.page) - 1;
    var url = '#/search/'+ $scope.page;
    $window.location.href = url;
};

}]);
