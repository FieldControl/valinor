describe('MyController', function()
{
	beforeEach(module('WiredHub'));

	var $scope, $controller, $window;
	var KEY_ENTER;

	describe('Testing MyController', function()
	{
		beforeEach(inject(function($controller, $rootScope)
		{
			$scope = $rootScope.$new();

			// Mock $window
			$window = {
				scrollTo: jasmine.createSpy('scrollTo')
			};

			// Mock githubService
			// We are not using mocks for tests because the complexity is beyond the scope of this project
			// This is how we would mock the promises if we were testing this, though.
			githubService = {
				remainingRequests: jasmine.createSpy('remainingRequests').and.returnValue(Promise.resolve(10)),
				fetchRepositories: jasmine.createSpy('fetchRepositories').and.returnValue(Promise.resolve({
					repositories: [
					{ full_name: 'Repo 1', description: "Very cool.", language: "Python", html_url: "url 1", stargazers_count: 22 },
					{ full_name: 'Repo 2', description: "Not that cool.", language: "Ruby", html_url: "url 2", stargazers_count: 3444 },
					{ full_name: 'Repo 3', description: "Definitely not cool.", language: "C", html_url: "url 3", stargazers_count: 699 },
					],
					totalCount: 3,
					totalPages: 1
				}))
			};

			KEY_ENTER = 13;

			$controller = $controller('MyController', {
				$scope: $scope,
				$window: $window,
				githubService: githubService,
				KEY_ENTER: KEY_ENTER
			});
		}));

		it('should initialize the scope variables', function() 
		{
			expect($scope.searchText).toBeDefined();
			expect($scope.pagination).toBeDefined();
			expect($scope.repositories).toBeDefined();
			expect($scope.totalCount).toBeDefined();
			expect($scope.prevSearchText).toBeDefined();
			expect($scope.isLoading).toBeDefined();
			expect($scope.searchAttempted).toBeDefined();
			expect($scope.emptyResponse).toBeDefined();
			expect($scope.apiSearchRequests).toBeDefined();

			expect($scope.searchText).toBe('');
			expect($scope.pagination.currentPage).toBe(1);
			expect($scope.pagination.totalPages).toBe(1);
			expect($scope.repositories).toEqual([]);
			expect($scope.totalCount).toBe(0);
			expect($scope.prevSearchText).toBe('');
			expect($scope.isLoading).toBe(false);
			expect($scope.searchAttempted).toBe(false);
			expect($scope.emptyResponse).toBe(false);
			expect($scope.apiSearchRequests).toBe(null);
		});

		it('should initialize the scope functions', function() 
		{
			expect(typeof $scope.fetchRepositories).toBeDefined();
			expect(typeof $scope.$watch).toBeDefined();
			expect(typeof $scope.onKeyPress).toBeDefined();
			expect(typeof $scope.nextPage).toBeDefined();
			expect(typeof $scope.prevPage).toBeDefined();
			expect(typeof $scope.updateHeroHeight).toBeDefined();

			expect(typeof $scope.fetchRepositories).toBe('function');
			expect(typeof $scope.$watch).toBe('function');
			expect(typeof $scope.onKeyPress).toBe('function');
			expect(typeof $scope.nextPage).toBe('function');
			expect(typeof $scope.prevPage).toBe('function');
			expect(typeof $scope.updateHeroHeight).toBe('function');
		});
	})
});
