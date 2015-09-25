'use strict';

angular.module('scanthisApp.harsam_retouching', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_retouching', {
    templateUrl: 'harsam_retouching/harsam_retouching.html'
  });
}])

.controller('harsamRetouchingCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});

  $scope.InitItemAdd(3, 3, ['weight_1','grade']);

  $scope.ListLots($scope.stage_id);
 
});
