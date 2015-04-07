angular.module('examples')
.run([
	'$templateCache',
	function($templateCache){
		$templateCache.put('examples/applyFilters.html', '<button type="button" class="btn btn-primary btn-sm" ng-click="applyFilters()">Apply</button>');
		$templateCache.put('examples/footer.html', 'Page <button type="button" class="btn btn-default btn-sm" ng-disabled="pagingOptions.currentPage === 1" ng-click="prevPage()"><span class="glyphicon glyphicon-chevron-left"></span></button><input type="text" class="form-control input-sm" ng-model="pagingOptions.currentPage" size="{{ totalPagesOoM }}"><button type="button" class="btn btn-default btn-sm" ng-disabled="pagingOptions.currentPage === totalPages" ng-click="nextPage()"><span class="glyphicon glyphicon-chevron-right"></span></button> of {{ totalPages }}<div class="pull-right" ng-if="pagingOptions.pageSizeOptions.length > 1"><select class="form-control input-sm" ng-model="pagingOptions.pageSize" ng-options="pageSize for pageSize in pagingOptions.pageSizeOptions"></select> items per page</div>');
		$templateCache.put('examples/loading.html', '<span class="loading-indicator glyphicon glyphicon-refresh"></span>');
		$templateCache.put('examples/ratingImage.html', '<div class="rating rating-{{ row.rating.toLowerCase() }}"></div>');
		$templateCache.put('examples/searchFilter.html', '<div class="form-group has-feedback"><input type="text" class="form-control input-small" ng-model="values.query"><span class="glyphicon glyphicon-search form-control-feedback"></span></div>');
		$templateCache.put('examples/selectFilter.html', '<select class="form-control input-small" ng-model="values.selected" ng-options="opt.value as opt.label for opt in options.selectOptions"><option value="">{{ options.nullOptionLabel || \'All\' }}</option></select>');
	}
]);