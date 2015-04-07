angular.module('examples')
.controller('example4Ctrl', [
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
					sortable: true,
					width: 70
				},
				{
					property: 'title',
					label: 'Film',
					cellClass: 'text-italic',
					sortable: true,
					sortCompareFunction: function(rowA, rowB){
						titleA = rowA.title
						titleB = rowB.title

						// strip leading articles
						pattern = new RegExp(/^(A|An|The)\s(.*)/)
						if (pieces = pattern.exec(titleA)) {
							titleA = pieces[2];
						}
						if (pieces = pattern.exec(titleB)) {
							titleB = pieces[2];
						}

						// compare titles with leading articles stripped
						if (titleA > titleB) {
							return 1;
						}
						else if (titleA < titleB) {
							return -1;
						}
						else {
							return 0;
						}
					},
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
					template: 'examples/ratingImage.html',
					sortable: true,
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
			sort: {
				property: 'title',
				direction: 'asc'
			},
			tableClass: 'table'
		}
		$scope.options = angular.copy($scope.localOptions);

	}
]);