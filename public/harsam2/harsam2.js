'use strict';

angular.module('scanthisApp.harsam2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam2', {
    templateUrl: 'harsam2/harsam2.html',
    controller: 'harsam2Ctrl'
  });
}])

.controller('harsam2Ctrl', function($scope, $http, $injector) {
  $injector.invoke(SelectLotCtrl, this, {$scope: $scope});
});
