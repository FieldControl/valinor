angular.module('githubApp')
    .controller('RepoController', ['$scope', 'GitHubService', function ($scope, GitHubService) {
        $scope.currentPage = 1;
        $scope.totalPages = 1;

        $scope.searchRepos = function () {
            GitHubService.searchRepos($scope.searchQuery, $scope.currentPage)
                .then(function (data) {
                    $scope.repos = data.items;
                    $scope.totalPages = Math.ceil(data.total_count / 20); // 20 itens por página
                })
                .catch(function (error) {
                    console.error('Erro na busca de repositórios:', error);
                });
        };

        $scope.handleKeyPress = function (event) {
            if (event.key === 'Enter') {
                $scope.searchRepos();
            }
        };

        $scope.nextPage = function () {
            if ($scope.currentPage < $scope.totalPages) {
                $scope.currentPage++;
                $scope.searchRepos();
            }
        };

        $scope.prevPage = function () {
            if ($scope.currentPage > 1) {
                $scope.currentPage--;
                $scope.searchRepos();
            }
        };
    }]);
