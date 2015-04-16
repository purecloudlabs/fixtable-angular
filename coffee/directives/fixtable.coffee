angular.module 'fixtable'
.directive 'fixtable', [
	'$timeout'
	'fixtableDefaultOptions'
	'fixtableFilterTypes'
	($timeout, fixtableDefaultOptions, fixtableFilterTypes) ->
		link: (scope, element, attrs) ->

			fixtable = new Fixtable element[0]

			# use default options to fill in missing values
			for key, value of fixtableDefaultOptions
				unless Object::hasOwnProperty.call scope.options, key
					scope.options[key] = value

			# circulate styles on table elements in next digest cycle
			$timeout -> fixtable.moveTableStyles()

			# update table data & calculated styles when source data changes
			scope.$parent.$watchCollection scope.options.data, (newData) ->
				scope.data = newData
				unless scope.options.paging then filterAndSortData()
				$timeout ->
					for col, i in scope.options.columns
						if col.width then fixtable.setColumnWidth i+1, col.width
					fixtable.setDimensions()
					fixtable.scrollTop()

			# update calculated styles when reflow property changes
			if scope.options.reflow
				scope.$parent.$watch scope.options.reflow, ->
					console.log 'reflow'
					fixtable.setDimensions()

			# refresh when paging options change
			scope.$watch 'options.pagingOptions', (newVal, oldVal) ->
				return unless newVal
				newVal.currentPage = parseInt newVal.currentPage
				scope.totalPages = Math.ceil(newVal.totalItems / newVal.pageSize) or 1
				scope.totalPagesOoM = (scope.totalPages+"").length

				# don't allow currentPage to be set too high
				if newVal.currentPage > scope.totalPages
					newVal.currentPage = scope.totalPages

				# run callback (on pagingOptions init or currentPage/pageSize change)
				pageChanged = newVal.currentPage isnt oldVal.currentPage
				pageSizeChanged = newVal.pageSize isnt oldVal.pageSize
				if newVal is oldVal or pageChanged or pageSizeChanged
					getPageData()

			, true

			# watch loading status
			if scope.options.loading
				scope.$parent.$watch scope.options.loading, (newValue) ->
					scope.loading = newValue

			# get new page data
			getPageData = ->
				cb = scope.$parent[scope.options.pagingOptions.callback]
				cb scope.options.pagingOptions, scope.options.sort, scope.appliedFilters

			# provide methods to page forward/back in footer template
			scope.nextPage = ->
				scope.pagingOptions.currentPage += 1
			scope.prevPage = ->
				scope.pagingOptions.currentPage -= 1

			# provide a hook to parent scope
			scope.parent = scope.$parent

			# keep track of column filters & watch for value changes
			scope.columnFilters = []
			for column, index in scope.options.columns
				if column.filter

					# ensure values property exists
					defaultValues = fixtableFilterTypes[column.filter.type].defaultValues
					column.filter.values ?= angular.copy(defaultValues) or {}

					# track this filter object
					scope.columnFilters.push
						type: column.filter.type
						property: column.property
						values: column.filter.values

					# watch for changes to the values object
					valuesObj = 'options.columns[' + index + '].filter.values'
					scope.$watch valuesObj, (newVal, oldVal) ->
						return if newVal is oldVal
						currentFilters = getCurrentFilterValues()
						if angular.equals currentFilters, scope.appliedFilters
							scope.filtersDirty = false
						else
							scope.filtersDirty = true
							if scope.options.realtimeFiltering
								scope.applyFilters()
					, true

			# re-calculate dimensions when apply button visibility changes
			unless scope.options.realtimeFiltering
				scope.$watch 'filtersDirty', ->
					$timeout -> fixtable.setDimensions() # next digest cycle

			# apply updated filter values
			scope.applyFilters = ->
				scope.appliedFilters = getCurrentFilterValues()
				scope.filtersDirty = false
				updateData()

			getCurrentFilterValues = ->
				obj = {}
				for filter in scope.columnFilters
					obj[filter.property] =
						type: filter.type
						values: angular.copy filter.values
				obj

			# set appliedFilters to initial filter values
			scope.appliedFilters = getCurrentFilterValues()

			# get templateUrl for a given filter type
			scope.getFilterTemplate = (filterType) ->
				fixtableFilterTypes[filterType].templateUrl

			scope.changeSort = (property) ->
				scope.options.sort ?= {}
				if scope.options.sort.property is property
					dir = scope.options.sort.direction
					scope.options.sort.direction = if dir is 'asc' then 'desc' else 'asc'
				else
					scope.options.sort.property = property
					scope.options.sort.direction = 'asc'
				updateData()

			updateData = ->

				# run callback method to get sorted/filtered data
				if scope.options.paging then getPageData()

				# or do it all here if we have the full dataset
				else filterAndSortData()

			filterAndSortData = ->

				# start with a fresh copy of data from parent
				scope.data = scope.$parent[scope.options.data]?.slice(0) or []

				# sort
				if scope.options.sort?.property

					# get custom compare function or fallback to standard compareFn
					for col in scope.options.columns
						if col.property is scope.options.sort.property
							if col.sortCompareFunction
								customCompareFn = col.sortCompareFunction
								break
					compareFn = customCompareFn or (a, b) ->
						aVal = a[scope.options.sort.property]
						bVal = b[scope.options.sort.property]
						if aVal > bVal then return 1
						else if aVal < bVal then return -1
						else return 0

					scope.data.sort (a, b) ->
						dir = scope.options.sort.direction
						compared = compareFn a, b
						return if dir is 'asc' then compared else ~--compared

				# filter
				if scope.data.length
					for i in [0..scope.data.length-1].reverse()
						for filter in scope.columnFilters
							filterFn = fixtableFilterTypes[filter.type].filterFn
							unless filterFn scope.data[i][filter.property], filter.values
								scope.data.splice i, 1
								break

				# re-calculate dimensions since column widths may have changed
				$timeout -> fixtable.setDimensions()

		replace: true
		restrict: 'E'
		scope:
			options: '='
		templateUrl: 'fixtable/templates/fixtable.html'
]
