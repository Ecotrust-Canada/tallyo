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

})








.controller('CurrentCtrl', function($scope, $http, DatabaseServices) {
  /*displays items in the summary table*/
  $scope.ListItems = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    var func = function(response){
      $scope.list.scan = response.data;
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

  $scope.$watch('list.scan.length', function(newValue, oldValue) {
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
  $scope.ListItems = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    var func = function(response){
      $scope.list.scan = response.data;
    };
    DatabaseServices.GetEntries('loin_scan', func, query);
  };

  $scope.$watch('entry.scan.loin_id', function(newValue, oldValue) {
    $scope.ListItems($scope.current.lot, $scope.station_id);
  });

  $scope.ItemTotals = function(lot_number, station_id){
    var query = '?lot_number=eq.' + lot_number + '&station_id=eq.' + station_id;
    var func = function(response){
      $scope.list.totals = response.data;
    };
    DatabaseServices.GetEntries('scan_total', func, query);
  };

  $scope.$watch('list.scan.length', function(newValue, oldValue) {
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



.controller('StartNewLotCtrl', function($scope, $http, DatabaseServices) {

  $scope.StartNewLot = function(){
    $scope.current.supplier_id = null;
    $scope.entry.lot = {};
    var date = new Date();
    $scope.entry.lot.lot_number = createLotNum($scope.station_id, date);
    $scope.entry.lot.timestamp = moment(new Date()).format();
    $scope.entry.lot.station_id = $scope.station_id;

    var func = function(response){
      $scope.current.lot_number = response.data.lot_number;
      $scope.current.lot = response.data;
    };
    DatabaseServices.DatabaseEntryReturn('lot', $scope.entry.lot, func);



  };

  $scope.ScanBox = function(box_id){
    var func = function(response){
      if (response.data.length > 0){
        console.log('scanned already');
      }
      else{
        $scope.BoxToLot(box_id);
      }
    };
    var query = '?station_id=eq.' + $scope.station_id + '&box_id=eq.' + box_id;
    DatabaseServices.GetEntry('scan', func, query);
  };



  $scope.BoxToLot = function(box_id){
    var func = function(response){

      var sup = response.data[0].supplier_id;
      if (!$scope.current.supplier_id){
        $scope.current.supplier_id = sup;
        $scope.MakeScan(box_id);
      }
      else if (sup === $scope.current.supplier_id){
        $scope.MakeScan(box_id);
      }
      else {
        alert('new supplier, please create new lot');
      }
    };
    var query = '?id=eq.' + box_id;
    DatabaseServices.GetEntry('box', func, query);
  };

  $scope.MakeScan = function(box_id){
    $scope.entry.scan = {};
    $scope.entry.scan.timestamp = moment(new Date()).format();
    $scope.entry.scan.station_id = $scope.station_id;
    $scope.entry.scan.box_id = box_id;
    $scope.entry.scan.lot_number = $scope.current.lot_number;
    $scope.DatabaseScan();
  };

  $scope.ListItems = function(){
    var query = '?station_id=eq.' + $scope.station_id;
    var func = function(response){
      $scope.list.box_total = response.data;
    };
    DatabaseServices.GetEntries('box_total', func, query);
  };
  $scope.ListItems();

  $scope.DatabaseScan = function(){    
    var func = function(response){
    Clear('scan', $scope);
    $scope.ListItems();  
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };





});
