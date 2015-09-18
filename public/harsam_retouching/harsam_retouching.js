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

  $scope.ListLots($scope.stage_id);

  $scope.updateFunction = function(fish) {
    $scope.entry.weight_1 = (angular.copy(fish.w1)).toFixed(2);
    $scope.entry.grade = angular.copy(fish.grade);
  };

  $scope.GetCurrentLotNumber();


  
  
 
});
