angular.module('githubApp')
    .service('GitHubService', ['$http', function ($http) {
        var apiUrl = 'https://api.github.com/search/repositories';

        this.searchRepos = function (query, page) {
            var params = {
                q: query,
                page: page
            };

            return $http.get(apiUrl, { params: params })
                .then(function (response) {
                    return response.data;
                });
        };
    }]);
