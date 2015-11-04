'use strict';

// Declare app level module which depends on views, and components
angular.module('scanthisApp', [

  'scanthisApp.directives',
  'scanthisApp.routing',
  'scanthisApp.filters',
  'scanthisApp.factories',
  
  'scanthisApp.formController',
  'scanthisApp.itemController',
  'scanthisApp.packingController',
  'scanthisApp.createlotController',
  'scanthisApp.setsupplierController',
  'scanthisApp.movelotController',
  'monospaced.qrcode'
])




/*
 *Controllers used on most pages to set station and stage
 */

.controller('SetStation', function($scope, $http, DatabaseServices) {

  $scope.GetStationInfo = function(station_id){
    var query = '?id=eq.' + station_id;
    var func = function(response){
      $scope.station_info = response.data[0].station_info;
    };
    DatabaseServices.GetEntries('station', func, query);
  };


  $scope.init = function(station_id){
    $scope.station_id = station_id;
    $scope.GetStationInfo(station_id);
    $scope.entry = {};
    $scope.list = {};
    $scope.qr = {};
    $scope.scan = {};
    $scope.form = {};
  };


  $scope.QRWindowOpen = function(aString){
    var newWin = $window.open('/#/qrcode');
    newWin.aString = aString;
  };
})

.controller('SetStage', function($scope, $http) {
  $scope.init = function(stage_id){
    $scope.stage_id = stage_id;
    $scope.current = {};
  };
})

.controller('SetProcessor', function($scope, $http) {
  $scope.init = function(processor){
    $scope.processor = processor;
  };
})


;





