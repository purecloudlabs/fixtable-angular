angular.module 'fixtable', []

# configure built-in filter types
angular.module 'fixtable'
.config ['fixtableFilterTypesProvider', (fixtableFilterTypesProvider) ->

	fixtableFilterTypesProvider.add 'search',
		defaultValues:
			query: ''
		templateUrl: 'fixtable/templates/columnFilters/search.html'
		filterFn: (testValue, filterValues) ->
			pattern = new RegExp filterValues.query, 'i'
			pattern.test testValue

	fixtableFilterTypesProvider.add 'select',
		defaultValues:
			selected: null
		templateUrl: 'fixtable/templates/columnFilters/select.html'
		filterFn: (testValue, filterValues) ->
			return true unless filterValues.selected
			testValue is filterValues.selected
]