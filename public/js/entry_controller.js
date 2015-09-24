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






  /*fill in entry fields*/
  $scope.MakeItemEntry = function(form){
    $scope.MakeEntry(form, 'entry');
  };

  $scope.MakeLotEntry = function(date, lot_number){
    $scope.lot_entry.lot_number = lot_number;        
    CreateEntryPeriod(date, 'week', $scope);
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










};//end of controller
