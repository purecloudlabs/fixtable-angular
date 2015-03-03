(function() {
  angular.module('fixtable', []);

  angular.module('fixtable').directive('fixtable', [
    '$timeout', function($timeout) {
      return {
        link: function(scope, element, attrs) {
          var fixtable;
          fixtable = new Fixtable(element);
          $timeout(function() {
            return fixtable._circulateStyles();
          });
          scope.$parent.$watchCollection(scope.options.data, function(newData) {
            scope.data = newData;
            return $timeout(function() {
              var col, i, j, len, ref;
              ref = scope.options.columns;
              for (i = j = 0, len = ref.length; j < len; i = ++j) {
                col = ref[i];
                if (col.width) {
                  fixtable._setColumnWidth(i + 1, col.width);
                }
              }
              fixtable._setHeaderHeight();
              return fixtable._setFooterHeight();
            });
          });
          scope.$watch('options.pagingOptions', function(opt) {
            scope.totalPages = Math.ceil(opt.totalItems / opt.pageSize) || 1;
            scope.totalPagesOoM = Math.floor(Math.log10(opt.totalItems) + 1 || 1);
            if (opt.currentPage > scope.totalPages) {
              opt.currentPage = scope.totalPages;
            }
            return scope.$parent[scope.options.pagingOptions.callback](opt);
          }, true);
          scope.nextPage = function() {
            return scope.pagingOptions.currentPage += 1;
          };
          return scope.prevPage = function() {
            return scope.pagingOptions.currentPage -= 1;
          };
        },
        replace: true,
        restrict: 'E',
        scope: {
          options: '='
        },
        templateUrl: 'fixtable/templates/fixtable.html'
      };
    }
  ]);

}).call(this);

//# sourceMappingURL=fixtable-angular.js.map
