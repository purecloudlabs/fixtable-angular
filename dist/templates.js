angular.module('fixtable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('fixtable/templates/fixtable.html',
    "<div class=\"fixtable\"><div class=\"fixtable-header\"></div><div class=\"fixtable-inner\"><table ng-class=\"options.tableClass\"><thead><tr><th ng-repeat=\"col in options.columns\"><div>{{ col.label }}</div></th></tr></thead><tbody><tr ng-repeat=\"row in data\"><td ng-repeat=\"col in options.columns\">{{ row[col.property] }}</td></tr></tbody></table></div><div class=\"fixtable-footer\" ng-show=\"options.paging\" ng-include=\"options.footerTemplate || 'fixtable/templates/footer.html'\" onload=\"pagingOptions = options.pagingOptions\"></div></div>"
  );


  $templateCache.put('fixtable/templates/footer.html',
    "Page <button type=\"button\" ng-disabled=\"pagingOptions.currentPage === 1\" ng-click=\"prevPage()\">&laquo;</button> <input type=\"text\" value=\"{{ pagingOptions.currentPage }}\" size=\"{{ totalPagesOoM }}\"> <button type=\"button\" ng-disabled=\"pagingOptions.currentPage === totalPages\" ng-click=\"nextPage()\">&raquo;</button> of {{ totalPages }} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<select ng-model=\"pagingOptions.pageSize\" ng-options=\"pageSize for pageSize in pagingOptions.pageSizeOptions\"></select>&nbsp;items per page"
  );

}]);
