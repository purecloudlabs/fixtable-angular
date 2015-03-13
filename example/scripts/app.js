angular.module('fixtableExample', ['fixtable']);

// cache some template partials for overriding fixtable display
angular.module('fixtableExample')
.run(['$templateCache', function($templateCache){
	$templateCache.put('partials/filmCell.html', '<em>{{ row.film }}</em>');
}]);