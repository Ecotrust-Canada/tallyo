'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ItemCtrl', function($scope, $http, $injector, DatabaseServices) {


  $scope.ListLots = function(stage_id){
    var query = '?stage_id=eq.' + stage_id;
    var func = function(response){
      $scope.lots = response.data;
    };
    DatabaseServices.GetEntries('supplier_lot', func, query);
  };

  $scope.ListItems = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    var func = function(response){
      $scope.items = response.data;
    };
    DatabaseServices.GetEntries('item', func, query);
  };

  $scope.SupplierFromLotNumber = function(lot_number){
    var func = function(response){
      $scope.supplier_lot = response.data[0];
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntry('supplier_lot', func, query);
  };

  $scope.PatchStageWithLot = function(lot_number){
    var func = function(response){
      $scope.currentlot = lot_number;
      $scope.SupplierFromLotNumber($scope.currentlot);
    };
    var patch = {'current_lot_number': lot_number};
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.PatchEntry('stage', patch, query, func);
  };

  $scope.RemoveItem = function(item_id){
    var query = '?id=eq.' + item_id;
    var func = function(){
      $scope.ListItems($scope.currentlot, $scope.station_id);
    };
    DatabaseServices.RemoveEntry('item', query, func);
  };

  $scope.DatabaseItem = function(){
    var func = function(){
      Clear('item_entry', $scope);
      $scope.ListItems($scope.currentlot, $scope.station_id);
    };
    if (NoMissingValues($scope.item_entry)){
      DatabaseServices.DatabaseEntry('item', $scope.item_entry, func);
    }
    else{ alert("missing values"); }
  };


  /*fill in entry fields*/
  $scope.MakeItemEntry = function(form){
    $scope.item_entry.lot_number = $scope.currentlot;
    $scope.item_entry.timestamp = moment(new Date()).format();
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






  $scope.init = function(fields, options){
    $scope.item_entry = {'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};
    $scope.fields = fields;
    $scope.options = options;
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
      $scope.ListItems(newValue, $scope.station_id);
    });










  };
});
