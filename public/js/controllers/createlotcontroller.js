'use strict';


angular.module('scanthisApp.createlotController', [])

.controller('CreateLotCtrl', function($scope, $http, DatabaseServices) {
  /*
   *Selecting current lot from drop down
   */

  /*list the available lots for the current stage*/
  $scope.ListLots = function(stage_id){
    var query = '?stage_id=eq.' + stage_id;
    var func = function(response){
      $scope.lots = response.data;
    };
    DatabaseServices.GetEntries('supplier_lot', func, query);
  };

  /*Sets the current lot number for the stage*/
  $scope.PatchStageWithLot = function(lot_number){
    var func = function(response){
      $scope.current.lot = lot_number;
    };
    var patch = {'current_lot_number': lot_number};
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.PatchEntryNoAlert('stage', patch, query, func);
  };

  $scope.ListLots($scope.stage_id);
  //$scope.current = {};

})

.controller('CurrentCtrl', function($scope, $http, DatabaseServices) {
  /*displays items in the summary table*/
  $scope.ListItems = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    var func = function(response){
      $scope.list.items = response.data;
      //$scope.ItemTotals(lot_number, station_id);
    };
    DatabaseServices.GetEntries('scan', func, query);
  };

  $scope.ItemTotals = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    var func = function(response){
      $scope.list.totals = response.data;
    };
    DatabaseServices.GetEntries('scan_total', func, query);
  };

  $scope.$watch('list.items.length', function(newValue, oldValue) {
    $scope.ItemTotals($scope.current.lot, $scope.station_id);
  });

   /*supplier information from lot number*/
  $scope.SupplierFromLotNumber = function(lot_number){
    var func = function(response){
      $scope.current.supplier_lot = response.data[0];
      $scope.ListItems(lot_number, $scope.station_id);
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntryNoAlert('supplier_lot', func, query);
  };

  /*gets lot number from stage*/
  $scope.GetCurrentLot = function(){
    var func = function(response){
      $scope.current.lot = response.data[0].current_lot_number;
    };
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.GetEntries('stage', func, query);
  };

  $scope.GetCurrentLot();

  $scope.$watch('current.lot', function(newValue, oldValue) {
    $scope.SupplierFromLotNumber($scope.current.lot);
  });

})
.controller('CurrentCtrlloin', function($scope, $http, DatabaseServices) {
  /*displays items in the summary table*/
  $scope.ListItems = function(lot_number){
    var query = '?lot_number=eq.' + lot_number;
    var func = function(response){
      $scope.list.items = response.data;
    };
    DatabaseServices.GetEntries('loin', func, query);
  };

   /*supplier information from lot number*/
  $scope.SupplierFromLotNumber = function(lot_number){
    var func = function(response){
      $scope.current.supplier_lot = response.data[0];
      $scope.ListItems(lot_number);
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntryNoAlert('supplier_lot', func, query);
  };

  /*gets lot number from stage*/
  $scope.GetCurrentLot = function(){
    var func = function(response){
      $scope.current.lot = response.data[0].current_lot_number;
    };
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.GetEntries('stage', func, query);
  };

  $scope.GetCurrentLot();

  $scope.$watch('current.lot', function(newValue, oldValue) {
    $scope.SupplierFromLotNumber($scope.current.lot);
  });

});
