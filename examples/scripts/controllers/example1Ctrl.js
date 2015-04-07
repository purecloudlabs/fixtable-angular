angular.module('examples')
.controller('example1Ctrl', [
	'$scope',
	'rawData',
	function($scope, rawData){

		// get the first 10 items from the data array
		$scope.data = rawData.getData().slice(0, 10);

		// set up fixtable
		$scope.localOptions = {
			data: 'data',
			columns: [
				{
					property: 'year',
					label: 'Year'
				},
				{
					property: 'title',
					label: 'Film'
				},
				{
					property: 'director',
					label: 'Director(s)'
				},
				{
					property: 'rating',
					label: 'Rating'
				}
			],
			tableClass: 'table'
		}
		$scope.options = angular.copy($scope.localOptions);

	}
]);