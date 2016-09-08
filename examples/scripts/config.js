angular.module('examples')
.config([
	'fixtableDefaultOptionsProvider',
	'fixtableFilterTypesProvider',
	function(fixtableDefaultOptionsProvider, fixtableFilterTypesProvider){

		// set a custom template for search filters
		fixtableFilterTypesProvider.update('search', {
			templateUrl: 'examples/searchFilter.html'
		});

		// set a custom template for select filters
		fixtableFilterTypesProvider.update('select', {
			templateUrl: 'examples/selectFilter.html'
		});

		// set some defaults for all fixtable instances
		fixtableDefaultOptionsProvider.setDefaultOptions({
			applyFiltersTemplate: 'examples/applyFilters.html',
			loadingTemplate: 'examples/loading.html',
			footerTemplate: 'examples/footer.html'
		});

	}
])
.config(['$compileProvider',
	function ($compileProvider) {
		$compileProvider.debugInfoEnabled(false);
	}
]);

