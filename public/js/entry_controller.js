'use strict';

var EntryCtrl = function($scope, $http, $location, $anchorScroll, $injector) {
    $injector.invoke(BaseCtrl, this, {$scope: $scope});


  /*gets a list from a table*/
  $scope.ListLots = function(stage_id){
    var query = '?stage_id=eq.' + stage_id;
    $scope.GetEntries('lot','lots', query);
  };

  $scope.ListItems = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    $scope.GetEntries('item', 'items', query);
  };

  $scope.ListSuppliers = function(){
    $scope.GetEntries('supplier', 'suppliers');
  };



  $scope.PutItemInBox = function(item_id){
    var func = function(response){
      $scope.latest_lot_number = response.data[0].lot_number;/*for now just set box lot_number to most recent loin*/
      $scope.PatchItemWithBox(item_id);
    };
    var query = '?id=eq.' + item_id;
    $scope.GetEntry('item', func, query);
  };



  $scope.PatchItemWithBox = function(item_id){
    var func = function(response){
      $scope.item_id = null;
      $scope.includeditems.push(response.data[0]);
    };
    var patch = {'box_id': $scope.box.id};
    var query = '?id=eq.' + item_id;
    $scope.PatchEntry('item', patch, query, func);
  };

  $scope.PatchItemRemoveBox = function(item_id){
    var func = function(response){
      $scope.includeditems = removeFromArray($scope.includeditems, item_id);
    };
    var patch = {'box_id': null};
    var query = '?id=eq.' + item_id;
    $scope.PatchEntry('item', patch, query, func);
  };

  $scope.PatchBoxWithWeightLot = function(box_weight, lot_num){
    var func = function(response){
      $scope.box = response.data[0];
    };
    var patch = {'weight': box_weight, 'lot_number': lot_num};
    var query = '?id=eq.' + $scope.box.id;
    $scope.PatchEntry('box', patch, query, func);
  };

  $scope.PatchStageWithSupplier = function(supplier_id){
    var func = function(response){
      $scope.GetCurrentSupplier();
    };
    var patch = {"current_supplier_id": supplier_id};
    var query = '?id=eq.' + $scope.stage_id;
    $scope.PatchEntry('stage', patch, query, func);
  };

  
  $scope.RemoveItem = function(item_id){
    var query = '?id=eq.' + item_id;
    var func = function(){
      $scope.ListItems($scope.currentlot, $scope.station_id);
    };
    $scope.RemoveEntry('item', query, func);
  };






  /*fill in entry fields*/
  $scope.MakeItemEntry = function(form){
    $scope.item_entry.lot_number = $scope.currentlot;
    $scope.item_entry.timestamp = moment(new Date()).format();
    $scope.MakeEntry(form, 'item_entry');
  };

  $scope.MakeLotEntry = function(date, lot_number){
    $scope.lot_entry.lot_number = lot_number;        
    CreateEntryPeriod(date, 'week', $scope);
  };

  $scope.MakeBoxEntry = function(form){
    $scope.box_entry.packing_date = moment(new Date()).format();
    $scope.box_entry.best_before_date = moment(new Date()).add(2, 'years').format();
    $scope.MakeEntry(form, 'box_entry');
  };

  $scope.MakeSupplierEntry = function(form){
    $scope.MakeEntry(form, 'supplier_entry');
  };








  /*create entry in database*/
  $scope.DatabaseLot = function(lot_number){
    var func = function(){
      $scope.currentlot = lot_number;
    };
    $scope.DatabaseEntry('lot', $scope.lot_entry, func);
  };

  $scope.DatabaseItem = function(){
    var func = function(){
      $scope.Clear('item_entry');
      $scope.ListItems($scope.currentlot, $scope.station_id);
    };
    if (NoMissingValues($scope.item_entry)){
      $scope.DatabaseEntry('item', $scope.item_entry, func);
    }
    else{ alert("missing values"); }
  };

  $scope.DatabaseSupplier = function(){
    var func = function(){
      $scope.Clear('supplier_entry');
      $scope.ListSuppliers();
    };
    $scope.DatabaseEntry('supplier', $scope.supplier_entry, func);
  };


  $scope.DatabaseBox = function(){
    $http.post('http://10.10.50.30:3000/box', $scope.box_entry, {headers: {'Prefer': 'return=representation'}}
       ).then(function(response){
      $scope.box = response.data;
      $scope.includeditems = [];
      $scope.form = null;
    }, function(response){
    });
  };


  $scope.BoxEntry = function(form){
    $scope.MakeBoxEntry(form);
    $scope.DatabaseBox();
  };

  $scope.SupplierEntry = function(form){
    $scope.MakeSupplierEntry(form);
    $scope.DatabaseSupplier();
  };










};//end of controller
