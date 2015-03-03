angular.module 'fixtable'
.directive 'fixtable', [
	'$timeout'
	($timeout) ->
		link: (scope, element, attrs) ->

			fixtable = new Fixtable element

			# circulate styles on table elements in next digest cycle
			$timeout -> fixtable._circulateStyles()

			# update table data & calculated styles when source data changes
			scope.$parent.$watchCollection scope.options.data, (newData) ->
				scope.data = newData
				$timeout ->
					for col, i in scope.options.columns
						if col.width then fixtable._setColumnWidth i+1, col.width
					fixtable._setHeaderHeight()
					fixtable._setFooterHeight()

			# refresh when paging options change
			scope.$watch 'options.pagingOptions', (opt) ->
				return unless opt
				scope.totalPages = Math.ceil(opt.totalItems / opt.pageSize) or 1
				scope.totalPagesOoM = Math.floor Math.log10(opt.totalItems) + 1 or 1
				if opt.currentPage > scope.totalPages
					opt.currentPage = scope.totalPages
				scope.$parent[scope.options.pagingOptions.callback] opt
			, true

			# provide methods to page forward/back in footer template
			scope.nextPage = ->
				scope.pagingOptions.currentPage += 1
			scope.prevPage = ->
				scope.pagingOptions.currentPage -= 1

			# provide a hook to parent scope
			scope.parent = scope.$parent

		replace: true
		restrict: 'E'
		scope:
			options: '='
		templateUrl: 'fixtable/templates/fixtable.html'
]