'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ItemCtrl', function($scope, $http, DatabaseServices) {

  /*
   *
   *Creating new entries in item table by weighing, grading fish etc.
   *Several parameters including whether to print label
   *
   *Includes functionality for selecting lot from dropdown
   *
   */

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

  /*Gets the supplier given the selected lot number*/
  $scope.SupplierFromLotNumber = function(lot_number){
    var func = function(response){
      $scope.supplier_lot = response.data[0];
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntries('supplier_lot', func, query);
  };

  /*Sets the current lot number for the stage*/
  $scope.PatchStageWithLot = function(lot_number){
    var func = function(response){
      $scope.currentlot = lot_number;
      //$scope.loin = 0;
    };
    var patch = {'current_lot_number': lot_number};
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.PatchEntry('stage', patch, query, func);
  };




  /*supplier information from lot number*/
  $scope.SupplierFromLotNumber = function(lot_number){
    var func = function(response){
      $scope.supplier_lot = response.data[0];
      $scope.ListItems($scope.supplier_lot.lot_number, $scope.station_id);
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntry('supplier_lot', func, query);
  };

  /*gets lot number from stage*/
  $scope.GetCurrentLot = function(){
    var func = function(response){
      $scope.SupplierFromLotNumber(response.data[0].current_lot_number);
      $scope.currentlot = response.data[0].current_lot_number;
    };
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.GetEntries('stage', func, query);
  };



  /*
   *Creating items
   */


  /*displays items in the summary table*/
  $scope.ListItems = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    var func = function(response){
      $scope.items = response.data;
      $scope.GetMaxLoin(lot_number, station_id);
    };
    DatabaseServices.GetEntries('item', func, query);
  };

  $scope.GetMaxLoin = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    var func = function(response){
      if (response.data.length >0){
        $scope.loin = response.data[0].max_loin + 1;
      }
      else {$scope.loin = 1;}
    };
    DatabaseServices.GetEntries('loin', func, query);
  };

  

  /*removes an item from the database*/
  $scope.RemoveItem = function(item_id){
    var query = '?id=eq.' + item_id;
    var func = function(){
      $scope.ListItems($scope.currentlot, $scope.station_id);
    };
    DatabaseServices.RemoveEntry('item', query, func);
  };

  /*creates a new row in the database, item table*/
  $scope.DatabaseItem = function(form){
    $scope.MakeItemEntry(form);
    var func = function(){
      Clear('item_entry', $scope);
      $scope.loin++;
      $scope.ListItems($scope.currentlot, $scope.station_id);
    };
    if (NoMissingValues($scope.item_entry)){
      DatabaseServices.DatabaseEntry('item', $scope.item_entry, func);
    }
    else{ alert("missing values"); }
  };


  /*fills in fields in json to submit to database*/
  $scope.MakeItemEntry = function(form){
    $scope.item_entry.lot_number = $scope.currentlot;
    $scope.item_entry.timestamp = moment(new Date()).format();
    $scope.item_entry.loin_id = $scope.loin;
    MakeEntry(form, 'item_entry', $scope);
  };

  /*switch between scanning and view summary*/
  $scope.show = function(){
    if ($scope.showSummary === false){
      $scope.showSummary = true;
      $scope.showScan = false;
      $scope.view_summary = "Back to scan";
    }
    else {
      $scope.showSummary = false;
      $scope.showScan = true;
      $scope.view_summary = "view summary";
    }
  };

  /*initialize with correct entry json object and display*/
  $scope.init = function(fields, options){
    $scope.item_entry = {'loin_id':'', 'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};
    $scope.fields = fields;
    $scope.options = options;
    //$scope.loin = 0;
    for (var key in fields){
      $scope.item_entry[key] = '';
    }
    if (options.summaryhidden === 'true'){
      InitShowSummary($scope);
    }
    else{
      $scope.showScan = true;
      $scope.showSummary = true;
    }
    $scope.ListLots($scope.stage_id);

    $scope.$watch('currentlot', function(newValue, oldValue) {
      $scope.GetCurrentLot();
    });


  };
});
