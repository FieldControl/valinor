angular.module('challengeApp', ['ngSanitize']).controller('challengeCtrl', function($scope, $http, $sce, $anchorScroll) {
    $scope.searchResults = [];
    $scope.searched = false;
    $scope.currentPage = 1;
    $scope.totalPages = 0;
    $scope.currentQuery = "";

    $scope.searchRepos = function(query, page) {
      if(!query){
        return 0;
      }
      var url = 'https://api.github.com/search/repositories?type=Repositories&per_page=10&q=' + query + '&page=' + page;
      $http.get(url).then(function(resp) {
        $scope.currentPage = page;
        $scope.currentQuery = query;
        $scope.searchResults = resp.data;
        angular.forEach($scope.searchResults.items, function(res){
          if(res.stargazers_count){
            res.stargazers_count = $scope.formatStarsNumber(res.stargazers_count);
          }
          if(res.description){
            const descriptionWithEmojis = $scope.changeEmoji(res.description);
            res.description = $sce.trustAsHtml(descriptionWithEmojis);
          }
        });
        if(resp.data.total_count < 1000){
          $scope.totalPages = Math.ceil(resp.data.total_count / 10);
        } else {
          $scope.totalPages = 100;
        }
        $anchorScroll();
        $scope.searched = true;
        $scope.pages = $scope.getPages($scope.currentPage);
      }, function(error) {
        console.log(error);
      });
    };

    $scope.loadEmojis = function() {
      var url = 'https://api.github.com/emojis';
      $http.get(url).then(function(resp) {
        $scope.emojiData = resp.data;
      });
    };

    $scope.changeEmoji = function(description){
      const regex = /:\w+:/g;
      const descriptionWithEmojis = description.replaceAll(regex, (match) => {
        const emojiWithoutColon = match.slice(1, -1);
        const emojiUrl = $scope.emojiData[emojiWithoutColon];
        return `<img class="emoji" src="${emojiUrl}" alt="${match}" />`;
      });
      return descriptionWithEmojis;
    };

    $scope.formatStarsNumber = function(num) {
      if (num >= 1000 && num < 1000000) {
        return (num/1000).toFixed(1) + 'k';
      } else if (num >= 1000000) {
        return (num/1000000).toFixed(1) + 'm';
      }
      return num;
    }

    $scope.getPages = function(currentPage) {
      var totalPages = $scope.totalPages;
      var pagesToShow = [];
      pagesToShow.push(1);
      for (var i = currentPage - 2; i <= currentPage + 2; i++) {
        if (i > 1 && i < totalPages) {
          pagesToShow.push(i);
        }
      }
      pagesToShow.push(totalPages);
      return pagesToShow;
    };    
    
});