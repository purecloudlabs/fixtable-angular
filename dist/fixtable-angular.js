(function() {
  angular.module('fixtable', []);

  angular.module('fixtable').controller('cellCtrl', [
    '$scope', '$rootScope', function($scope, $rootScope) {
      $scope.editing = false;
      $scope.getCellTemplate = function() {
        var editTemplate, normalTemplate;
        normalTemplate = $scope.col.template || 'fixtable/templates/bodyCell.html';
        editTemplate = $scope.col.editTemplate || $scope.options.editTemplate || 'fixtable/templates/editCell.html';
        if ($scope.editing) {
          return editTemplate;
        } else {
          return normalTemplate;
        }
      };
      $scope.beginEdit = function() {
        if (!$scope.col.editable) {
          return;
        }
        $scope.editing = true;
        return $scope.$emit('fixtableBeginEdit');
      };
      $scope.endEdit = function() {
        $scope.editing = false;
        return $scope.$emit('fixtableEndEdit');
      };
      $scope.handleKeypress = function(event) {
        if (event.which === 13) {
          $scope.endEdit();
          return $scope.$emit('fixtableFocusOnCell', {
            colIndex: $scope.colIndex,
            rowIndex: $scope.rowIndex + 1
          });
        }
      };
      $rootScope.$on('fixtableBeginEdit', function(event) {
        if ($scope !== event.targetScope) {
          return $scope.editing = false;
        }
      });
      return $rootScope.$on('fixtableFocusOnCell', function(event, attrs) {
        if (attrs.colIndex === $scope.colIndex && attrs.rowIndex === $scope.rowIndex) {
          return $scope.beginEdit();
        }
      });
    }
  ]);

  angular.module('fixtable').directive('fixtable', [
    '$timeout', 'fixtableDefaultOptions', function($timeout, fixtableDefaultOptions) {
      return {
        link: function(scope, element, attrs) {
          var fixtable, key, value;
          fixtable = new Fixtable(element);
          for (key in fixtableDefaultOptions) {
            value = fixtableDefaultOptions[key];
            if (!Object.prototype.hasOwnProperty.call(scope.options, key)) {
              scope.options[key] = value;
            }
          }
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
            if (!opt) {
              return;
            }
            opt.currentPage = parseInt(opt.currentPage);
            scope.totalPages = Math.ceil(opt.totalItems / opt.pageSize) || 1;
            scope.totalPagesOoM = (scope.totalPages + "").length + 1;
            if (opt.currentPage > scope.totalPages) {
              opt.currentPage = scope.totalPages;
            }
            return scope.$parent[scope.options.pagingOptions.callback](opt);
          }, true);
          if (scope.options.loading) {
            scope.$parent.$watch(scope.options.loading, function(newValue) {
              return scope.loading = newValue;
            });
          }
          scope.nextPage = function() {
            return scope.pagingOptions.currentPage += 1;
          };
          scope.prevPage = function() {
            return scope.pagingOptions.currentPage -= 1;
          };
          return scope.parent = scope.$parent;
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

  angular.module('fixtable').directive('fixtableInput', [
    function() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'fixtable/templates/fixtableInput.html',
        link: function(scope, element, attrs) {
          return element[0].focus();
        }
      };
    }
  ]);

  angular.module('fixtable').provider('fixtableDefaultOptions', function() {
    this.defaultOptions = {};
    this.$get = function() {
      return this.defaultOptions;
    };
    this.setDefaultOptions = function(options) {
      return this.defaultOptions = options;
    };
    return null;
  });

}).call(this);

//# sourceMappingURL=fixtable-angular.js.map
