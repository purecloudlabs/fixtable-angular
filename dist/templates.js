angular.module('fixtable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('fixtable/templates/applyFilters.html',
    "<button type=\"button\" ng-click=\"applyFilters()\">Apply</button>"
  );


  $templateCache.put('fixtable/templates/bodyCell.html',
    "{{ row[col.property] }}"
  );


  $templateCache.put('fixtable/templates/columnFilters/search.html',
    "<input type=\"text\" ng-model=\"values.query\">"
  );


  $templateCache.put('fixtable/templates/columnFilters/select.html',
    "<select ng-model=\"values.selected\" ng-options=\"opt.value as opt.label for opt in options.selectOptions\"><option value=\"\">{{ options.nullOptionLabel || 'All' }}</option></select>"
  );


  $templateCache.put('fixtable/templates/editCell.html',
    "<fixtable-input></fixtable-input>"
  );


  $templateCache.put('fixtable/templates/fixtable.html',
    "<div class=\"fixtable\"><div class=\"fixtable-header\"></div><div class=\"fixtable-filters\" ng-show=\"columnFilters.length\"><div ng-show=\"!options.realtimeFiltering && filtersDirty\" ng-include=\"options.applyFiltersTemplate\"></div></div><div class=\"fixtable-inner\"><table ng-class=\"options.tableClass\"><thead><tr class=\"fixtable-column-headers\"><th ng-repeat=\"(colIndex, col) in options.columns\" ng-click=\"col.sortable && changeSort(col.property)\" ng-class=\"{'fixtable-sortable-column-header': col.sortable}\" class=\"{{ col.headerClass }}\"><div ng-include=\"options.headerTemplate\"></div></th></tr><tr class=\"fixtable-column-filters\"><th ng-repeat=\"(colIndex, col) in options.columns\"><div ng-if=\"col.filter\" ng-include=\"getFilterTemplate(col.filter.type)\" ng-init=\"values=col.filter.values;options=col.filter.options\"></div></th></tr></thead><tbody><tr ng-repeat=\"(rowIndex, row) in data\"><td class=\"{{ col.cellClass }}\" ng-repeat=\"(colIndex, col) in options.columns\" ng-include=\"getCellTemplate()\" ng-controller=\"cellCtrl\" ng-class=\"{'fixtable-cell-editing': editing, 'fixtable-cell-editable': col.editable}\" ng-click=\"beginEdit()\"></td></tr></tbody></table><div ng-if=\"loading\" ng-include=\"options.loadingTemplate\"></div></div><div class=\"fixtable-footer\" ng-show=\"options.paging\" ng-include=\"options.footerTemplate\" onload=\"pagingOptions = options.pagingOptions\"></div></div>"
  );


  $templateCache.put('fixtable/templates/fixtableInput.html',
    "<input ng-blur=\"endEdit()\" ng-keypress=\"handleKeypress($event)\" ng-model=\"row[col.property]\">"
  );


  $templateCache.put('fixtable/templates/footer.html',
    "Page <button type=\"button\" ng-disabled=\"pagingOptions.currentPage === 1\" ng-click=\"prevPage()\">&laquo;</button> <input type=\"text\" ng-model=\"pagingOptions.currentPage\" size=\"{{ totalPagesOoM }}\"> <button type=\"button\" ng-disabled=\"pagingOptions.currentPage === totalPages\" ng-click=\"nextPage()\">&raquo;</button> of {{ totalPages }} <span ng-if=\"pagingOptions.pageSizeOptions.length > 1\">&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<select ng-model=\"pagingOptions.pageSize\" ng-options=\"pageSize for pageSize in pagingOptions.pageSizeOptions\"></select>&nbsp;items per page</span>"
  );


  $templateCache.put('fixtable/templates/headerCell.html',
    "{{ col.label }} <span ng-if=\"options.sort.property === col.property\"><span class=\"fixtable-triangle\" ng-class=\"{'fixtable-triangle-reversed': options.sort.direction === 'asc'}\">&blacktriangledown;</span></span>"
  );


  $templateCache.put('fixtable/templates/loading.html',
    "<img class=\"loading-indicator\" src=\"data:image/gif;base64,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\">"
  );

}]);
