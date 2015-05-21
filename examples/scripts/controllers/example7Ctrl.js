angular.module('examples')
.controller('example7Ctrl', [
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

		$scope.selectedFilms = []

		$scope.restrictedFilmsSelected = function(){
			for(var i=0; i<$scope.selectedFilms.length; i++){
				if($scope.selectedFilms[i].rating === 'R'){
					return true;
				}
			}
			return false;
		}

		$scope.removeRestrictedFilms = function(){
			for(var i=$scope.selectedFilms.length-1; i>=0; i--){
				if($scope.selectedFilms[i].rating === 'R'){
					$scope.selectedFilms.splice(i, 1);
				}
			}
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
			},
			rowSelection: true,
			selectedItems: 'selectedFilms'
		}
		$scope.options = angular.copy($scope.localOptions);

	}
]);
