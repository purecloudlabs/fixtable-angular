angular.module('fixtable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('fixtable/templates/fixtable.html',
    "<div class=\"fixtable\"><div class=\"fixtable-inner\"><table><thead><tr><th ng-repeat=\"col in options.columns\"><div>{{ col.label }}</div></th></tr></thead><tbody><tr ng-repeat=\"row in data\"><td ng-repeat=\"col in options.columns\">{{ row[col.property] }}</td></tr></tbody></table></div></div>"
  );

}]);
