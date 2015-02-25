(function() {
  angular.module('fixtable', []);

  angular.module('fixtable').directive('fixtable', [
    '$timeout', function($timeout) {
      return {
        link: function(scope, element, attrs) {
          var fixtable;
          fixtable = new Fixtable(element);
          scope.$watchCollection('data', function(newData) {
            var col, i, j, len, ref;
            if (!newData) {
              return;
            }
            fixtable._circulateStyles();
            ref = scope.options.columns;
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
              col = ref[i];
              if (col.width) {
                fixtable._setColumnWidth(i + 1, col.width);
              }
            }
            return $timeout(function() {
              return fixtable._setHeaderHeight();
            });
          });
          return scope.data = scope.$parent[scope.options.data];
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
