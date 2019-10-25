angular.module('githubApp', ['components', 'filters'])

.controller('RepositoryListController', function ($scope, $http)
{
    // models
    $scope.totalResultCount = {

        0: "nenhum resultado encontrado",
        one: "{{search.result.total_count | number}} resultado encontrado",
        other: "{{search.result.total_count | number}} resultado encontrados"
    };

    $scope.sortOptions = [
        
        {title: "por nome", by: "", orderBy: ""},
        {title: "mais estrelas", by: "stars", orderBy: "desc"},
        {title: "menos estrelas", by: "stars", orderBy: "asc"},
        {title: "mais recentes", by: "updated", orderBy: "desc"},
        {title: "mais antigos", by: "updated", orderBy: "asc"},

    ];

    // methods
    $scope.searchRepository = function ($event, query, sort)
    {
        if (!!query)
        {
            if ($event.key == "Enter")
            {
                window.scrollTo(0, 0);
                $scope.getRepositoriesAsync(query, sort.by, sort.orderBy);
            }
        }    
    };

    $scope.sortBy = function (lastQuery, sort)
    {
        window.scrollTo(0, 0);
        $scope.getRepositoriesAsync(lastQuery, null, sort.by, sort.orderBy);
    };

    $scope.changePage = function (page)
    {
        window.scrollTo(0, 0);

        switch (page)
        {
            case 'Anterior':
                let previousPage = $scope.search.currentPage - 1;
                page = (previousPage < 1) ? 1 : previousPage;
                break;

            case 'Próximo':
                let nextPage = $scope.search.currentPage + 1;
                page = (nextPage > $scope.search.totalPages) ? $scope.search.totalPages : nextPage;
                break;

            default:
                if (Number.isNaN(page))
                    page = 1;
                break;
        } 

        $scope.getRepositoriesAsync(
            $scope.search.lastQuery, 
            page, 
            $scope.search.sort.by, 
            $scope.search.sort.orderBy
        );
    };

    // services
    $scope.getRepositoriesAsync = async (query, page = 1, sort = '', order = '') =>
    {
        try
        {
            $scope.search = { loading: true };

            delete $scope.search.result;

            page = (page < 1) ? 1 : page;

            let response = await $http({
                method: 'GET',
                url: "https://api.github.com/search/" +
                      `repositories?q=${query}&page=${page}&sort=${sort}&order=${order}`,
                headers: {

                    Accept: 'application/vnd.github.mercy-preview+json' 
                }
            });

            $scope.search = {

                loading: false,
                result: response.data,
                lastQuery: query,
                currentPage: page,
                sort: {

                    by: sort,
                    orderBy: order
                },

                totalPages: Math.ceil((response.data.total_count > 1000) ?
                (1000 / 30) : response.data.total_count / 30)

            };

            $scope.$apply(); // atualiza DOM
        }

        catch(exception)
        {
            $scope.search = { 

                loading: false,
                error: {
                    
                    isAPIError: !!exception.data,
                    status: exception.status || exception.message, 
                    message: exception.data ? exception.data.message : exception.stack,
                    url: exception.data ? exception.data.documentation_url : null
                }
            };
            
            console.error(exception);
        }
    };
});

