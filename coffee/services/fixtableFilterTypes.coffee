angular.module 'fixtable'
.provider 'fixtableFilterTypes', ->

	@filterTypes = {}

	# define search filter type
	@filterTypes.search =
		defaultValues:
			query: ''
		templateUrl: 'fixtable/templates/columnFilters/search.html'
		filterFn: (testValue, filterValues) ->
			pattern = new RegExp filterValues.query, 'i'
			pattern.test testValue

	# define select filter type
	@filterTypes.select =
		defaultValues:
			selected: null
		templateUrl: 'fixtable/templates/columnFilters/select.html'
		filterFn: (testValue, filterValues) ->
			return true unless filterValues.selected?
			testValue is filterValues.selected

	@$get = -> @filterTypes

	@add = (type, definition) ->
		@filterTypes[type] = definition

	@update = (type, properties) ->
		for property, value of properties
			@filterTypes[type][property] = value

	null
