angular.module 'fixtable', []
angular.module 'fixtable'
.directive 'fixtable', [
	'$timeout'
	($timeout) ->
		link: (scope, element, attrs) ->

			fixtable = new Fixtable element

			# update table data & calculated styles
			scope.$parent.$watchCollection scope.options.data, (newData) ->
				unless newData then return
				scope.data = newData
				fixtable._circulateStyles()
				for col, i in scope.options.columns
					if col.width then fixtable._setColumnWidth i+1, col.width
				$timeout ->
					fixtable._setHeaderHeight()
					fixtable._setFooterHeight()

			# refresh when paging options change
			scope.$watch 'options.pagingOptions', (opt) ->
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

		replace: true
		restrict: 'E'
		scope:
			options: '='
		templateUrl: 'fixtable/templates/fixtable.html'
]