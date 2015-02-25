(function() {
  angular.module('fixtable', []);

  angular.module('fixtable').directive('fixtable', [
    '$timeout', function($timeout) {
      return {
        link: function(scope, element, attrs) {
          var fixtable;
          fixtable = new Fixtable(element);
          scope.$watchCollection('data', function(newData) {
            var col, i, j, len, ref, results;
            if (!newData) {
              return;
            }
            fixtable._copyHeaderStyles();
            fixtable._setHeaderHeight();
            ref = scope.options.columns;
            results = [];
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
              col = ref[i];
              if (col.width) {
                results.push(fixtable._setColumnWidth(i + 1, col.width));
              } else {
                results.push(void 0);
              }
            }
            return results;
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
