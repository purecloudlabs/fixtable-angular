(function() {
  angular.module('fixtable', []);

  angular.module('fixtable').controller('cellCtrl', [
    '$scope', '$rootScope', function($scope, $rootScope) {
      $scope.editing = false;
      $scope.getCellTemplate = function() {
        var editTemplate, normalTemplate;
        normalTemplate = $scope.col.template || $scope.options.cellTemplate;
        editTemplate = $scope.col.editTemplate || $scope.options.editTemplate;
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
    '$timeout', 'fixtableDefaultOptions', 'fixtableFilterTypes', function($timeout, fixtableDefaultOptions, fixtableFilterTypes) {
      return {
        link: function(scope, element, attrs) {
          var base, column, defaultValues, fixtable, getCurrentFilterValues, getPageData, index, j, key, len, ref, updateData, value, valuesObj;
          fixtable = new Fixtable(element[0]);
          for (key in fixtableDefaultOptions) {
            value = fixtableDefaultOptions[key];
            if (!Object.prototype.hasOwnProperty.call(scope.options, key)) {
              scope.options[key] = value;
            }
          }
          $timeout(function() {
            return fixtable.moveTableStyles();
          });
          scope.$parent.$watchCollection(scope.options.data, function(newData) {
            scope.data = newData;
            return $timeout(function() {
              var col, i, j, len, ref;
              ref = scope.options.columns;
              for (i = j = 0, len = ref.length; j < len; i = ++j) {
                col = ref[i];
                if (col.width) {
                  fixtable.setColumnWidth(i + 1, col.width);
                }
              }
              fixtable.setDimensions();
              return fixtable.scrollTop();
            });
          });
          scope.$watch('options.pagingOptions', function(newVal, oldVal) {
            var pageChanged, pageSizeChanged;
            if (!newVal) {
              return;
            }
            newVal.currentPage = parseInt(newVal.currentPage);
            scope.totalPages = Math.ceil(newVal.totalItems / newVal.pageSize) || 1;
            scope.totalPagesOoM = (scope.totalPages + "").length + 1;
            if (newVal.currentPage > scope.totalPages) {
              newVal.currentPage = scope.totalPages;
            }
            pageChanged = newVal.currentPage !== oldVal.currentPage;
            pageSizeChanged = newVal.pageSize !== oldVal.pageSize;
            if (newVal === oldVal || pageChanged || pageSizeChanged) {
              return getPageData();
            }
          }, true);
          if (scope.options.loading) {
            scope.$parent.$watch(scope.options.loading, function(newValue) {
              return scope.loading = newValue;
            });
          }
          getPageData = function() {
            var cb;
            cb = scope.$parent[scope.options.pagingOptions.callback];
            return cb(scope.options.pagingOptions, scope.options.sort, scope.appliedFilters);
          };
          scope.nextPage = function() {
            return scope.pagingOptions.currentPage += 1;
          };
          scope.prevPage = function() {
            return scope.pagingOptions.currentPage -= 1;
          };
          scope.parent = scope.$parent;
          scope.columnFilters = [];
          ref = scope.options.columns;
          for (index = j = 0, len = ref.length; j < len; index = ++j) {
            column = ref[index];
            if (column.filter) {
              defaultValues = fixtableFilterTypes[column.filter.type].defaultValues;
              if ((base = column.filter).values == null) {
                base.values = angular.copy(defaultValues) || {};
              }
              scope.columnFilters.push({
                type: column.filter.type,
                property: column.property,
                values: column.filter.values
              });
              valuesObj = 'options.columns[' + index + '].filter.values';
              scope.$watch(valuesObj, function(newVal, oldVal) {
                var currentFilters;
                if (newVal === oldVal) {
                  return;
                }
                currentFilters = getCurrentFilterValues();
                if (angular.equals(currentFilters, scope.appliedFilters)) {
                  return scope.filtersDirty = false;
                } else {
                  scope.filtersDirty = true;
                  if (scope.options.realtimeFiltering) {
                    return scope.applyFilters();
                  }
                }
              }, true);
            }
          }
          if (!scope.options.realtimeFiltering) {
            scope.$watch('filtersDirty', function() {
              return $timeout(function() {
                return fixtable.setDimensions();
              });
            });
          }
          scope.applyFilters = function() {
            scope.appliedFilters = getCurrentFilterValues();
            scope.filtersDirty = false;
            return updateData();
          };
          getCurrentFilterValues = function() {
            var filter, k, len1, obj, ref1;
            obj = {};
            ref1 = scope.columnFilters;
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              filter = ref1[k];
              obj[filter.property] = {
                type: filter.type,
                values: angular.copy(filter.values)
              };
            }
            return obj;
          };
          scope.appliedFilters = getCurrentFilterValues();
          scope.getFilterTemplate = function(filterType) {
            return fixtableFilterTypes[filterType].templateUrl;
          };
          scope.changeSort = function(property) {
            var base1, dir;
            if ((base1 = scope.options).sort == null) {
              base1.sort = {};
            }
            if (scope.options.sort.property === property) {
              dir = scope.options.sort.direction;
              scope.options.sort.direction = dir === 'asc' ? 'desc' : 'asc';
            } else {
              scope.options.sort.property = property;
              scope.options.sort.direction = 'asc';
            }
            return updateData();
          };
          return updateData = function() {
            var filter, filterFn, i, k, l, len1, len2, m, ref1, ref2, ref3, ref4, results;
            if (scope.options.paging) {
              return getPageData();
            } else {
              scope.data = scope.$parent[scope.options.data].slice(0);
              if ((ref1 = scope.options.sort) != null ? ref1.property : void 0) {
                scope.data.sort(function(a, b) {
                  var aVal, bVal;
                  aVal = a[scope.options.sort.property];
                  bVal = b[scope.options.sort.property];
                  if (aVal > bVal) {
                    if (scope.options.sort.direction === 'asc') {
                      return 1;
                    }
                    if (scope.options.sort.direction === 'desc') {
                      return -1;
                    }
                  }
                  if (bVal > aVal) {
                    if (scope.options.sort.direction === 'asc') {
                      return -1;
                    }
                    if (scope.options.sort.direction === 'desc') {
                      return 1;
                    }
                  }
                  return 0;
                });
              }
              ref3 = (function() {
                results = [];
                for (var l = 0, ref2 = scope.data.length - 1; 0 <= ref2 ? l <= ref2 : l >= ref2; 0 <= ref2 ? l++ : l--){ results.push(l); }
                return results;
              }).apply(this).reverse();
              for (k = 0, len1 = ref3.length; k < len1; k++) {
                i = ref3[k];
                ref4 = scope.columnFilters;
                for (m = 0, len2 = ref4.length; m < len2; m++) {
                  filter = ref4[m];
                  filterFn = fixtableFilterTypes[filter.type].filterFn;
                  if (!filterFn(scope.data[i][filter.property], filter.values)) {
                    scope.data.splice(i, 1);
                    break;
                  }
                }
              }
              return $timeout(function() {
                return fixtable.setDimensions();
              });
            }
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
    this.defaultOptions = {
      applyFiltersTemplate: 'fixtable/templates/applyFilters.html',
      cellTemplate: 'fixtable/templates/bodyCell.html',
      editTemplate: 'fixtable/templates/editCell.html',
      footerTemplate: 'fixtable/templates/footer.html',
      headerTemplate: 'fixtable/templates/headerCell.html',
      loadingTemplate: 'fixtable/templates/loading.html',
      realtimeFiltering: true
    };
    this.$get = function() {
      return this.defaultOptions;
    };
    this.setDefaultOptions = function(options) {
      var option, results, value;
      results = [];
      for (option in options) {
        value = options[option];
        results.push(this.defaultOptions[option] = value);
      }
      return results;
    };
    return null;
  });

  angular.module('fixtable').provider('fixtableFilterTypes', function() {
    this.filterTypes = {};
    this.filterTypes.search = {
      defaultValues: {
        query: ''
      },
      templateUrl: 'fixtable/templates/columnFilters/search.html',
      filterFn: function(testValue, filterValues) {
        var pattern;
        pattern = new RegExp(filterValues.query, 'i');
        return pattern.test(testValue);
      }
    };
    this.filterTypes.select = {
      defaultValues: {
        selected: null
      },
      templateUrl: 'fixtable/templates/columnFilters/select.html',
      filterFn: function(testValue, filterValues) {
        if (!filterValues.selected) {
          return true;
        }
        return testValue === filterValues.selected;
      }
    };
    this.$get = function() {
      return this.filterTypes;
    };
    this.add = function(type, definition) {
      return this.filterTypes[type] = definition;
    };
    this.update = function(type, properties) {
      var property, results, value;
      results = [];
      for (property in properties) {
        value = properties[property];
        results.push(this.filterTypes[type][property] = value);
      }
      return results;
    };
    return null;
  });

}).call(this);

//# sourceMappingURL=fixtable-angular.js.map
