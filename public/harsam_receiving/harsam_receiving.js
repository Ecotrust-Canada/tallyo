'use strict';

angular.module('scanthisApp.harsam_receiving', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_receiving', {
    templateUrl: 'harsam_receiving/harsam_receiving.html',
    controller: 'harsamReceivingCtrl'
  });
}])

.controller('harsamReceivingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 4;
  $scope.station_id = 4;
  $scope.entry = {'weight_1': '', 'weight_2': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};

  $scope.redo = function(column){
     $scope.entry[column] = '';
  };

  $scope.Confirm = function(clickEvent){
    $scope.GetCurrentLotNumber($scope.CreateEntry);
  };
  

  
 
});
