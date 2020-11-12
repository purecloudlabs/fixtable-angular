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
    '$timeout', 'fixtableDefaultOptions', 'fixtableFilterTypes', 'fixtableConstants', function($timeout, fixtableDefaultOptions, fixtableFilterTypes, fixtableConstants) {
      return {
        link: function(scope, element, attrs) {
          var base, col, column, defaultFilterFn, defaultValues, filterAndSortData, fixtable, getCurrentFilterValues, getPageData, getSelectedItemIndex, i, index, j, k, key, len, len1, ref, ref1, setPagingActions, updateData, updatePagingOptions, value, valuesObj;
          for (key in fixtableDefaultOptions) {
            value = fixtableDefaultOptions[key];
            if (!Object.prototype.hasOwnProperty.call(scope.options, key)) {
              scope.options[key] = value;
            }
          }
          if (scope.options.rowSelection && !scope.options.columns[0].rowSelectionColumn) {
            scope.options.columns.unshift({
              rowSelectionColumn: true,
              width: scope.options.rowSelectionColumnWidth
            });
          }
          scope.$parent.$watchCollection(scope.options.selectedItems, function(newData) {
            return scope.selectedItems = newData;
          });
          fixtable = new Fixtable(element[0], scope.options.debugMode);
          ref = scope.options.columns;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            col = ref[i];
            if (col.width) {
              fixtable.setColumnWidth(i + 1, col.width);
            }
          }
          fixtable.setDimensions();
          scope.options._paging = typeof scope.options.paging === 'function' ? scope.options.paging : function() {
            return scope.options.paging;
          };
          scope.$parent.$watchCollection(scope.options.data, function(newData) {
            scope.data = newData;
            if (!scope.options._paging()) {
              filterAndSortData();
            }
            return $timeout(function() {
              var ref1;
              fixtable.setDimensions();
              if (!((ref1 = scope.options.draggingOptions) != null ? ref1.noScroll : void 0)) {
                return fixtable.scrollTop();
              }
            });
          });
          if (scope.options.reflow) {
            scope.$parent.$watch(scope.options.reflow, function(newValue) {
              if (newValue) {
                return $timeout(function() {
                  return fixtable.setDimensions();
                });
              }
            });
          }
          scope.$watch('options._paging()', function(newVal, oldVal) {
            if (newVal == null) {
              return;
            }
            return getPageData();
          });
          updatePagingOptions = function(newVal, oldVal) {
            var pageChanged, pageSizeChanged, pageTypeChanged;
            if (!newVal) {
              return;
            }
            pageTypeChanged = newVal.type !== oldVal.type;
            newVal.currentPage = parseInt(newVal.currentPage);
            if (newVal.type !== fixtableConstants.PREVNEXT) {
              scope.totalPages = Math.ceil(newVal.totalItems / newVal.pageSize) || 1;
              scope.totalPagesOoM = (scope.totalPages + "").length;
            }
            if (newVal.currentPage > scope.totalPages) {
              newVal.currentPage = scope.totalPages;
            }
            pageChanged = newVal.currentPage !== oldVal.currentPage;
            pageSizeChanged = newVal.pageSize !== oldVal.pageSize;
            if (pageSizeChanged) {
              scope.options.pagingOptions.currentPage = 1;
            }
            if (newVal === oldVal || pageChanged || pageSizeChanged || pageTypeChanged) {
              return getPageData();
            }
          };
          scope.$watch('options.pagingOptions', function(newVal, oldVal) {
            if (newVal === oldVal) {
              return;
            }
            if (scope.pagingOptions.type && newVal.currentPage !== oldVal.currentPage) {
              return;
            }
            return updatePagingOptions(newVal, oldVal);
          }, true);
          if (scope.options.loading) {
            scope.$parent.$watch(scope.options.loading, function(newValue) {
              return scope.loading = newValue;
            });
          }
          getPageData = function(reload) {
            var cb;
            if (reload == null) {
              reload = false;
            }
            cb = scope.$parent[scope.options.pagingOptions.callback];
            return cb(scope.options.pagingOptions, scope.options.sort, scope.appliedFilters, reload);
          };
          (setPagingActions = function() {
            var ref1;
            if (((ref1 = scope.options.pagingOptions) != null ? ref1.type : void 0) === fixtableConstants.PREVNEXT) {
              scope.nextPage = function() {
                scope.options.pagingOptions.processingPage = true;
                scope.options.pagingOptions.direction = fixtableConstants.NEXT;
                scope.options.pagingOptions.currentPage += 1;
                return updatePagingOptions(scope.options.pagingOptions, scope.options.pagingOptions);
              };
              return scope.prevPage = function() {
                scope.options.pagingOptions.processingPage = true;
                scope.options.pagingOptions.direction = fixtableConstants.PREVIOUS;
                scope.options.pagingOptions.currentPage -= 1;
                return updatePagingOptions(scope.options.pagingOptions, scope.options.pagingOptions);
              };
            } else {
              scope.nextPage = function() {
                return scope.options.pagingOptions.currentPage += 1;
              };
              return scope.prevPage = function() {
                return scope.options.pagingOptions.currentPage -= 1;
              };
            }
          })();
          scope.parent = scope.$parent;
          scope.columnFilters = [];
          ref1 = scope.options.columns;
          for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
            column = ref1[index];
            if (column.filter) {
              defaultValues = fixtableFilterTypes[column.filter.type].defaultValues;
              defaultFilterFn = fixtableFilterTypes[column.filter.type].filterFn;
              if ((base = column.filter).values == null) {
                base.values = angular.copy(defaultValues) || {};
              }
              scope.columnFilters.push({
                type: column.filter.type,
                property: column.property,
                values: column.filter.values,
                filterFn: column.filter.filterFn || defaultFilterFn
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
            var ref2;
            scope.appliedFilters = getCurrentFilterValues();
            scope.filtersDirty = false;
            if ((ref2 = scope.options.pagingOptions) != null ? ref2.resetOnFilterChange : void 0) {
              scope.options.pagingOptions.currentPage = 1;
            }
            return updateData();
          };
          getCurrentFilterValues = function() {
            var filter, l, len2, obj, ref2;
            obj = {};
            ref2 = scope.columnFilters;
            for (l = 0, len2 = ref2.length; l < len2; l++) {
              filter = ref2[l];
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
          getSelectedItemIndex = function(item) {
            var l, len2, ref2, ref3, selectedItem;
            if (!((ref2 = scope.selectedItems) != null ? ref2.length : void 0)) {
              return -1;
            }
            ref3 = scope.selectedItems;
            for (index = l = 0, len2 = ref3.length; l < len2; index = ++l) {
              selectedItem = ref3[index];
              if (scope.options.rowSelectionProperty && (item[scope.options.rowSelectionProperty] === selectedItem[scope.options.rowSelectionProperty])) {
                return index;
              } else if (angular.equals(item, selectedItem)) {
                return index;
              }
            }
            return -1;
          };
          scope.rowSelected = function(row) {
            return getSelectedItemIndex(row) !== -1;
          };
          scope.toggleRowSelection = function(row, event) {
            var ignore, ignoredElements;
            if (ignore = scope.options.rowSelectionIgnore) {
              ignoredElements = element[0].querySelectorAll(ignore.join(','));
              Array.prototype.slice.call(ignoredElements);
              if (Array.prototype.slice.call(ignoredElements).indexOf(event.target) >= 0) {
                return;
              }
            }
            if (scope.rowSelected(row)) {
              scope.selectedItems.splice(getSelectedItemIndex(row), 1);
              return scope.$emit('fixtableUnselectRow', row);
            } else {
              scope.selectedItems.push(row);
              return scope.$emit('fixtableSelectRow', row);
            }
          };
          scope.pageSelected = function() {
            var l, len2, ref2, ref3, ref4, row;
            if (!(((ref2 = scope.selectedItems) != null ? ref2.length : void 0) && ((ref3 = scope.data) != null ? ref3.length : void 0))) {
              return false;
            }
            ref4 = scope.data;
            for (l = 0, len2 = ref4.length; l < len2; l++) {
              row = ref4[l];
              if (!(scope.rowSelected(row) || scope.options.rowSelectionDisabled(row))) {
                return false;
              }
            }
            return true;
          };
          scope.pagePartiallySelected = function() {
            var l, len2, ref2, ref3, ref4, row;
            if (!(((ref2 = scope.selectedItems) != null ? ref2.length : void 0) && ((ref3 = scope.data) != null ? ref3.length : void 0))) {
              return false;
            }
            if (scope.pageSelected()) {
              return false;
            }
            ref4 = scope.data;
            for (l = 0, len2 = ref4.length; l < len2; l++) {
              row = ref4[l];
              if (scope.rowSelected(row)) {
                return true;
              }
            }
            return false;
          };
          scope.togglePageSelection = function() {
            var l, len2, len3, m, ref2, ref3, row;
            if (scope.pageSelected()) {
              ref2 = scope.data;
              for (l = 0, len2 = ref2.length; l < len2; l++) {
                row = ref2[l];
                if (scope.options.rowSelectionDisabled(row)) {
                  continue;
                }
                if (scope.rowSelected(row)) {
                  scope.selectedItems.splice(getSelectedItemIndex(row), 1);
                }
              }
              return scope.$emit('fixtableUnselectAllRows');
            } else {
              ref3 = scope.data;
              for (m = 0, len3 = ref3.length; m < len3; m++) {
                row = ref3[m];
                if (scope.options.rowSelectionDisabled(row)) {
                  continue;
                }
                if (!scope.rowSelected(row)) {
                  scope.selectedItems.push(row);
                }
              }
              return scope.$emit('fixtableSelectAllRows');
            }
          };
          scope.$on('fixtable-drag-start', function(eventData, eventScope) {
            scope.currentDragScope = eventScope;
            return scope.$broadcast('fixtable-drag-started', eventScope);
          });
          scope.$on('fixtable-drag-end', function() {
            return scope.$broadcast('fixtable-drag-ended');
          });
          scope.$on('fixtable-drag-drop', function(eventData) {
            var cb, dragIndex, dragRow, dropIndex, dropRow, ref2;
            scope.currentDropScope = eventData.targetScope;
            if (scope.currentDropScope && scope.currentDragScope) {
              dragIndex = ((function() {
                var l, len2, ref2, results;
                ref2 = scope.data;
                results = [];
                for (index = l = 0, len2 = ref2.length; l < len2; index = ++l) {
                  dragRow = ref2[index];
                  if (dragRow === scope.currentDragScope.row) {
                    results.push(index);
                  }
                }
                return results;
              })()).shift();
              dropIndex = ((function() {
                var l, len2, ref2, results;
                ref2 = scope.data;
                results = [];
                for (index = l = 0, len2 = ref2.length; l < len2; index = ++l) {
                  dropRow = ref2[index];
                  if (dropRow === scope.currentDropScope.row) {
                    results.push(index);
                  }
                }
                return results;
              })()).shift();
              cb = scope.$parent[(ref2 = scope.options.draggingOptions) != null ? ref2.callback : void 0];
              if (cb) {
                cb(dragIndex, dropIndex);
              }
              scope.currentDropScope = null;
              scope.currentDragScope = null;
              return scope.$apply();
            }
          });
          if (scope.options.pagingOptions) {
            scope.$on(scope.options.pagingOptions.reloadEvent, function() {
              return getPageData(true);
            });
          }
          updateData = function() {
            if (scope.options._paging()) {
              getPageData();
              return $timeout(function() {
                return fixtable.setDimensions();
              });
            } else {
              return filterAndSortData();
            }
          };
          return filterAndSortData = function() {
            var compareFn, customCompareFn, filter, l, len2, len3, len4, m, n, o, ref2, ref3, ref4, ref5, ref6, ref7, results, testValue;
            scope.data = ((ref2 = scope.$parent[scope.options.data]) != null ? ref2.slice(0) : void 0) || [];
            if ((ref3 = scope.options.sort) != null ? ref3.property : void 0) {
              ref4 = scope.options.columns;
              for (l = 0, len2 = ref4.length; l < len2; l++) {
                col = ref4[l];
                if (col.property === scope.options.sort.property) {
                  if (col.sortCompareFunction) {
                    customCompareFn = col.sortCompareFunction;
                    break;
                  }
                }
              }
              compareFn = customCompareFn || function(a, b) {
                var aVal, bVal;
                aVal = a[scope.options.sort.property];
                bVal = b[scope.options.sort.property];
                if (aVal > bVal) {
                  return 1;
                } else if (aVal < bVal) {
                  return -1;
                } else {
                  return 0;
                }
              };
              scope.data.sort(function(a, b) {
                var compared, dir;
                dir = scope.options.sort.direction;
                compared = compareFn(a, b);
                if (dir === 'asc') {
                  return compared;
                } else {
                  return ~--compared;
                }
              });
            }
            if (scope.data.length) {
              ref6 = (function() {
                results = [];
                for (var n = 0, ref5 = scope.data.length - 1; 0 <= ref5 ? n <= ref5 : n >= ref5; 0 <= ref5 ? n++ : n--){ results.push(n); }
                return results;
              }).apply(this).reverse();
              for (m = 0, len3 = ref6.length; m < len3; m++) {
                i = ref6[m];
                ref7 = scope.columnFilters;
                for (o = 0, len4 = ref7.length; o < len4; o++) {
                  filter = ref7[o];
                  testValue = filter.property ? scope.data[i][filter.property] : scope.data[i];
                  if (!filter.filterFn(testValue, filter.values)) {
                    scope.data.splice(i, 1);
                    break;
                  }
                }
              }
            }
            scope.$emit('fixtableDataLength', scope.data.length);
            return $timeout(function() {
              return fixtable.setDimensions();
            });
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

  angular.module('fixtable').directive('fixtableDraggable', [
    '$document', function($document) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var canDrag, dragElement, draggableElement;
          canDrag = false;
          draggableElement = angular.element(element);
          dragElement = null;
          scope.cleanup = function() {
            var el;
            el = angular.element(element);
            el.off('dragstart');
            el.off('dragend');
            return el.off('drag');
          };
          attrs.$observe('fixtableDraggable', function(newVal) {
            canDrag = newVal === 'true' ? true : false;
            draggableElement.attr("draggable", canDrag);
            if (canDrag) {
              draggableElement.on('dragstart', function(e) {
                var child, dataTransfer, dragChildren, index, j, len, offsetWidth, offsetX, offsetY, ref, ref1, rowData, sourceChildren;
                offsetX = e.offsetX || ((ref = e.originalEvent) != null ? ref.offsetX : void 0);
                offsetY = e.offsetY || ((ref1 = e.originalEvent) != null ? ref1.offsetY : void 0);
                dragElement = draggableElement.clone();
                dragElement.addClass('fixtable-drag-element-live');
                dragElement.css({
                  position: 'absolute',
                  top: '-1000px'
                });
                sourceChildren = draggableElement.children();
                dragChildren = dragElement.children();
                for (index = j = 0, len = sourceChildren.length; j < len; index = ++j) {
                  child = sourceChildren[index];
                  offsetWidth = sourceChildren[index].offsetWidth;
                  angular.element(dragChildren[index]).css("width", offsetWidth + "px");
                }
                $document.find('body').prepend(dragElement);
                rowData = {
                  row: scope.row,
                  rowIndex: scope.rowIndex
                };
                dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer;
                dataTransfer.effectAllowed = 'move';
                try {
                  dataTransfer.setData('text/plain', JSON.stringify(rowData));
                  dataTransfer.setDragImage(dragElement[0], offsetX, offsetY);
                } catch (_error) {
                  e = _error;
                  dragElement.css({
                    position: 'fixed',
                    'z-index': 1000,
                    cursor: 'none',
                    opacity: '0.5'
                  });
                  scope.dragOffset = {
                    offsetX: offsetX,
                    offsetY: offsetY,
                    rect: dragElement[0].getBoundingClientRect()
                  };
                  dataTransfer.setData('Text', JSON.stringify(rowData));
                }
                draggableElement.addClass('fixtable-drag-element');
                scope.$emit('fixtable-drag-start', scope);
                return true;
              });
              draggableElement.on('dragend', function() {
                scope.$emit('fixtable-drag-end');
                draggableElement.removeClass('fixtable-drag-element');
                dragElement.remove();
                scope.dragOffset = null;
                return true;
              });
              return draggableElement.on('drag', function(e) {
                var ref, ref1, x, y;
                if (scope.dragOffset && dragElement) {
                  x = (e.pageX || ((ref = e.originalEvent) != null ? ref.pageX : void 0)) - scope.dragOffset.offsetX;
                  y = (e.pageY || ((ref1 = e.originalEvent) != null ? ref1.pageY : void 0)) - scope.dragOffset.rect.height;
                  return dragElement.css({
                    left: x,
                    top: y
                  });
                }
              });
            } else {
              return scope.cleanup();
            }
          });
          return scope.$on('$destroy', function() {
            return scope.cleanup();
          });
        }
      };
    }
  ]);

  angular.module('fixtable').directive('fixtableDroppable', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var canDrop;
          canDrop = false;
          scope.cleanup = function() {
            var el;
            el = angular.element(element);
            el.off('dragenter');
            el.off('dragover');
            el.off('dragleave');
            return el.off('drop');
          };
          attrs.$observe('fixtableDroppable', function(newVal) {
            canDrop = newVal === 'true' ? true : false;
            if (canDrop) {
              angular.element(element).on('dragenter', function(e) {
                var dataTransfer;
                if (e.preventDefault) {
                  e.preventDefault();
                }
                dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer;
                dataTransfer.dropEffect = 'move';
                return false;
              });
              angular.element(element).on('dragover', function(e) {
                var draggedIndex, dropIndex, ref;
                if (e.preventDefault) {
                  e.preventDefault();
                }
                dropIndex = scope.rowIndex;
                draggedIndex = (ref = scope.currentDragScope) != null ? ref.rowIndex : void 0;
                if (draggedIndex !== dropIndex) {
                  if (draggedIndex > dropIndex) {
                    angular.element(element).addClass('fixtable-drop-above');
                  } else {
                    angular.element(element).addClass('fixtable-drop-below');
                  }
                }
                angular.element(element).addClass('fixtable-drag-over');
                return false;
              });
              angular.element(element).on('dragleave', function() {
                angular.element(element).removeClass('fixtable-drag-over');
                angular.element(element).removeClass('fixtable-drop-above');
                return angular.element(element).removeClass('fixtable-drop-below');
              });
              return angular.element(element).on('drop', function(e) {
                if (e.preventDefault) {
                  e.preventDefault();
                }
                if (e.stopPropagation) {
                  e.stopPropagation();
                }
                return scope.$emit('fixtable-drag-drop');
              });
            } else {
              return scope.cleanup();
            }
          });
          scope.$on('fixtable-drag-started', function(e, draggedScope) {
            if (scope.$parent.currentDragScope.$id !== scope.$id) {
              angular.element(element).addClass('fixtable-drop-target');
            }
            return scope.currentDragScope = draggedScope;
          });
          scope.$on('fixtable-drag-ended', function() {
            var el;
            scope.currentDragScope = null;
            el = angular.element(element);
            el.removeClass('fixtable-drop-target');
            el.removeClass('fixtable-drag-over');
            el.removeClass('fixtable-drop-above');
            el.removeClass('fixtable-drop-below');
            return el.triggerHandler('mouseleave');
          });
          return scope.$on('$destroy', function() {
            return scope.cleanup();
          });
        }
      };
    }
  ]);

  angular.module('fixtable').directive('fixtableIndeterminateCheckbox', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          return attrs.$observe('fixtableIndeterminateCheckbox', function(newVal) {
            return element[0].indeterminate = newVal === 'true' ? true : false;
          });
        }
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

  angular.module('fixtable').constant('fixtableConstants', {
    PREVNEXT: "prevNext",
    NEXT: "NEXT",
    PREVIOUS: "PREVIOUS"
  });

  angular.module('fixtable').provider('fixtableDefaultOptions', function() {
    this.defaultOptions = {
      applyFiltersTemplate: 'fixtable/templates/applyFilters.html',
      cellTemplate: 'fixtable/templates/bodyCell.html',
      checkboxCellTemplate: 'fixtable/templates/checkboxCell.html',
      checkboxHeaderTemplate: 'fixtable/templates/checkboxHeaderCell.html',
      debugMode: false,
      editTemplate: 'fixtable/templates/editCell.html',
      emptyTemplate: 'fixtable/templates/emptyMessage.html',
      footerTemplate: 'fixtable/templates/footer.html',
      headerTemplate: 'fixtable/templates/headerCell.html',
      loadingTemplate: 'fixtable/templates/loading.html',
      realtimeFiltering: true,
      sortIndicatorTemplate: 'fixtable/templates/sortIndicator.html',
      rowSelection: false,
      rowSelectionColumnWidth: 40,
      rowSelectionDisabled: function(row) {
        return false;
      },
      rowSelectionWithCheckboxOnly: false,
      selectedRowClass: 'active',
      dragging: false,
      draggingOptions: {
        noScroll: true,
        dragHandle: false,
        dragHandleWidth: 20
      },
      pagingOptions: {
        type: null,
        direction: null,
        callback: null,
        currentPage: null,
        hasNextPage: null,
        pageSize: null,
        pageSizeOptions: null,
        processingPage: null,
        reloadEvent: null,
        resetOnFilterChange: true
      }
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
        if (filterValues.selected == null) {
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
