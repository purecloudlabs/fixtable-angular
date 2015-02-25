(function() {
  angular.module('fixtable', []);

  angular.module('fixtable').directive('fixtable', [
    function() {
      return {
        link: function(scope, element, attrs) {
          var fixtable;
          fixtable = new Fixtable(element);
          return scope.$watch('data', function() {
            var col, i, j, len, ref;
            fixtable._setHeaderHeight();
            ref = scope.options.columns;
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
              col = ref[i];
              if (col.width) {
                fixtable._setColumnWidth(i + 1, col.width);
              }
            }
            return scope.data = scope.$parent[scope.options.data];
          });
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

angular.module('fixtable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('fixtable/templates/fixtable.html',
    "<div class=\"fixtable\"><div class=\"fixtable-inner\"><table><thead><tr><th ng-repeat=\"col in options.columns\"><div>{{ col.label }}</div></th></tr></thead><tbody><tr ng-repeat=\"row in data\"><td ng-repeat=\"col in options.columns\">{{ row[col.property] }}</td></tr></tbody></table></div></div>"
  );

}]);
