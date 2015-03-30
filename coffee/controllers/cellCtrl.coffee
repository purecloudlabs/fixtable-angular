angular.module 'fixtable'
.controller 'cellCtrl', [
	'$scope'
	'$rootScope'
	($scope, $rootScope) ->

		$scope.editing = false

		$scope.getCellTemplate = ->
			normalTemplate = $scope.col.template or $scope.options.cellTemplate
			editTemplate = $scope.col.editTemplate or $scope.options.editTemplate
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