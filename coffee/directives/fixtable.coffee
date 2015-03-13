angular.module 'fixtable'
.directive 'fixtable', [
	'$timeout'
	'fixtableDefaultOptions'
	($timeout, fixtableDefaultOptions) ->
		link: (scope, element, attrs) ->

			fixtable = new Fixtable element

			# use default options to fill in missing values
			for key, value of fixtableDefaultOptions
				unless Object::hasOwnProperty.call scope.options, key
					scope.options[key] = value

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
			scope.$watch 'options.pagingOptions', (newVal, oldVal) ->
				return unless newVal
				newVal.currentPage = parseInt newVal.currentPage
				scope.totalPages = Math.ceil(newVal.totalItems / newVal.pageSize) or 1
				scope.totalPagesOoM = (scope.totalPages+"").length + 1

				# don't allow currentPage to be set too high
				if newVal.currentPage > scope.totalPages
					newVal.currentPage = scope.totalPages

				# run callback (on pagingOptions init or currentPage/pageSize change)
				pageChanged = newVal.currentPage isnt oldVal.currentPage
				pageSizeChanged = newVal.pageSize isnt oldVal.pageSize
				if newVal is oldVal or pageChanged or pageSizeChanged
					scope.$parent[scope.options.pagingOptions.callback] newVal

			, true

			# watch loading status
			if scope.options.loading
				scope.$parent.$watch scope.options.loading, (newValue) ->
					scope.loading = newValue

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