// Module
var repoSearcher = angular.module('repoSearcher', ['ngRoute', 'ngResource']);

// Route configuration
repoSearcher.config(function ($routeProvider) {
   
    $routeProvider

    //home route configuration
    .when('/', {
        templateUrl: 'pages/home.htm',
        controller: 'homeController'
    })
    
    //first page search route configuration
    .when('/search', {
        templateUrl: 'pages/search.htm',
        controller: 'searchController'
    })

    //search route configuration with pagination
    .when('/search/:page', {
        templateUrl: 'pages/search.htm',
        controller: 'searchController'
    })
    
});

// Services
//This service just set the default value for "repo" to be empty
repoSearcher.service('repoService', function() {
   
    this.repo = "";
    
});

// Controllers
//home controller
//sets $scope.repo to be the empty that we setted in the service. creates a $watch in the input from home page and if triggered, sets repo to be the one typed in home. 
repoSearcher.controller('homeController', ['$scope', 'repoService', function($scope, repoService) {
    
    $scope.repo = repoService.repo;
    
    $scope.$watch('repo', function() {
       repoService.repo = $scope.repo; 
    });
    
}]);

//search controller
repoSearcher.controller('searchController', ['$scope', '$http', '$q', '$routeParams', '$window', 'repoService', function($scope, $http, $q, $routeParams, $window,repoService) {
    //gets the value from $scope to repo and sets from the memory in repoService.repo
    $scope.repo = repoService.repo;
    //sets the default page from route to be 1
    $scope.page = $routeParams.page || 1;
    //repositories search with pagination
    var promessa = $q.defer();
   $http.get('http://api.github.com/search/repositories?page='+$scope.page+'&q='+$scope.repo).then(function(gitHubresult){
    //set a empty array for repositories 
    var repositorios = [];
    //get repositories and add them to the array
    angular.forEach(gitHubresult.data, function(reposit, id){
        reposit.id = id;
        repositorios.push(reposit);
    });
    promessa.resolve();
    //retorna o resultado sendo somente o objeto de repositórios e joga numa array
    //set $scope.resultados (results in portuguese) to be the item 2 in the repositorios array (item 0 -> returns "total_count", item 1 -> returns "incomplete_results" false or true, item 2 -> 30 Objects)
    $scope.resultados = repositorios[2];
   },);

    // Controlls the next page function with parseInt, sets to $scope.page and change de href from window to the url.
    $scope.next = function(){
    $scope.page = parseInt($scope.page) + 1;
    var url = '#/search/'+ $scope.page;
    $window.location.href = url;
};
    //controlls the previous page function functions equal to $scope.next
    $scope.previous = function(){
    $scope.page = parseInt($scope.page) - 1;
    var url = '#/search/'+ $scope.page;
    $window.location.href = url;
};
    //Controlls the previous page button to be hidden and disabled if the $scope.page == 1 to avoid pages 0, -1, -2.
if ($scope.page == 1) {
    document.getElementById("previousBtn").hidden = true;
    document.getElementById("previousBtn").disabled = true;
}
// shows the button with the page > 1. 
else {document.getElementById("previousBtn").hidden = false;};
document.getElementById("previousBtn").disabled = false;
}]);
