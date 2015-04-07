angular.module('examples')
.controller('example3Ctrl', [
	'$http',
	'$scope',
	'$timeout',
	function($http, $scope, $timeout){

		$scope.getPageData = function(pagingOptions) {
			$scope.data = [];
			$scope.loadingData = true;
			url = '/api/v1/films';
			url += '?page=' + pagingOptions.currentPage;
			url += '&pageSize=' + pagingOptions.pageSize;
			$http.get(url)
			.success(function(response) {
				$timeout(function(){
					$scope.data = response.films;
					$scope.options.pagingOptions.totalItems = response.totalFilms;
					$scope.loadingData = false;
				}, 500);
			});
		}

		// set up fixtable
		$scope.localOptions = {
			data: 'data',
			columns: [
				{
					property: 'year',
					label: 'Year',
					width: 80
				},
				{
					property: 'title',
					label: 'Film',
					cellClass: 'text-italic'
				},
				{
					property: 'director',
					label: 'Director(s)'
				},
				{
					property: 'rating',
					label: 'Rating',
					template: 'examples/ratingImage.html',
					width: 80
				}
			],
			tableClass: 'table',
			loading: 'loadingData',
			paging: true,
			pagingOptions: {
				callback: 'getPageData',
				currentPage: 1,
				pageSize: 25,
				pageSizeOptions: [10, 25, 50]
			}
		}
		$scope.options = angular.copy($scope.localOptions);

	}
]);