// app.component.js

app.controller('AppComponent', function($scope) {
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10;
  $scope.totalItems = 100; // Supondo que você tenha 100 itens no total

  $scope.previousPage = function() {
    if ($scope.currentPage > 1) {
      $scope.currentPage--;
    }
  };

  $scope.nextPage = function() {
    var totalPages = Math.ceil($scope.totalItems / $scope.itemsPerPage);
    if ($scope.currentPage < totalPages) {
      $scope.currentPage++;

     $scope.getPages = function() {
var totalPages = Math.ceil($scope.totalItems / $scope.itemsPerPage);
var pages = []; // Calcula a numeração de páginas a serem exibidas, limitando a quantidade a 5 páginas antes e depois da página atual
}

var startPage = Math.max(1, $scope.currentPage - 5);
var endPage = Math.min(totalPages, $scope.currentPage + 5);


for (var i = startPage; i <= endPage; i++) {
     pages.push(i); }
    }
   return pages;
  };
});
