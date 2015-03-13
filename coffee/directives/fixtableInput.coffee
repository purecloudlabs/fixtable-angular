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