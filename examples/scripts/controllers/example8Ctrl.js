angular.module('examples')
    .controller('example8Ctrl', [
        '$scope',
        'rawData',
        function($scope, rawData){

            // get the first 10 items from the data array
            $scope.data = rawData.getData().slice(0, 100);

            // grabs the item in the dragIndex and inserts it into the dropIndex
            $scope.dragComplete = function (dragIndex, dropIndex) {
                var removed = $scope.data.splice(dragIndex, 1).shift();
                $scope.data.splice(dropIndex, 0, removed);
            };

            // set up fixtable
            $scope.localOptions = {
                data: 'data',
                columns: [
                    {
                        property: 'year',
                        label: 'Year',
                        width: 80
                    },
                    {
                        property: 'title',
                        label: 'Film'
                    },
                    {
                        property: 'director',
                        label: 'Director(s)'
                    },
                    {
                        property: 'rating',
                        label: 'Rating',
                        template: "examples/ratingImage.html",
                        width: 80
                    }
                ],
                tableClass: 'table',
                sort: false,
                dragging: true,
                draggingOptions: {
                    callback: 'dragComplete',
                    noScroll: true,
                    dragHandle: true
                }
            }
            $scope.options = angular.copy($scope.localOptions);

        }
    ]);