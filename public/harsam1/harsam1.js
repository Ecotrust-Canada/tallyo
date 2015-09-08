'use strict';

angular.module('scanthisApp.harsam1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam1', {
    templateUrl: 'harsam1/harsam1.html',
    controller: 'harsam1Ctrl'
  });
}])

.controller('harsam1Ctrl', function($scope, $http, $injector) {
  $injector.invoke(ReceivingCtrl, this, {$scope: $scope});
});
