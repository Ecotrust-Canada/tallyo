'use strict';


angular.module('scanthisApp.setsupplierController', [])

.controller('SetSupplierCtrl', function($scope, $http, DatabaseServices) {

  /*
   *sets the supplier
   */

  
  /*display all suppliers*/
  $scope.ListSuppliers = function(){
    var func = function(response){
      $scope.suppliers = response.data;
    };
    DatabaseServices.GetEntries('supplier', func);
  };

  $scope.ListSuppliers();

  /*show selected supplier*/
  $scope.GetCurrentSupplier = function(){
    var func = function(response){
      $scope.currentsupplier = response.data;
    };
    var query = '?stage_id=eq.' + $scope.stage_id;
    DatabaseServices.GetEntries('supplier_stage', func, query);
  };

  /*assign one as current*/
  $scope.PatchStageWithSupplier = function(supplier_id){
    var func = function(response){
      $scope.GetCurrentSupplier();
    };
    var patch = {"current_supplier_id": supplier_id};
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.PatchEntry('stage', patch, query, func);
  };

  $scope.GetCurrentSupplier();

  /*$scope.$watch('currentlot', function(newValue, oldValue) {
      $scope.ListItems(newValue, $scope.station_id);
    });*/


});
