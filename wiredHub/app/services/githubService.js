angular.module('WiredHub').service('githubService', function($http, $q)
{
	// Number of repositories to display per page
	const perPage = 10;

	// Function to check rate limit before making the search request
	this.remainingRequests = function()
	{
		return $http.get('https://api.github.com/rate_limit')
		.then(function(response) 
		{
			const resources = response.data.resources;
			const remainingSearchRequests = resources.search.remaining;
			return remainingSearchRequests;
		})
		.catch(function(error) {
			console.error('Error fetching rate limit:', error);
			return 0; // Returns 0 in case of error
		});
	};

	// Function to fetch repositories from GitHub API based on search text and current page number
	this.fetchRepositories = function(searchText, page) 
	{
		// Build the API URL with the search text and pagination parameters
		const apiUrl = `https://api.github.com/search/repositories?q=${searchText}&per_page=${perPage}&page=${page}&sort=stars&order=desc`;

		return $http.get(apiUrl)
		.then(function(response) 
		{
			const data = response.data;

			if (Object.keys(data).length === 0) return { };
			if (typeof data.items === 'undefined') return { };

			const repositories = data.items.map(repo => ({
				full_name: repo.full_name,
				description: repo.description,
				language: repo.language,
				html_url: repo.html_url,
				stargazers_count: repo.stargazers_count,
			}));

			const totalCount = data.total_count;
			const totalPages = Math.ceil(totalCount / perPage);

			// Return the fetched repositories along with pagination information
			return {
				repositories: repositories,
				totalCount: totalCount,
				totalPages: totalPages
			};
		})
		.catch(function(error)
		{
			console.error('Error fetching repositories:', error);
			return $q.reject(error);
		});
	};
});
