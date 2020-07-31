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
	'$rootScope'
	'$timeout'
	'fixtableDefaultOptions'
	'fixtableFilterTypes'
	($rootScope, $timeout, fixtableDefaultOptions, fixtableFilterTypes) ->
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

			updatePagingOptions = (newVal, oldVal) ->
				unless newVal then return 
				pageTypeChanged = newVal.type isnt oldVal.type
				
				newVal.currentPage = parseInt newVal.currentPage
				unless newVal.type is 'prevNext'
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

				if newVal is oldVal or pageChanged or pageSizeChanged or pageTypeChanged
					getPageData()

			# refresh when paging options change
			scope.$watch 'options.pagingOptions', (newVal, oldVal) ->
				if newVal is oldVal then return
				updatePagingOptions(newVal, oldVal)
			, true

			# watch loading status
			if scope.options.loading
				scope.$parent.$watch scope.options.loading, (newValue) ->
					scope.loading = newValue

			# get new page data
			getPageData = (reload = false) ->
				cb = scope.$parent[scope.options.pagingOptions.callback]
				cb scope.options.pagingOptions, scope.options.sort, scope.appliedFilters, reload

			console.log "scope.options.pagingOptions.type", scope.options.pagingOptions?.type
			# provide methods to page forward/back in footer template
			do setPagingActions = ->
				if scope.options.pagingOptions?.type is 'prevNext'
					# does not use page numbers
					scope.nextPage = ->
						scope.options.pagingOptions.direction = 'NEXT'
						scope.options.pagingOptions.currentPage += 1
						updatePagingOptions(scope.options.pagingOptions, scope.options.pagingOptions)
					scope.prevPage = ->
						scope.options.pagingOptions.direction = 'PREVIOUS'
						scope.options.pagingOptions.currentPage -= 1
						updatePagingOptions(scope.options.pagingOptions, scope.options.pagingOptions)
				else
					scope.nextPage = ->
						scope.options.pagingOptions.currentPage += 1
					scope.prevPage = ->
						scope.options.pagingOptions.currentPage -= 1
						
				console.log "nextPage", scope.nextPage
				console.log "prevPage", scope.prevPage

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
					if item.id is selectedItem.id
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

			if scope.options.pagingOptions
				scope.$on scope.options.pagingOptions.reloadEvent, ->
					getPageData(true)

			updateData = ->
				# run callback method to get sorted/filtered data
				if scope.options._paging()
					getPageData()
					# re-calculate dimensions since column widths may have changed
					$timeout -> fixtable.setDimensions()

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

angular.module('fixtable').directive 'fixtableDraggable', [
  '$document'
  ($document) ->
    restrict: 'A'
    link: (scope, element, attrs) ->
      canDrag = false
      draggableElement = angular.element(element)
      dragElement = null

      scope.cleanup = ->
        el = angular.element(element)
        el.off 'dragstart'
        el.off 'dragend'
        el.off 'drag'

      attrs.$observe 'fixtableDraggable', (newVal) ->
        canDrag = if newVal is 'true' then true else false
        draggableElement.attr "draggable", canDrag

        if canDrag
          draggableElement.on 'dragstart', (e) ->
            offsetX = e.offsetX || e.originalEvent?.offsetX
            offsetY = e.offsetY || e.originalEvent?.offsetY

            dragElement = draggableElement.clone()
            dragElement.addClass 'fixtable-drag-element-live'
            dragElement.css
              position: 'absolute'
              top: '-1000px'

            sourceChildren = draggableElement.children()
            dragChildren = dragElement.children()

            for child, index in sourceChildren
              offsetWidth = sourceChildren[index].offsetWidth
              angular.element(dragChildren[index]).css "width", "#{offsetWidth}px"

            $document.find('body').prepend dragElement

            rowData =
              row: scope.row
              rowIndex: scope.rowIndex

            dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer
            dataTransfer.effectAllowed = 'move'

            try
              dataTransfer.setData 'text/plain', JSON.stringify rowData
              dataTransfer.setDragImage(dragElement[0], offsetX, offsetY)
            catch e
              dragElement.css
                position: 'fixed'
                'z-index': 1000
                cursor: 'none'
                opacity: '0.5'
              scope.dragOffset =
                offsetX:offsetX
                offsetY:offsetY
                rect: dragElement[0].getBoundingClientRect()
              dataTransfer.setData 'Text', JSON.stringify rowData

            draggableElement.addClass 'fixtable-drag-element'
            scope.$emit 'fixtable-drag-start', scope
            return true

          draggableElement.on 'dragend', ->
            scope.$emit 'fixtable-drag-end'
            draggableElement.removeClass 'fixtable-drag-element'
            dragElement.remove()
            scope.dragOffset = null

            return true

          draggableElement.on 'drag', (e) ->
            if scope.dragOffset and dragElement
              x = (e.pageX || e.originalEvent?.pageX) - scope.dragOffset.offsetX;
              y = (e.pageY || e.originalEvent?.pageY) - scope.dragOffset.rect.height

              dragElement.css
                left: x
                top: y
        else
          scope.cleanup()

      scope.$on '$destroy', ->
        scope.cleanup()
  ]

angular.module('fixtable').directive 'fixtableDroppable', [
  ->
    restrict: 'A'
    link: (scope, element, attrs) ->
      canDrop = false

      scope.cleanup = ->
        el = angular.element(element)
        el.off 'dragenter'
        el.off 'dragover'
        el.off 'dragleave'
        el.off 'drop'

      attrs.$observe 'fixtableDroppable', (newVal) ->
        canDrop = if newVal is 'true' then true else false

        if canDrop
          angular.element(element).on 'dragenter', (e) ->
            if e.preventDefault
              e.preventDefault()

            dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer
            dataTransfer.dropEffect = 'move'
            return false

          angular.element(element).on 'dragover', (e) ->
            if e.preventDefault
              e.preventDefault()

            dropIndex = scope.rowIndex
            draggedIndex = scope.currentDragScope?.rowIndex

            unless draggedIndex is dropIndex
              if draggedIndex > dropIndex
                angular.element(element).addClass 'fixtable-drop-above'
              else
                angular.element(element).addClass 'fixtable-drop-below'

            angular.element(element).addClass 'fixtable-drag-over'
            return false

          angular.element(element).on 'dragleave', ->
            angular.element(element).removeClass 'fixtable-drag-over'
            angular.element(element).removeClass 'fixtable-drop-above'
            angular.element(element).removeClass 'fixtable-drop-below'

          angular.element(element).on 'drop', (e) ->
            if e.preventDefault
              e.preventDefault()
            if e.stopPropagation
              e.stopPropagation()

            scope.$emit 'fixtable-drag-drop'
        else
          scope.cleanup()

      scope.$on 'fixtable-drag-started', (e,draggedScope)->
        unless scope.$parent.currentDragScope.$id is scope.$id
          angular.element(element).addClass 'fixtable-drop-target'

        scope.currentDragScope = draggedScope;

      scope.$on 'fixtable-drag-ended', ->
        scope.currentDragScope = null
        el = angular.element(element)
        el.removeClass 'fixtable-drop-target'
        el.removeClass 'fixtable-drag-over'
        el.removeClass 'fixtable-drop-above'
        el.removeClass 'fixtable-drop-below'
        el.triggerHandler 'mouseleave'

      scope.$on '$destroy', ->
        scope.cleanup()
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
		emptyTemplate: 'fixtable/templates/emptyMessage.html'
		headerTemplate: 'fixtable/templates/headerCell.html'
		loadingTemplate: 'fixtable/templates/loading.html'
		realtimeFiltering: true
		sortIndicatorTemplate: 'fixtable/templates/sortIndicator.html'
		rowSelection: false
		rowSelectionColumnWidth: 40
		rowSelectionDisabled: (row) -> return false
		rowSelectionWithCheckboxOnly: false
		selectedRowClass: 'active'
		dragging: false
		draggingOptions:
			noScroll: true
			dragHandle: false
			dragHandleWidth: 20

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
