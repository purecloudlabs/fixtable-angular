angular.module 'fixtable', []
angular.module 'fixtable'
.controller 'cellCtrl', [
	'$scope'
	'$rootScope'
	($scope, $rootScope) ->

		$scope.editing = false

		$scope.getCellTemplate = ->
			normalTemplate = $scope.col.template or 'fixtable/templates/bodyCell.html'
			editTemplate = $scope.col.editTemplate or $scope.options.editTemplate or 'fixtable/templates/editCell.html'
			if $scope.editing then editTemplate else normalTemplate

		$scope.beginEdit = ->
			return unless $scope.col.editable
			$scope.editing = true
			$scope.$emit 'fixtableBeginEdit'

		$scope.endEdit = ->
			$scope.editing = false
			$scope.$emit 'fixtableEndEdit'

		# go to next row when user presses enter
		$scope.handleKeypress = (event) ->
			if event.which is 13
				$scope.endEdit()
				$scope.$emit 'fixtableFocusOnCell',
					colIndex: $scope.colIndex
					rowIndex: $scope.rowIndex + 1

		# stop editing when user begins editing another cell
		$rootScope.$on 'fixtableBeginEdit', (event) ->
			unless $scope is event.targetScope then $scope.editing = false

		# begin editing when cell is at coordinates specified in event
		$rootScope.$on 'fixtableFocusOnCell', (event, attrs) ->
			if attrs.colIndex is $scope.colIndex and attrs.rowIndex is $scope.rowIndex
				$scope.beginEdit()

]
angular.module 'fixtable'
.directive 'fixtable', [
	'$timeout'
	'fixtableDefaultOptions'
	($timeout, fixtableDefaultOptions) ->
		link: (scope, element, attrs) ->

			fixtable = new Fixtable element

			# use default options to fill in missing values
			for key, value of fixtableDefaultOptions
				unless Object::hasOwnProperty.call scope.options, key
					scope.options[key] = value

			# circulate styles on table elements in next digest cycle
			$timeout -> fixtable._circulateStyles()

			# update table data & calculated styles when source data changes
			scope.$parent.$watchCollection scope.options.data, (newData) ->
				scope.data = newData
				$timeout ->
					for col, i in scope.options.columns
						if col.width then fixtable._setColumnWidth i+1, col.width
					fixtable._setHeaderHeight()
					fixtable._setFooterHeight()

			# refresh when paging options change
			scope.$watch 'options.pagingOptions', (opt) ->
				return unless opt
				opt.currentPage = parseInt opt.currentPage
				scope.totalPages = Math.ceil(opt.totalItems / opt.pageSize) or 1
				scope.totalPagesOoM = (scope.totalPages+"").length + 1
				if opt.currentPage > scope.totalPages
					opt.currentPage = scope.totalPages
				scope.$parent[scope.options.pagingOptions.callback] opt
			, true

			# watch loading status
			if scope.options.loading
				scope.$parent.$watch scope.options.loading, (newValue) ->
					scope.loading = newValue

			# provide methods to page forward/back in footer template
			scope.nextPage = ->
				scope.pagingOptions.currentPage += 1
			scope.prevPage = ->
				scope.pagingOptions.currentPage -= 1

			# provide a hook to parent scope
			scope.parent = scope.$parent

		replace: true
		restrict: 'E'
		scope:
			options: '='
		templateUrl: 'fixtable/templates/fixtable.html'
]
angular.module 'fixtable'
.directive 'fixtableInput', [
	-> 
		replace: true
		restrict: 'E'
		templateUrl: 'fixtable/templates/fixtableInput.html'
		link: (scope, element, attrs) ->
			# immediately focus on the input
			element[0].focus()
]
angular.module 'fixtable'
.provider 'fixtableDefaultOptions', ->

	@defaultOptions = {}

	@$get = -> @defaultOptions

	@setDefaultOptions = (options) -> @defaultOptions = options

	null