'use strict';

// Declare app level module which depends on views, and components
angular.module('scanthisApp', [
  'ngRoute',
  'scanthisApp.directives',
  'scanthisApp.routing',
  'scanthisApp.filters',
  'scanthisApp.factories',
  
  'scanthisApp.formController',
  'scanthisApp.itemController',
  'scanthisApp.packingController',
  'scanthisApp.createlotController',
  'scanthisApp.setsupplierController',
  'scanthisApp.movelotController'
])

.controller('SetStation', function($scope, $http, $injector) {
  $scope.init = function(station_id){
    $scope.station_id = station_id;
  };
})

.controller('SetStage', function($scope, $http, $injector) {
  $scope.init = function(stage_id){
    $scope.stage_id = stage_id;
  };
});





