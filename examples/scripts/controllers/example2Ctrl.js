angular.module('examples')
.controller('example2Ctrl', [
	'$scope',
	'rawData',
	function($scope, rawData){

		$scope.data = rawData.getData()

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
			tableClass: 'table'
		}
		$scope.options = angular.copy($scope.localOptions);

	}
]);