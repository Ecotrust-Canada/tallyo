'use strict';

angular.module('scanthisApp.harsam_shipping', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/harsam_shipping', {
    templateUrl: 'harsam_shipping/harsam_shipping.html',
  });
}])

.controller('harsamShippingCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});


  $scope.shippingentry = {'po_number':'', 'customer': '', 'bill_of_lading':'', 'vessel_name':'', 'container_number':''};
  $scope.boxes = [];

  $scope.createShippingEntry = function(form){

    for (var key in form){
      $scope.shippingentry[key] = form[key]; 
    }

    $http.post('http://10.10.50.30:3000/shipping', $scope.shippingentry, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      $scope.shipping = response.data;

    }, function(response){

    });

  };

  $scope.addBox = function(box_id){
    if (box_id && valueNotInArray($scope.boxes, box_id)){
      $http.patch('http://10.10.50.30:3000/box?id=eq.' + box_id, {'shipping_container': $scope.shipping.id}).then(function(response){
        $scope.box_id = null;        
        $scope.boxes.push(box_id);  
      }, function(response){       
      });
    }
  };


});
