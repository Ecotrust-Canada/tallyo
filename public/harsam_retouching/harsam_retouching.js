'use strict';

angular.module('scanthisApp.harsam_retouching', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_retouching', {
    templateUrl: 'harsam_retouching/harsam_retouching.html',
    controller: 'harsamRetouchingCtrl'
  });
}])

.controller('harsamRetouchingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 1;
  $scope.station_id = 6;
  $scope.entry = {'weight_1': '', 'grade': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};
  
  $scope.Weigh = function(grade){
    $scope.ReadInScale(9.02, 'weight_1');
    $scope.entry.grade = grade;
  };

  $scope.Confirm = function(clickEvent){
    $scope.GetCurrentLotNumber($scope.CreateEntry);
  };
  

  
 
});
