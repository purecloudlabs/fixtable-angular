angular.module 'fixtable', []
angular.module 'fixtable'
.directive 'fixtable', [
	->
		link: (scope, element, attrs) ->
			fixtable = new Fixtable element
			scope.$watch 'data', ->
				fixtable._setHeaderHeight()
				for col, i in scope.options.columns
					if col.width then fixtable._setColumnWidth i+1, col.width
				scope.data = scope.$parent[scope.options.data]
		replace: true
		restrict: 'A'
		scope:
			options: '=fixtable'
		templateUrl: 'fixtable/templates/fixtable.html'
]