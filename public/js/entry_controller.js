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



  $scope.GetItem = function(item_id, callback){
    $http.get('http://10.10.50.30:3000/item?id=eq.' + item_id).then(function(response){
      $scope.box_weight += response.data[0].weight_1;
      $scope.latest_lot_number = response.data[0].lot_number;/*for now just set box lot_number to most recent loin*/
      callback(null, null);
    }, function(response){
    });
  };



  $scope.PatchItemWithBox = function(item_id, callback){
    $http.patch('http://10.10.50.30:3000/item?id=eq.' + item_id, {'box_id': $scope.box.id}, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      $scope.item_id = null;
      $scope.includeditems.push(response.data[0]);
    }, function(response){          
    });
  };

  $scope.PatchItemRemoveBox = function(item_id){
    $http.patch('http://10.10.50.30:3000/entry?id=eq.' + item_id, {'box_id': null}, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      $scope.includeditems = removeFromArray($scope.includeditems, item_id);
    }, function(response){          
    });
  };

  $scope.PatchBox = function(){
    $http.patch('http://10.10.50.30:3000/box?id=eq.' + $scope.box.id, {'weight': $scope.box_weight, 'lot_number': $scope.latest_lot_number}, {headers: {
       'Prefer': 'return=representation'}
    }).then(function(response){
      $scope.box = response.data[0];
    }, function(response){
        
    });
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








  /*create entry in database*/
  $scope.DatabaseLot = function(){
    $scope.DatabaseEntry('lot', $scope.lot_entry);
  };

  $scope.DatabaseItem = function(){
    if (NoMissingValues($scope.item_entry)){
      $http.post('http://10.10.50.30:3000/item', $scope.item_entry).then(function(response){
        $scope.Clear();
        $scope.ListItems($scope.currentlot, $scope.station_id);
      }, function(response){
        alert(response.status);
      });
    }
    else{
      alert("missing values");
    }
  };

  $scope.DatabaseBox = function(){
    $http.post('http://10.10.50.30:3000/box', $scope.box_entry, {headers: {'Prefer': 'return=representation'}}
       ).then(function(response){
      $scope.box = response.data;
      $scope.box_weight = 0;
      $scope.includeditems = [];
      $scope.form = null;
    }, function(response){
    });
  };










};//end of controller
