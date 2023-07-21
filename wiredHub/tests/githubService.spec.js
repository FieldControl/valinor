describe('githubService', function()
{
	beforeEach(module('WiredHub'));

	var githubService, $httpBackend;

	beforeEach(inject(function(_githubService_, _$httpBackend_)
	{
		githubService = _githubService_;
		$httpBackend = _$httpBackend_;
	}));

	afterEach(function()
	{
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('should fetch the remaining search requests', function(done)
	{
		var remainingRequestsResponse = { resources: { search: { remaining: 100 } } };
		$httpBackend.expectGET('https://api.github.com/rate_limit').respond(200, remainingRequestsResponse);

		githubService.remainingRequests().then(function(remainingSearchRequests)
		{
			expect(remainingSearchRequests).toBe(100);
			done();
		});

		$httpBackend.flush();
	});

	it('should fetch repositories based on search text and page', function(done)
	{
		var searchText = 'angular';
		var page = 1;
		var repositoriesResponse = {
			items: [
				{ name: 'Repo 1', language: 'JavaScript', html_url: 'url1', stargazers_count: 100, owner: 'Unknown' },
				{ name: 'Repo 2', language: 'TypeScript', html_url: 'url2', stargazers_count: 200, owner: 'Unknown' }
			],
			total_count: 2
		};

		$httpBackend.expectGET(`https://api.github.com/search/repositories?q=${searchText}&per_page=10&page=${page}&sort=stars&order=desc`).respond(200, repositoriesResponse);

		githubService.fetchRepositories(searchText, page).then(function(response)
		{
			expect(response.repositories.length).toBe(2);
			expect(response.totalCount).toBe(2);
			expect(response.totalPages).toBe(1);
			done();
		});

		$httpBackend.flush();
	});

	it('should not break when repositories response is empty', function(done)
	{
		var searchText = 'angular';
		var page = 1;
		var repositoriesResponse = { };

		$httpBackend.expectGET(`https://api.github.com/search/repositories?q=${searchText}&per_page=10&page=${page}&sort=stars&order=desc`).respond(200, repositoriesResponse);

		githubService.fetchRepositories(searchText, page).then(function(response)
		{
			expect(Object.keys(response).length).toBe(0);
			done();
		});

		$httpBackend.flush();
	});

	it('should not break when repositories response is not what is expected', function(done)
	{
		var searchText = 'angular';
		var page = 1;
		var repositoriesResponse = { 
			message: "Error!",
		};

		$httpBackend.expectGET(`https://api.github.com/search/repositories?q=${searchText}&per_page=10&page=${page}&sort=stars&order=desc`).respond(200, repositoriesResponse);

		githubService.fetchRepositories(searchText, page).then(function(response)
		{
			expect(Object.keys(response).length).toBe(0);
			done();
		});

		$httpBackend.flush();
	});
});
