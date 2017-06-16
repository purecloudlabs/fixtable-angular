angular.module 'fixtable'
.directive 'fixtable', [
	'$timeout'
	'fixtableDefaultOptions'
	'fixtableFilterTypes'
	($timeout, fixtableDefaultOptions, fixtableFilterTypes) ->
		link: (scope, element, attrs) ->

			# use default options to fill in missing values
			for key, value of fixtableDefaultOptions
				unless Object::hasOwnProperty.call scope.options, key
					scope.options[key] = value

			# set up things for row selection
			if scope.options.rowSelection and not scope.options.columns[0].rowSelectionColumn
				scope.options.columns.unshift
					rowSelectionColumn: true
					width: scope.options.rowSelectionColumnWidth
			scope.$parent.$watchCollection scope.options.selectedItems, (newData) ->
				scope.selectedItems = newData

			fixtable = new Fixtable element[0], scope.options.debugMode

			# immediately set column widths & calculate dimensions of table elements
			for col, i in scope.options.columns
				if col.width then fixtable.setColumnWidth i+1, col.width
			fixtable.setDimensions()

			# setup paging value
			scope.options._paging = if typeof scope.options.paging is 'function' then scope.options.paging else -> scope.options.paging

			# update table data & calculated styles when source data changes
			scope.$parent.$watchCollection scope.options.data, (newData) ->
				scope.data = newData
				if !scope.options._paging() then filterAndSortData()
				$timeout ->
					fixtable.setDimensions()

					unless scope.options.draggingOptions?.noScroll
						fixtable.scrollTop()

			# update calculated styles when reflow property changes
			if scope.options.reflow
				scope.$parent.$watch scope.options.reflow, (newValue) ->
					if newValue then $timeout -> fixtable.setDimensions()

			scope.$watch 'options._paging()', (newVal, oldVal) ->
				return unless newVal?
				getPageData()

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
				if pageSizeChanged
					scope.options.pagingOptions.currentPage = 1

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
					defaultFilterFn = fixtableFilterTypes[column.filter.type].filterFn
					column.filter.values ?= angular.copy(defaultValues) or {}

					# track this filter object
					scope.columnFilters.push
						type: column.filter.type
						property: column.property
						values: column.filter.values
						filterFn: column.filter.filterFn or defaultFilterFn

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

			getSelectedItemIndex = (item) ->
				unless scope.selectedItems?.length then return -1
				for selectedItem, index in scope.selectedItems
					if angular.equals item, selectedItem
						return index
				return -1

			scope.rowSelected = (row) ->
				return getSelectedItemIndex(row) isnt -1

			scope.toggleRowSelection = (row, event) ->

				# don't toggle row if clicked element is in the ignore list
				if ignore = scope.options.rowSelectionIgnore
					ignoredElements = element[0].querySelectorAll ignore.join ','
					Array::slice.call ignoredElements
					if Array::slice.call(ignoredElements).indexOf(event.target) >= 0 then return

				if scope.rowSelected row
					scope.selectedItems.splice getSelectedItemIndex(row), 1
					scope.$emit 'fixtableUnselectRow', row
				else
					scope.selectedItems.push row
					scope.$emit 'fixtableSelectRow', row

			scope.pageSelected = ->
				unless scope.selectedItems?.length and scope.data?.length then return false
				for row in scope.data
					unless scope.rowSelected(row) or scope.options.rowSelectionDisabled(row) then return false
				return true

			scope.pagePartiallySelected = ->
				unless scope.selectedItems?.length and scope.data?.length then return false
				if scope.pageSelected() then return false
				for row in scope.data
					if scope.rowSelected(row) then return true
				return false

			scope.togglePageSelection = ->
				if scope.pageSelected()
					for row in scope.data
						continue if scope.options.rowSelectionDisabled row
						if scope.rowSelected(row)
							scope.selectedItems.splice getSelectedItemIndex(row), 1
					scope.$emit 'fixtableUnselectAllRows'
				else
					for row in scope.data
						continue if scope.options.rowSelectionDisabled row
						unless scope.rowSelected(row)
							scope.selectedItems.push row
					scope.$emit 'fixtableSelectAllRows'

			scope.$on 'fixtable-drag-start', (eventData, eventScope) ->
				scope.currentDragScope = eventScope
				scope.$broadcast 'fixtable-drag-started', eventScope

			scope.$on 'fixtable-drag-end', ->
				scope.$broadcast 'fixtable-drag-ended'

			scope.$on 'fixtable-drag-drop', (eventData) ->
				scope.currentDropScope = eventData.targetScope

				if scope.currentDropScope and scope.currentDragScope
					dragIndex = (index for dragRow, index in scope.data when dragRow is scope.currentDragScope.row).shift()
					dropIndex = (index for dropRow, index in scope.data when dropRow is scope.currentDropScope.row).shift()

					cb = scope.$parent[scope.options.draggingOptions?.callback]
					if cb
						cb dragIndex, dropIndex

					scope.currentDropScope = null
					scope.currentDragScope = null
					scope.$apply()

			updateData = ->
				# run callback method to get sorted/filtered data
				if scope.options._paging() then getPageData()

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
							testValue = if filter.property then scope.data[i][filter.property] else scope.data[i]
							unless filter.filterFn testValue, filter.values
								scope.data.splice i, 1
								break

				# emit data length
				scope.$emit 'fixtableDataLength', scope.data.length

				# re-calculate dimensions since column widths may have changed
				$timeout -> fixtable.setDimensions()

		replace: true
		restrict: 'E'
		scope:
			options: '='
		templateUrl: 'fixtable/templates/fixtable.html'
]
