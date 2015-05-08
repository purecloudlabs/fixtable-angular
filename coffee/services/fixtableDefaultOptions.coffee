angular.module 'fixtable'
.provider 'fixtableDefaultOptions', ->

	@defaultOptions =
		applyFiltersTemplate: 'fixtable/templates/applyFilters.html'
		cellTemplate: 'fixtable/templates/bodyCell.html'
		debugMode: false
		editTemplate: 'fixtable/templates/editCell.html'
		footerTemplate: 'fixtable/templates/footer.html'
		headerTemplate: 'fixtable/templates/headerCell.html'
		loadingTemplate: 'fixtable/templates/loading.html'
		realtimeFiltering: true
		sortIndicatorTemplate: 'fixtable/templates/sortIndicator.html'

	@$get = -> @defaultOptions

	@setDefaultOptions = (options) ->
		for option, value of options
			@defaultOptions[option] = value

	null
