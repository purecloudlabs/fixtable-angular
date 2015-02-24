angular.module 'huxtable'
.directive 'huxtable', [
	->
		link: (scope, element, attrs) ->
			huxtable = new Huxtable element
			scope.$watch 'data', ->
				huxtable._setHeaderHeight()
				for col, i in scope.options.columns
					if col.width then huxtable._setColumnWidth i+1, col.width
				scope.data = scope.$parent[scope.options.data]
		replace: true
		restrict: 'A'
		scope:
			options: '=huxtable'
]