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
		footerTemplate: 'fixtable/templates/footer.html'
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
