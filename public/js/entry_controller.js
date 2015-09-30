'use strict';

var EntryCtrl = function($scope, $http, $location, $anchorScroll, $injector) {
    $injector.invoke(BaseCtrl, this, {$scope: $scope});


  /*gets a list from a table*/
  $scope.ListLots = function(stage_id){
    var query = '?stage_id=eq.' + stage_id;
    $scope.GetEntries('supplier_lot','lots', query);
  };

  $scope.ListItems = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    $scope.GetEntries('item', 'items', query);
  };

  

  $scope.ListAllItems = function(station_id){
    var query = '?station_id=eq.' + station_id;
    $scope.GetEntries('item', 'items', query);
  };

  $scope.ListSuppliers = function(){
    $scope.GetEntries('supplier', 'suppliers');
  };

  $scope.ListBoxes = function(){
    $scope.GetEntries('recent_boxes', 'boxes');
  };


  $scope.SupplierFromLotNumber = function(lot_number){
    var func = function(response){
      $scope.supplier_lot = response.data[0];
    };
    var query = '?lot_number=eq.' + lot_number;
    $scope.GetEntry('supplier_lot', func, query);
  };

  $scope.BoxFromBoxId = function(box_id){
    var func = function(response){
      $scope.box = response.data[0];
    };
    var query = '?id=eq.' + box_id;
    $scope.GetEntry('box', func, query);
  };

  $scope.ListBoxItems = function(box_id){
    var func = function(response){
      $scope.includeditems = [];
      for (var i in response.data){
        $scope.includeditems.push(response.data[i]);
      }
    };
    var query = '?box_id=eq.' + box_id;
    $scope.GetEntriesReturn('item', func, query);
  };



  $scope.PutItemInBox = function(item_id){
    var func = function(response){
      if (response.data[0].box_id && response.data[0].box_id != $scope.box.id){
        var overwrite = confirm("overwrite from previous box?");
        if (overwrite === true){
          $scope.PatchItemWithBox(item_id);
        }
        else{
          $scope.item_id = null;
        }
      }
      else if (response.data[0].box_id == $scope.box.id){
        alert("already in box");
      }
      else{
        $scope.PatchItemWithBox(item_id);
      }      
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
    if (item_id && idNotInArray($scope.includeditems, item_id)){
      $scope.PatchEntry('item', patch, query, func);
    }
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

  $scope.PatchLotWithStage = function(lot_number){
    var func = function(response){
      $scope.ListLots($scope.from_stage);
    };
    var patch = {'stage_id': $scope.to_stage };
    var query = '?lot_number=eq.' + lot_number;
    $scope.PatchEntry('lot', patch, query, func);
  };

  $scope.PatchStageWithLot = function(lot_number){
    var func = function(response){
      $scope.currentlot = lot_number;
      $scope.SupplierFromLotNumber($scope.currentlot);
    };
    var patch = {'current_lot_number': lot_number};
    var query = '?id=eq.' + $scope.stage_id;
    $scope.PatchEntry('stage', patch, query, func);
  };

  $scope.PatchBoxWithShipping = function(box_id){
    var func = function(response){
      $scope.box_id = null;        
      $scope.boxes.push(response.data[0]);  
    };
    var patch = {'shipping_container': $scope.shipping.id};
    var query = '?id=eq.' + box_id;
    if (box_id && valueNotInArray($scope.boxes, box_id)){
      $scope.PatchEntry('box', patch, query, func);
    }
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

  $scope.MakeShippingEntry = function(form){
    $scope.MakeEntry(form, 'shipping_entry');
  };




  /*create entry in database*/
  $scope.DatabaseLot = function(lot_number){
    var func = function(){
      $scope.currentlot = lot_number;
      $scope.SupplierFromLotNumber($scope.currentlot);
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
    var func = function(response){
      $scope.box = response.data;
      $scope.includeditems = [];
      $scope.Clear('box_entry');
      $scope.ListBoxes();
    };
    if (NotEmpty($scope.form)){
      $scope.DatabaseEntryReturn('box', $scope.box_entry, func);
    }
    else{ alert("empty"); }    
  };

  $scope.DatabaseShipping = function(){
    var func = function(response){
      $scope.shipping = response.data;
    };
    $scope.DatabaseEntryReturn('shipping_unit', $scope.shipping_entry, func);
  };

  $scope.BoxEntry = function(form){
    $scope.MakeBoxEntry(form);
    $scope.DatabaseBox();
  };

  $scope.SupplierEntry = function(form){
    $scope.MakeSupplierEntry(form);
    $scope.DatabaseSupplier();
  };

  $scope.ShippingEntry = function(form){
    $scope.MakeShippingEntry(form);
    $scope.DatabaseShipping();
  };


};//end of controller
