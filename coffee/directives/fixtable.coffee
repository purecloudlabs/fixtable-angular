angular.module 'fixtable'
.directive 'fixtable', [
	'$timeout'
	($timeout) ->
		link: (scope, element, attrs) ->
			fixtable = new Fixtable element

			scope.$watchCollection 'data', (newData) ->
				unless newData then return
				fixtable._copyHeaderStyles()
				fixtable._setHeaderHeight()
				for col, i in scope.options.columns
					if col.width then fixtable._setColumnWidth i+1, col.width
			scope.data = scope.$parent[scope.options.data]
		replace: true
		restrict: 'E'
		scope:
			options: '='
		templateUrl: 'fixtable/templates/fixtable.html'
]