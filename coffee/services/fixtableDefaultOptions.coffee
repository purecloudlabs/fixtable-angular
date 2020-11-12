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
    pagingOptions:
      type: null # [String] Value for the type of paging ()
      direction: null # [String] Value for the initial direction of paging (NEXT or PREVIOUS)
      callback: null # [String] Name of the callback function to use when retrieving page date (getNumberData)
      currentPage: null # [Number] The initial page and to count the page (1)
      hasNextPage: null # [Boolean] Set by the callback function to determine if a next page exists
      pageSize: null # [Number] Page size to send to the callback function (25)
      pageSizeOptions: null # [Array[Number]] Page size options for the UI
      processingPage: null # [Boolean] Used to communicate between fixtable and app to determine page processing
      reloadEvent: null # [String] Name of event to be broadcast when an application needs to reload the current page (reloadNumbers)
      resetOnFilterChange: true # [Boolean] Reset current page when the filters change

  @$get = -> @defaultOptions

  @setDefaultOptions = (options) ->
    for option, value of options
      @defaultOptions[option] = value

  null
