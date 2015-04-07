angular.module('examples')
.controller('example5Ctrl', [
	'$http',
	'$scope',
	'$timeout',
	function($http, $scope, $timeout){

		$scope.getPageData = function(pagingOptions, sort, filters) {

			$scope.data = [];
			$scope.loadingData = true;

			// start building request url w/ paging options
			url = '/api/v1/films';
			url += '?page=' + pagingOptions.currentPage;
			url += '&pageSize=' + pagingOptions.pageSize;

			// add filters to query string
			filterStrings = [];
			restrictStrings = [];
			for (var property in filters) {
				filter = filters[property];
				if (filter.type === 'search') {
					filterStrings.push(property + ':' + filter.values.query);
				}
				if (filter.type === 'select') {
					selected = filter.values.selected || '';
					restrictStrings.push(property + ':' + selected);
				}
			}
			if (filterStrings.length) {
				url += '&search=' + filterStrings.join('+');
			}
			if (restrictStrings.length) {
				url += '&restrict=' + restrictStrings.join('+');
			}

			// add sort
			if (sort && sort.property) {
				url += '&sort=' + sort.property + ':' + sort.direction;
			}

			// submit request to mock api & process response
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
					sortable: true,
					width: 70
				},
				{
					property: 'title',
					label: 'Film',
					sortable: true,
					cellClass: 'text-italic',
					filter: {
						type: 'search'
					}
				},
				{
					property: 'director',
					label: 'Director(s)',
					sortable: true,
					filter: {
						type: 'search'
					}
				},
				{
					property: 'rating',
					label: 'Rating',
					sortable: true,
					template: 'examples/ratingImage.html',
					filter: {
						type: 'select',
						options: {
							selectOptions: [
								{
									value: 'PG',
									label: 'PG'
								},
								{
									value: 'PG-13',
									label: 'PG-13'
								},
								{
									value: 'R',
									label: 'R'
								}
							]
						}
					},
					width: 90
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
			realtimeFiltering: false
		}
		$scope.options = angular.copy($scope.localOptions);

	}
]);