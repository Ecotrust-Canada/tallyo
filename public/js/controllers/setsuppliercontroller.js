'use strict';


angular.module('scanthisApp.setsupplierController', [])

.controller('SetSupplierCtrl', function($scope, $http, $injector) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.stage_id = 2;
  

  $scope.ListSuppliers = function(){
    $scope.GetEntries('supplier', 'suppliers');
  };

  $scope.ListSuppliers();


  $scope.GetCurrentSupplier = function(){
    $http.get('http://10.10.50.30:3000/stage?id=eq.' + $scope.stage_id).then(function(response){
      var supplier_id = response.data[0].current_supplier_id;
      var query = '?id=eq.' + supplier_id;
      $scope.GetEntries('supplier', 'currentsupplier', query);
    }, function(response){
    });
    
  };

  $scope.PatchStageWithSupplier = function(supplier_id){
    var func = function(response){
      $scope.GetCurrentSupplier();
    };
    var patch = {"current_supplier_id": supplier_id};
    var query = '?id=eq.' + $scope.stage_id;
    $scope.PatchEntry('stage', patch, query, func);
  };

  $scope.GetCurrentSupplier();


});
