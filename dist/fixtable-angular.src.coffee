angular.module 'fixtable', []
angular.module 'fixtable'
.directive 'fixtable', [
	'$timeout'
	($timeout) ->
		link: (scope, element, attrs) ->
			fixtable = new Fixtable element
			scope.$watchCollection 'data', ->
				for col, i in scope.options.columns
					if col.width then fixtable._setColumnWidth i+1, col.width
				$timeout ->
					fixtable._setHeaderHeight()
			scope.data = scope.$parent[scope.options.data]
		replace: true
		restrict: 'E'
		scope:
			options: '='
		templateUrl: 'fixtable/templates/fixtable.html'
]