'use strict';

angular.module('scanthisApp.harsam_retouching', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_retouching', {
    templateUrl: 'harsam_retouching/harsam_retouching.html'
  });
}])

.controller('harsamRetouchingCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});

  $scope.stage_id = 3;
  $scope.station_id = 3;
  $scope.entry = {'weight_1': '', 'grade': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};

  $scope.ListLots($scope.stage_id);

  $scope.$watch('currentlot', function(newValue, oldValue) {
    $scope.ListEntries(newValue, $scope.station_id);
  });

  $scope.SetLot = function(lot_number){
    $http.patch('http://10.10.50.30:3000/stage?id=eq.' + $scope.stage_id, {'current_lot_number': lot_number}).then(function(response){
      $scope.currentlot = lot_number;
    }, function(response){
      alert(response.status);
    });
  };





  
  
 
});
