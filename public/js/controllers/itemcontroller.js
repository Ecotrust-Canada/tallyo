'use strict';


angular.module('scanthisApp.itemController', [])



.controller('CurrentCtrl', function($scope, $http, DatabaseServices) {
  /*displays items in the summary table*/
  $scope.ListItems = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    var func = function(response){
      $scope.list.items = response.data;
    };
    DatabaseServices.GetEntries('scan', func, query);
  };

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

})


.controller('ScanOnlyCtrl', function($scope, $http, DatabaseServices) {

  /*removes an item from the database*/
  $scope.RemoveItem = function(item_id){
    var query = '?id=eq.' + item_id;
    var func = function(){
      removeFromArray($scope.list.items, item_id);
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

  /*creates a new row in the database, item table*/
  $scope.DatabaseItem = function(form){
    $scope.MakeItemEntry(form);
    var func = function(response){
      $scope.list.items.push(response.data);
      Clear('item', $scope);    
    };
    if (NoMissingValues($scope.entry.item)){
      DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.item, func);
    }
    else{ alert("missing values"); }
  };


  /*fills in fields in json to submit to database*/
  $scope.MakeItemEntry = function(form){
    $scope.entry.item.lot_number = $scope.current.lot;
    $scope.entry.item.timestamp = moment(new Date()).format();
    MakeEntry(form, 'item', $scope);
  };

  $scope.Submit = function(form){
    $scope.DatabaseItem(form);
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
    $scope.entry.item = {'timestamp': '', 'lot_number': '', 'station_id': $scope.station_id};
    $scope.fields = fields;
    $scope.options = options;

    for (var key in fields){
      $scope.entry.item[key] = '';
    }
    if (options.summaryhidden === 'true'){
      InitShowSummary($scope);
    }
    else{
      $scope.showScan = true;
      $scope.showSummary = true;
    }


  };
})

.controller('LoinCtrl', function($scope, $http, DatabaseServices) {

  $scope.GetMaxLoin = function(form){
    var query = '?lot_number=eq.' + $scope.current.lot;
    var func = function(response){
      var num = 1;
      if (response.data.length >0){
        num = response.data[0].max_loin + 1;
      }
      $scope.DatabaseItem(form, num);
    };
    DatabaseServices.GetEntries('loin_number', func, query);
  };


  /*removes an item from the database*/
  $scope.RemoveItem = function(item_id){
    var query = '?id=eq.' + item_id;
    var func = function(){
      removeFromArray($scope.list.items, item_id);
    };
    DatabaseServices.RemoveEntry('loin', query, func);
  };

  /*creates a new row in the database, item table*/
  $scope.DatabaseItem = function(form, num){
    $scope.MakeItemEntry(form, num);
    var func = function(response){
      $scope.list.items.push(response.data);
      Clear('item', $scope);     
    };
    if (NoMissingValues($scope.entry.item)){
      DatabaseServices.DatabaseEntryReturn('loin', $scope.entry.item, func);
    }
    else{ alert("missing values"); }
  };

  $scope.Submit = function(form){
    $scope.GetMaxLoin(form);
  };

  


  /*fills in fields in json to submit to database*/
  $scope.MakeItemEntry = function(form, num){
    $scope.entry.item.loin_number = num;
    $scope.entry.item.lot_number = $scope.current.lot;
    $scope.entry.item.timestamp = moment(new Date()).format();
    MakeEntry(form, 'item', $scope);
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
    $scope.entry.item = {'timestamp': '', 'lot_number': ''};
    $scope.fields = fields;
    $scope.options = options;

    for (var key in fields){
      $scope.entry.item[key] = '';
    }
    if (options.summaryhidden === 'true'){
      InitShowSummary($scope);
    }
    else{
      $scope.showScan = true;
      $scope.showSummary = true;
    }


  };


})


.controller('ScanCtrl', function($scope, $http, DatabaseServices) {


});
