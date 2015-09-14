'use strict';

angular.module('scanthisApp.harsam_trimming', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_trimming', {
    templateUrl: 'harsam_trimming/harsam_trimming.html',
    controller: 'harsamTrimmingCtrl'
  });
}])

.controller('harsamTrimmingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 4;
  $scope.station_id = 5;
  $scope.entry = {'weight_1': '', 'grade': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};
  
  $scope.Weigh = function(grade){
    $scope.ReadInScale(9.02, 'weight_1');
    $scope.entry.grade = grade;
  };
  
  $scope.Confirm = function(clickEvent){
    $scope.GetCurrentLotNumber($scope.CreateEntry);
  };
  

  
 
});
