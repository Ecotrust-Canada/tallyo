'use strict';

angular.module('scanthisApp.harsam_retouching', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_retouching', {
    templateUrl: 'harsam_retouching/harsam_retouching.html'
  });
}])

.controller('harsamRetouchingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 3;
  $scope.station_id = 3;
  $scope.entry = {'weight_1': '', 'grade': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};

  //$scope.ListLots($scope.stage_id);
  $scope.ListLots($scope.stage_id);

  $scope.SetLot = function(){
    async.series([
        function(callback){
            $scope.SetLotAsCurrent($scope.SelectedLot);
            callback(null, null);
        },
        function(callback){
            $scope.GetCurrentLotNumber($scope.updateFunction);
            callback(null, null);
        }
    ],
    function(err, results){
    });
    
  };


  $scope.updateFunction = function(fish) {
    $scope.entry.timestamp = moment(new Date()).format();
    $scope.entry.weight_1 = (angular.copy(fish.w1)).toFixed(2);
    $scope.entry.grade = angular.copy(fish.grade);
    $scope.entry.lot_number = $scope.current_lot_number;
  };

  $scope.GetCurrentLotNumber($scope.updateFunction);

  $scope.test = function(a, b){
    async.series([
        function(callback){
            console.log("a");
            callback(null, null);
        },
        function(callback){
          console.log("b");
            // do some more stuff ...
            callback(null, null);
        }
    ],
    // optional callback
    function(err, results){
        // results is now equal to ['one', 'two']
    });

  };

  
  
 
});
