/* Testes unitários para a aplicação */

describe('RepoController', function () {
    var $controller, $scope, $q, GitHubService, deferred;

    beforeEach(module('githubApp'));

    beforeEach(inject(function (_$controller_, $rootScope, _$q_) {
        $controller = _$controller_;
        $scope = $rootScope.$new();
        $q = _$q_;

        GitHubService = {
            searchRepos: function () {
                deferred = $q.defer();
                return deferred.promise;
            }
        };
    }));

    /* Teste para verificar a inicialização correta das páginas */

    it('deve inicializar currentPage e totalPages', function () {
        var controller = $controller('RepoController', { $scope: $scope, GitHubService: GitHubService });
        expect($scope.currentPage).toBe(1);
        expect($scope.totalPages).toBe(1);
    });

    /* Teste para verificar as buscas sendo realizadas pela tecla 'Enter' com êxito */

    it('deve chamar searchRepos ao pressionar a tecla Enter', function () {
        var controller = $controller('RepoController', { $scope: $scope, GitHubService: GitHubService });
        spyOn($scope, 'searchRepos');
        var event = { key: 'Enter' };
        $scope.handleKeyPress(event);
        expect($scope.searchRepos).toHaveBeenCalled();
    });

    /* Teste para verificar a função sendo chamada corretamente ao chamar a página posterior */

    it('deve incrementar currentPage e chamar searchRepos em nextPage', function () {
        var controller = $controller('RepoController', { $scope: $scope, GitHubService: GitHubService });
        spyOn($scope, 'searchRepos');
        $scope.totalPages = 3;
        $scope.currentPage = 1;
        $scope.nextPage();
        expect($scope.currentPage).toBe(2);
        expect($scope.searchRepos).toHaveBeenCalled();
    });

    /* Teste para verificar a função sendo chamada corretamente ao chamar a página anterior */

    it('deve decrementar currentPage e chamar searchRepos em prevPage', function () {
        var controller = $controller('RepoController', { $scope: $scope, GitHubService: GitHubService });
        spyOn($scope, 'searchRepos');
        $scope.totalPages = 3;
        $scope.currentPage = 2;
        $scope.prevPage();
        expect($scope.currentPage).toBe(1);
        expect($scope.searchRepos).toHaveBeenCalled();
    });

    /* Teste para verificar se os itens estão sendo chamados corretamente via API */

    it('deve definir repos e totalPages em uma busca bem-sucedida', function () {
        var controller = $controller('RepoController', { $scope: $scope, GitHubService: GitHubService });
        var responseData = {
            items: [{ name: 'Repo1' }, { name: 'Repo2' }],
            total_count: 2
        };
        $scope.searchRepos();
        deferred.resolve(responseData);
        $scope.$apply();
        expect($scope.repos).toEqual(responseData.items);
        expect($scope.totalPages).toBe(Math.ceil(responseData.total_count / 20));
    });

    /* Teste para verificar se a função está tratando a existência de erros corretamente */

    it('deve lidar com erros durante a busca', function () {
        var controller = $controller('RepoController', { $scope: $scope, GitHubService: GitHubService });
        spyOn(console, 'error');
        $scope.searchRepos();
        deferred.reject('Mensagem de erro');
        $scope.$apply();
        expect(console.error).toHaveBeenCalledWith('Erro na busca de repositórios:', 'Mensagem de erro');
    });
});
