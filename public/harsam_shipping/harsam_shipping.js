'use strict';

angular.module('scanthisApp.harsam_shipping', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_shipping', {
    templateUrl: 'harsam_shipping/harsam_shipping.html',
  });
}])

.controller('harsamShippingCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});


  $scope.shipping_entry = {'po_number':'', 'customer': '', 'bill_of_lading':'', 'vessel_name':'', 'container_number':''};
  $scope.boxes = [];


});
