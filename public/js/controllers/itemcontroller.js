'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ScanOnlyCtrl', function($scope, $http, DatabaseServices) {

  /*creates a new row in the database, item table*/
  $scope.DatabaseScan = function(form){
    $scope.MakeScanEntry(form);
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
      Clear('scan', $scope);
    };
    if (NoMissingValues($scope.entry.scan)){
      DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
    }
    else{ alert("missing values"); }
  };


  /*fills in fields in json to submit to database*/
  $scope.MakeScanEntry = function(form){
    $scope.entry.scan.station_code = $scope.station_code;
    $scope.entry.scan.lot_number = $scope.current.collectionid;
    $scope.entry.scan.timestamp = moment(new Date()).format();
    MakeEntry(form, 'scan', $scope);
  };

  $scope.Submit = function(form){
    $scope.DatabaseScan(form);
  };

  $scope.Clear = function(){
    Clear('scan', $scope);
  };

})

.controller('RemoveScanCtrl', function($scope, $http, DatabaseServices) {
  $scope.RemoveItem = function(scan_id){
    var query = '?serial_id=eq.' + scan_id;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };
})





.controller('LoinCtrl', function($scope, $http, DatabaseServices) {

  $scope.entry.scan = {'station_code':'', 'timestamp':'', 'loin_number':'', 'lot_number':''};

  /*creates a new row in the database, item table*/
  $scope.DatabaseLoin = function(){    
    var func = function(response){
      $scope.entry.scan.loin_number = response.data.loin_number;
      Clear('loin', $scope);
      $scope.DatabaseScan();     
    };
    if (NoMissingValues($scope.entry.scan, 'loin_number')){
      DatabaseServices.DatabaseEntryReturn('loin', $scope.entry.loin, func);
    }
    else{ alert("missing values"); }
  };


  $scope.DatabaseScan = function(){    
    var func = function(response){
    $scope.current.itemchange = !$scope.current.itemchange;
    $scope.printDiv($scope.entry.scan.loin_number);
    Clear('scan', $scope);
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  $scope.Submit = function(form){
    $scope.MakeLoinScanEntry(form);
    $scope.DatabaseLoin();
  };
  
  /*fills in fields in json to submit to database*/
  $scope.MakeLoinScanEntry = function(form){
    var date = moment(new Date()).format();
    $scope.entry.loin.loin_number = createLoinNum(date);
    $scope.entry.loin.lot_number = $scope.current.collectionid;
    $scope.entry.scan.lot_number = $scope.current.collectionid;
    $scope.entry.loin.timestamp = date;
    $scope.entry.scan.timestamp = date;
    $scope.entry.scan.station_code = $scope.station_code;
    $scope.entry.loin.station_code = $scope.station_code;
    MakeEntry(form, 'scan', $scope);
    MakeEntry(form, 'loin', $scope);
  };

  $scope.Clear = function(){
    Clear('scan', $scope);
  };

})


.controller('RemoveLoinCtrl', function($scope, $http, DatabaseServices) {
  $scope.RemoveItem = function(id){
    var query = '?loin_number=eq.' + id;
    var func = function(){
      $scope.RemoveScan(id);
    };
    DatabaseServices.RemoveEntry('loin', query, func);
  };

  $scope.RemoveScan = function(id){
    var query = '?loin_number=eq.' + id;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };
})



.controller('BoxCtrl', function($scope, $http, DatabaseServices) {
  $scope.form = {};

  $scope.MakeBoxScanEntry = function(form){
    var date = new Date();
    $scope.entry.box.timestamp = moment(date).format();
    $scope.entry.box.station_code = $scope.station_code;
    $scope.entry.box.shipping_unit_number = $scope.current.collectionid;
    $scope.entry.box.received_from = $scope.current.shipping_unit.received_from;
    if ($scope.form.box_number === undefined){
      $scope.entry.box.box_number = createBoxNum(date);
    }
    $scope.entry.scan.timestamp = $scope.entry.box.timestamp;
    $scope.entry.scan.station_code = $scope.station_code;
    MakeEntry(form, 'box', $scope);
  };
  $scope.DatabaseBox = function(){    
    var func = function(response){
      $scope.entry.scan.box_number = response.data.box_number;
      Clear('box', $scope);
      $scope.DatabaseScan();     
    };
    if (NoMissingValues($scope.entry.scan, 'box_number')){
      DatabaseServices.DatabaseEntryReturn('box', $scope.entry.box, func);
    }
    else{ alert("missing values"); }
  };

  $scope.DatabaseScan = function(){    
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
      Clear('scan', $scope);
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  $scope.MakeBox = function(){
    var func = function(response){
      if (response.data.length >0){
        Clear('scan', $scope);
        alert("already exists");
      }
      else{
        $scope.MakeBoxScanEntry($scope.form);
        $scope.DatabaseBox();
      }
    };
    var query = '?box_number=eq.' + $scope.form.box_number + '&station_code=eq.' + $scope.station_code;
    DatabaseServices.GetEntries('box', func, query);
  };

  $scope.init = function(){
    $scope.entry.box = {'timestamp': '', 'lot_number': ''};
    $scope.entry.scan = {'station_code': '', 'timestamp': '', 'box_number':''};
  };


})

.controller('RemoveBoxCtrl', function($scope, $http, DatabaseServices) {
  $scope.RemoveItem = function(id){
    var query = '?box_number=eq.' + id;
    var func = function(){
      $scope.RemoveScan(id);
    };
    DatabaseServices.RemoveEntry('box', query, func);
  };

  $scope.RemoveScan = function(id){
    var query = '?box_number=eq.' + id + '&station_code=eq.' + $scope.station_code;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };
})


;

