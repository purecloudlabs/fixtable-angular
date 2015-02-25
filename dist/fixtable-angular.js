(function() {
  angular.module('fixtable', []);

  angular.module('fixtable').directive('fixtable', [
    function() {
      return {
        link: function(scope, element, attrs) {
          var fixtable;
          alert('yo');
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
        restrict: 'A',
        scope: {
          options: '=fixtable'
        },
        templateUrl: 'fixtable/templates/fixtable.html'
      };
    }
  ]);

}).call(this);

//# sourceMappingURL=fixtable-angular.js.map
