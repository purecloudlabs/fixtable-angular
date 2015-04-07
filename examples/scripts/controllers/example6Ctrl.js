angular.module('examples')
.controller('example6Ctrl', [
	'$scope',
	'rawData',
	function($scope, rawData){

		// get the first 5 items from the data array
		$scope.data = rawData.getData();

		// set up fixtable
		$scope.localOptions = {
			data: 'data',
			columns: [
				{
					property: 'year',
					label: 'Year',
					width: 70,
					editable: true
				},
				{
					property: 'title',
					label: 'Film',
					cellClass: 'text-italic',
					editable: true
				},
				{
					property: 'director',
					label: 'Director(s)',
					editable: true
				},
				{
					property: 'rating',
					label: 'Rating',
					template: 'examples/ratingImage.html',
					editable: true,
					width: 90
				}
			],
			tableClass: 'table'
		}
		$scope.options = angular.copy($scope.localOptions);

		$scope.$on('fixtableEndEdit', function(event){
			property = event.targetScope.col.property;
      newValue = event.targetScope.row[property];
      console.log('[FixtableEndEdit]', 'Updated', property, 'to', newValue);
    });

	}
]);