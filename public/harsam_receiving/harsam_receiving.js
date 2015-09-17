'use strict';

angular.module('scanthisApp.harsam_receiving', ['ngRoute', 'scanthisApp.shared'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_receiving', {
    templateUrl: 'harsam_receiving/harsam_receiving.html',
  });
}])

.controller('harsamReceivingCtrl', function($scope, $http, $injector, Entry) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 2;
  $scope.station_id = 1;

  var entry = new Entry({'weight_1': '', 'weight_2': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id});
  $scope.entry = entry;

  $scope.showScan = true;
  $scope.showSummary = false;
  $scope.view_summary = "view summary";

  $scope.updateFunction = function(fish) {
    entry.weight_1 = (angular.copy(fish.w1)).toFixed(2);
    entry.weight_2 = (angular.copy(fish.w2)).toFixed(2);
  };

  $scope.GetCurrentLotNumber($scope.updateFunction);
 
})

.controller('harsamTrimmingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 2;
  $scope.station_id = 2;
  $scope.entry = {'weight_1': '', 'grade': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};


  $scope.showScan = true;
  $scope.showSummary = false;
  $scope.view_summary = "view summary";
  
  $scope.updateFunction = function(fish) {
    $scope.entry.weight_1 = (angular.copy(fish.w1)).toFixed(2);
    $scope.entry.grade = angular.copy(fish.grade);
  };



  $scope.GetCurrentLotNumber($scope.updateFunction);
 
});
