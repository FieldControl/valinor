angular.module('WiredHub').controller('MyController', function($scope, $window, $q, githubService, KEY_ENTER)
{
	$scope.searchText = '';
	$scope.pagination = {
		currentPage: 1,
		totalPages: 1
	};
	$scope.repositories = [];
	$scope.totalCount = 0; // Total of repositories
	$scope.prevSearchText = ''; // Keep track of previous search text
	$scope.isLoading = false;
	$scope.searchAttempted = false;
	$scope.emptyResponse = false;
	$scope.apiSearchRequests = null; // Keep track of rate limiting

	// Styling
	$scope.heroHeight = '600px';

	// Fetches the repositories from the githubService model
	$scope.fetchRepositories = async function()
	{
		// Set searchAttempted to true when the search is attempted
		$scope.searchAttempted = true;

		// Reset the empty response to false
		$scope.emptyResponse = false;

		// Clear repositories array
		$scope.repositories = [];

		// Updating style before creating list of repositories
		$scope.updateHeroHeight();

		// Check if the search text has changed before making the API call
		if ($scope.searchText !== $scope.prevSearchText) {
			$scope.pagination.currentPage = 1; // Reset to the first page when the search text changes
		}

		// Trim the search text to remove leading and trailing whitespaces
		// And check if the search text is empty after trimming or exceeds 256 characters
		const searchText = $scope.searchText.trim();
		if (searchText === '' || searchText.length > 256) {
			$scope.totalCount = 0;
			$scope.pagination.totalPages = 1;
			return;
		}

		// Set isLoading to true before making the API call
		$scope.isLoading = true;

		// Check rate limit before proceeding with the search request
		githubService.remainingRequests().then(function(remainingSearchRequests) 
		{
			$scope.apiSearchRequests = remainingSearchRequests;
			if ($scope.apiSearchRequests > 0) {
				githubService.fetchRepositories($scope.searchText, $scope.pagination.currentPage).then(function(response) 
				{
					if (response.totalCount === 0) {
						// The response from the API was empty
						$scope.emptyResponse = true;
						$scope.totalCount = 0;
						$scope.pagination.totalPages = 1;
					} else {
						// The response from the API contains data
						$scope.repositories = response.repositories;
						$scope.totalCount = response.totalCount;
						$scope.pagination.totalPages = response.totalPages;
						$scope.prevSearchText = $scope.searchText; // Update the previous search text
					}

					// Scroll to the top after the API call is successful
					$window.scrollTo(0, 0);

					// Update style after retrieving all repositories
					$scope.updateHeroHeight();
				})
				.catch(function (error) 
				{
					console.error('Error fetching repositories:', error);
				});
			}
		})
		.catch(function(error) 
		{
			console.error('Error fetching rate limit:', error);
		});

		$scope.isLoading = false;
	};

	// Watch for changes in the search text
	$scope.$watch('searchText', function(newVal, oldVal)
	{
		// Reset the searchAttempted flag whenever the search text changes
		if (newVal !== oldVal) {
			$scope.searchAttempted = false;
		}
	});

	// Enter key for search
	$scope.onKeyPress = function(event) 
	{
		if (event.keyCode === KEY_ENTER) {
			// Enter key was pressed, call the fetchRepositories() function
			$scope.fetchRepositories();
		}
	};

	$scope.nextPage = function ()
	{
		if ($scope.pagination.currentPage < $scope.pagination.totalPages) {
			$scope.pagination.currentPage++;

			if ($scope.searchText !== $scope.prevSearchText) {
				// The user for some reason changed the search text and clicked next
				// Let's default this behavior to continue searching for the previous one
				// And ignore the user's supposedly error
				$scope.searchText = $scope.prevSearchText;
			}

			$scope.fetchRepositories();
		}
	};

	$scope.prevPage = function ()
	{
		if ($scope.pagination.currentPage > 1) {
			$scope.pagination.currentPage--;
			if ($scope.searchText !== $scope.prevSearchText) {
				// The user for some reason changed the search text and clicked next
				// Let's default this behavior to continue searching for the previous one
				// And ignore the user's supposedly error
				$scope.searchText = $scope.prevSearchText;
			}

			$scope.fetchRepositories();
		}
	};

	// Function used to update the size of the box everytime a search is requested
	$scope.updateHeroHeight = function() 
	{
		const repositoriesElement = document.querySelector(".grid-item2");
		if (repositoriesElement) {
			const height = 111*$scope.repositories.length; // Add padding
			$scope.heroHeight = `${height}px`;
		}
	}
});
