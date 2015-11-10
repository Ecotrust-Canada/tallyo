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
  'monospaced.qrcode'
])




/*
 *Controllers used on most pages to set station and stage
 */

.controller('SetStation', function($scope, $http, DatabaseServices) {

  $scope.GetStationInfo = function(station_code){
    var query = '?code=eq.' + station_code;
    var func = function(response){
      $scope.station_info = response.data[0].station_info;
    };
    DatabaseServices.GetEntries('station', func, query);
  };


  $scope.init = function(station_code){
    $scope.processor = station_code.substring(0, 3);
    $scope.station_code = station_code;    
    $scope.entry = {};
    $scope.list = {};
    $scope.qr = {};
    $scope.scan = {};
    $scope.form = {};
    $scope.current = {};
    $scope.GetStationInfo(station_code);
  };


 
})

/*.controller('SetStage', function($scope, $http) {
  $scope.init = function(stage_id){
    $scope.stage_id = stage_id;
    
  };
})*/


/*.controller('SetProcessor', function($scope, $http) {
  $scope.init = function(id){
  };
})*/

;





