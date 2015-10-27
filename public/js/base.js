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
  'scanthisApp.incomingController',
  'monospaced.qrcode'
])




/*
 *Controllers used on most pages to set station and stage
 */

.controller('SetStation', function($scope, $http, $window) {
  $scope.init = function(station_id){
    $scope.station_id = station_id;
    $scope.entry = {};
    $scope.list = {};
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





