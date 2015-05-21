angular.module 'fixtable'
.directive 'fixtableIndeterminateCheckbox', [
	->
		restrict: 'A'
		link: (scope, element, attrs) ->
      attrs.$observe 'fixtableIndeterminateCheckbox', (newVal) ->
        element[0].indeterminate = if newVal is 'true' then true else false
]
