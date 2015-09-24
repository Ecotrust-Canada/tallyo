'use strict';

var EntryCtrl = function($scope, $http, $location, $anchorScroll, $injector) {
    $injector.invoke(BaseCtrl, this, {$scope: $scope});


  /*gets a list from a table*/
  $scope.ListLots = function(stage_id){
    var query = '?stage_id=eq.' + stage_id;
    $scope.GetEntries('lot','listlots', query);
  };

  $scope.ListEntries = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    $scope.GetEntries('item', 'items', query);
  };

  $scope.ListSuppliers = function(){
    $scope.GetEntries('supplier', 'suppliers');
  };



  $scope.GetItem = function(entry_id, callback){
    $http.get('http://10.10.50.30:3000/item?id=eq.' + entry_id).then(function(response){
      $scope.box_weight += response.data[0].weight_1;
      $scope.latest_lot_number = response.data[0].lot_number;/*for now just set box lot_number to most recent loin*/
      callback(null, null);
    }, function(response){
    });
  };



  $scope.PatchItemWithBox = function(entry_id, callback){
    $http.patch('http://10.10.50.30:3000/item?id=eq.' + entry_id, {'box_id': $scope.box.id}, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      $scope.entry_id = null;
      $scope.includedentries.push(response.data[0]);
    }, function(response){          
    });
  };

  $scope.PatchItemRemoveBox = function(entry_id){
    $http.patch('http://10.10.50.30:3000/entry?id=eq.' + entry_id, {'box_id': null}, {headers: {'Prefer': 'return=representation'}}).then(function(response){
      $scope.includedentries = removeFromArray($scope.includedentries, entry_id);
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






  /*fill in entry fields*/
  $scope.MakeItemEntry = function(form){
    $scope.entry.lot_number = $scope.currentlot;
    $scope.entry.timestamp = moment(new Date()).format();
    $scope.MakeEntry(form, 'entry');
  };

  $scope.MakeLotEntry = function(date, lot_number){
    $scope.lot_entry.lot_number = lot_number;        
    CreateEntryPeriod(date, 'week', $scope);
  };

  $scope.MakeBoxEntry = function(form){
    $scope.boxentry.packing_date = moment(new Date()).format();
    $scope.boxentry.best_before_date = moment(new Date()).add(2, 'years').format();
    $scope.MakeEntry(form, 'boxentry');
  };








  /*create entry in database*/
  $scope.DatabaseLot = function(){
    $scope.DatabaseEntry('lot', $scope.lot_entry);
  };

  $scope.DatabaseItem = function(){
    if (NoMissingValues($scope.entry)){
      $http.post('http://10.10.50.30:3000/item', $scope.entry).then(function(response){
        $scope.Clear();
        $scope.ListEntries($scope.currentlot, $scope.station_id);
      }, function(response){
        alert(response.status);
      });
    }
    else{
      alert("missing values");
    }
  };

  $scope.DatabaseBox = function(){
    $http.post('http://10.10.50.30:3000/box', $scope.boxentry, {headers: {'Prefer': 'return=representation'}}
       ).then(function(response){
      $scope.box = response.data;
      $scope.box_weight = 0;
      $scope.includedentries = [];
      $scope.form = null;
    }, function(response){
    });
  };










};//end of controller
