angular.module 'fixtable', []
angular.module 'fixtable'
.controller 'cellCtrl', [
	'$scope'
	'$rootScope'
	($scope, $rootScope) ->

		$scope.editing = false

		$scope.getCellTemplate = ->
			normalTemplate = $scope.col.template or $scope.options.cellTemplate
			editTemplate = $scope.col.editTemplate or $scope.options.editTemplate
			if $scope.editing then editTemplate else normalTemplate

		$scope.beginEdit = ->
			return unless $scope.col.editable
			$scope.editing = true
			$scope.$emit 'fixtableBeginEdit'

		$scope.endEdit = ->
			$scope.editing = false
			$scope.$emit 'fixtableEndEdit'

		# go to next row when user presses enter
		$scope.handleKeypress = (event) ->
			if event.which is 13
				$scope.endEdit()
				$scope.$emit 'fixtableFocusOnCell',
					colIndex: $scope.colIndex
					rowIndex: $scope.rowIndex + 1

		# stop editing when user begins editing another cell
		$rootScope.$on 'fixtableBeginEdit', (event) ->
			unless $scope is event.targetScope then $scope.editing = false

		# begin editing when cell is at coordinates specified in event
		$rootScope.$on 'fixtableFocusOnCell', (event, attrs) ->
			if attrs.colIndex is $scope.colIndex and attrs.rowIndex is $scope.rowIndex
				$scope.beginEdit()

]
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
			if scope.options.rowSelection
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

			# update table data & calculated styles when source data changes
			scope.$parent.$watchCollection scope.options.data, (newData) ->
				scope.data = newData
				unless scope.options.paging then filterAndSortData()
				$timeout ->
					fixtable.setDimensions()
					fixtable.scrollTop()

			# update calculated styles when reflow property changes
			if scope.options.reflow
				scope.$parent.$watch scope.options.reflow, (newValue) ->
					if newValue then $timeout -> fixtable.setDimensions()

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

			getSelectedItemIndex = (item) ->
				unless scope.selectedItems?.length then return -1
				for selectedItem, index in scope.selectedItems
					if angular.equals item, selectedItem
						return index
				return -1

			scope.rowSelected = (row) ->
				return getSelectedItemIndex(row) isnt -1

			scope.toggleRowSelection = (row) ->
				if scope.rowSelected row
					scope.selectedItems.splice getSelectedItemIndex(row), 1
				else
					scope.selectedItems.push row

			scope.pageSelected = ->
				unless scope.selectedItems?.length and scope.data?.length then return false
				for row in scope.data
					unless scope.rowSelected(row) then return false
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
						if scope.rowSelected(row)
							scope.selectedItems.splice getSelectedItemIndex(row), 1
				else
					for row in scope.data
						unless scope.rowSelected(row)
							scope.selectedItems.push row

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

angular.module 'fixtable'
.directive 'fixtableIndeterminateCheckbox', [
	->
		restrict: 'A'
		link: (scope, element, attrs) ->
      attrs.$observe 'fixtableIndeterminateCheckbox', (newVal) ->
        element[0].indeterminate = if newVal is 'true' then true else false
]

angular.module 'fixtable'
.directive 'fixtableInput', [
	-> 
		replace: true
		restrict: 'E'
		templateUrl: 'fixtable/templates/fixtableInput.html'
		link: (scope, element, attrs) ->
			# immediately focus on the input
			element[0].focus()
]
angular.module 'fixtable'
.provider 'fixtableDefaultOptions', ->

	@defaultOptions =
		applyFiltersTemplate: 'fixtable/templates/applyFilters.html'
		cellTemplate: 'fixtable/templates/bodyCell.html'
		checkboxCellTemplate: 'fixtable/templates/checkboxCell.html'
		checkboxHeaderTemplate: 'fixtable/templates/checkboxHeaderCell.html'
		debugMode: false
		editTemplate: 'fixtable/templates/editCell.html'
		footerTemplate: 'fixtable/templates/footer.html'
		headerTemplate: 'fixtable/templates/headerCell.html'
		loadingTemplate: 'fixtable/templates/loading.html'
		realtimeFiltering: true
		sortIndicatorTemplate: 'fixtable/templates/sortIndicator.html'
		rowSelection: false
		rowSelectionColumnWidth: 40
		rowSelectionWithCheckboxOnly: false
		selectedRowClass: 'active'

	@$get = -> @defaultOptions

	@setDefaultOptions = (options) ->
		for option, value of options
			@defaultOptions[option] = value

	null

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
