'use strict';

angular.module('scanthisApp.harsam_receiving', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_receiving', {
    templateUrl: 'harsam_receiving/harsam_receiving.html',
  });
}])

.controller('harsamReceivingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 2;
  $scope.station_id = 1;
  $scope.entry = {'weight_1': '', 'weight_2': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};

  $scope.showScan = true;
  $scope.showSummary = false;
  $scope.view_summary = "view summary";

  async.series([
        function(callback){ $scope.GetCurrentLotNumber(callback); }
    ],
    function(err, results){
      $scope.GetAllbyLotNumber($scope.current_lot_number, $scope.station_id);
    });
 
})

.controller('harsamTrimmingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 2;
  $scope.station_id = 2;
  $scope.entry = {'weight_1': '', 'grade': '', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};


  $scope.showScan = true;
  $scope.showSummary = false;
  $scope.view_summary = "view summary";

  async.series([
      function(callback){ $scope.GetCurrentLotNumber(callback); }
    ],
    function(err, results){
      $scope.GetAllbyLotNumber($scope.current_lot_number, $scope.station_id);
  });

 
});
