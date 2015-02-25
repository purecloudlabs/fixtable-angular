angular.module('fixtableExample').controller('ExampleCtrl', [
  '$scope', function($scope) {
    $scope.data = [
      {
        name: 'george',
        color: 'blue',
        description: 'here is a description'
      }
    ];
    $scope.addItem = function() {
      return $scope.data.push({
        name: 'another',
        color: 'blue',
        description: 'here is another item'
      });
    };
    return $scope.tableOptions = {
      data: 'data',
      columns: [
        {
          property: 'name',
          label: 'Name',
          width: 50
        }, {
          property: 'color',
          label: 'Color',
          width: 200
        }, {
          property: 'description',
          label: 'Description',
          width: 100
        }
      ]
    };
  }
]);