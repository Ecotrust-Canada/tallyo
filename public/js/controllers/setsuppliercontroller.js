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

  

  /*gets the the supplier from the current lot number*/
  $scope.SupplierFromLotNumber = function(lot_number){
    var func = function(response){
      $scope.supplier_lot = response.data[0];
      $scope.PatchStageWithLot(lot_number);
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntries('supplier_lot', func, query);
  };

  /*fill in fields in json obj*/
  $scope.MakeLotEntry = function(date, lot_number){
    $scope.lot_entry.lot_number = lot_number;        
    CreateEntryPeriod(date, 'week', $scope);
  };

  
  /*make a new lot in the database*/
  var DatabaseLot = function(lot_number){
    var func = function(){
      $scope.currentlot = lot_number;
      $scope.SupplierFromLotNumber($scope.currentlot);
    };
    DatabaseServices.DatabaseEntry('lot', $scope.lot_entry, func);
  };

  /*Gets current lot given selected supplier, if does not exist creates a new lot*/
  $scope.CreateLot = function(queryString, date){
    var func = function(response){
      if (response.data.length > 0){
        $scope.currentlot = response.data[0].lot_number;
        $scope.SupplierFromLotNumber($scope.currentlot);
      }//end if
      else{
        var lot_number = createLotNum($scope.stage_id, date);
        $scope.MakeLotEntry(date, lot_number);
        DatabaseLot(lot_number);  
      }
    };
    DatabaseServices.GetEntries('lot', func, queryString);
  };

  /*gets selected supplier, creates querystring for lot*/
  $scope.SupplierFromStage = function(supplier_id){  
    var date = new Date();
    var queryString = LotQuery({'supplier_id': supplier_id, 'date': date});
    $scope.lot_entry = {'stage_id': $scope.stage_id, 'supplier_id': supplier_id, 'lot_number': '', 'start_date': '', 'end_date': ''};
    $scope.CreateLot(queryString, date);
  };



  $scope.LotCode = function(lot_code){
    var func = function(response){
      $scope.CurrentLot();
    };
    var patch = {'internal_lot_code': lot_code};
    var query = '?lot_number=eq.' + $scope.supplier_lot.lot_number;
    DatabaseServices.PatchEntry('lot', patch, query, func);
  };







  $scope.CurrentLot = function(){
    var func = function(response){
      $scope.SupplierFromLotNumber(response.data[0].current_lot_number);
    };
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.GetEntries('stage', func, query);
  };

  $scope.CurrentLot();




  /*Sets the current lot number for the stage*/
  $scope.PatchStageWithLot = function(lot_number){
    var func = function(response){
      //$scope.currentlot = lot_number;
      //$scope.SupplierFromLotNumber($scope.currentlot);
    };
    var patch = {'current_lot_number': lot_number};
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.PatchEntry('stage', patch, query, func);
  };


});
