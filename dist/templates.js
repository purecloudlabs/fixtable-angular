angular.module('fixtable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('fixtable/templates/bodyCell.html',
    "{{ row[col.property] }}"
  );


  $templateCache.put('fixtable/templates/fixtable.html',
    "<div class=\"fixtable\"><div class=\"fixtable-header\"></div><div class=\"fixtable-inner\"><table ng-class=\"options.tableClass\"><thead><tr><th ng-repeat=\"(colIndex, col) in options.columns\"><div ng-include=\"options.headerTemplate || 'fixtable/templates/headerCell.html'\"></div></th></tr></thead><tbody><tr ng-repeat=\"(rowIndex, row) in data\"><td ng-repeat=\"(colIndex, col) in options.columns\" ng-include=\"col.template || 'fixtable/templates/bodyCell.html'\"></td></tr></tbody></table></div><div class=\"fixtable-footer\" ng-show=\"options.paging\" ng-include=\"options.footerTemplate || 'fixtable/templates/footer.html'\" onload=\"pagingOptions = options.pagingOptions\"></div></div>"
  );


  $templateCache.put('fixtable/templates/footer.html',
    "Page <button type=\"button\" ng-disabled=\"pagingOptions.currentPage === 1\" ng-click=\"prevPage()\">&laquo;</button> <input type=\"text\" ng-model=\"pagingOptions.currentPage\" size=\"{{ totalPagesOoM }}\"> <button type=\"button\" ng-disabled=\"pagingOptions.currentPage === totalPages\" ng-click=\"nextPage()\">&raquo;</button> of {{ totalPages }} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<select ng-model=\"pagingOptions.pageSize\" ng-options=\"pageSize for pageSize in pagingOptions.pageSizeOptions\"></select>&nbsp;items per page"
  );


  $templateCache.put('fixtable/templates/headerCell.html',
    "{{ col.label }}"
  );

}]);
