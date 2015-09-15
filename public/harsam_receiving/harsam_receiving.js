'use strict';

angular.module('scanthisApp.harsam_receiving', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_receiving', {
    templateUrl: 'harsam_receiving/harsam_receiving.html',
  });
}])

.controller('harsamReceivingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 4;
  $scope.station_id = 4;
  $scope.entry = {'weight_1': '', 'weight_2': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};

  $scope.updateFunction = function(fish) {
    $scope.entry.weight_1 = angular.copy(fish.w1);
    $scope.entry.weight_2 = angular.copy(fish.w2);
  };

  $scope.GetCurrentLotNumber($scope.updateFunction);
 
})

.controller('harsamTrimmingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 4;
  $scope.station_id = 5;
  $scope.entry = {'weight_1': '', 'grade': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};
  
  $scope.updateFunction = function(fish) {
    $scope.entry.weight_1 = angular.copy(fish.w1);
    $scope.entry.grade = angular.copy(fish.grade);
  };

  

  $scope.GetCurrentLotNumber($scope.updateFunction);
 
});
