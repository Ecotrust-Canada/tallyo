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

})

.controller('RemoveScanCtrl', function($scope, $http, DatabaseServices) {
  $scope.RemoveItem = function(scan_id){
    var query = '?id=eq.' + scan_id;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };
})





.controller('LoinCtrl', function($scope, $http, DatabaseServices) {

  $scope.entry.scan = {'station_code':'', 'timestamp':'', 'loin_id':'', 'lot_number':''};

  $scope.GetMaxLoin = function(form){
    var query = '?lot_number=eq.' + $scope.current.collectionid;
    var func = function(response){
      var num = 1;
      if (response.data.length >0){
        num = response.data[0].max_loin + 1;
      }
      $scope.MakeLoinScanEntry(form, num);
      $scope.DatabaseLoin();
    };
    DatabaseServices.GetEntries('loin_number', func, query);
  };

  /*creates a new row in the database, item table*/
  $scope.DatabaseLoin = function(){    
    var func = function(response){
      $scope.entry.scan.loin_id = response.data.id;
      Clear('loin', $scope);
      $scope.DatabaseScan();     
    };
    if (NoMissingValues($scope.entry.scan, 'loin_id')){
      DatabaseServices.DatabaseEntryReturn('loin', $scope.entry.loin, func);
    }
    else{ alert("missing values"); }
  };


  $scope.DatabaseScan = function(){    
    var func = function(response){
    //$scope.QRWindowOpen($scope.entry.scan.loin_id);
    $scope.current.itemchange = !$scope.current.itemchange;
    Clear('scan', $scope);    
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  $scope.Submit = function(form){
   $scope.GetMaxLoin(form);
  };
  
  /*fills in fields in json to submit to database*/
  $scope.MakeLoinScanEntry = function(form, num){
    $scope.entry.loin.loin_number = num;
    $scope.entry.loin.lot_number = $scope.current.collectionid;
    $scope.entry.scan.lot_number = $scope.current.collectionid;
    $scope.entry.loin.timestamp = moment(new Date()).format();
    $scope.entry.scan.timestamp = $scope.entry.loin.timestamp;
    $scope.entry.scan.station_code = $scope.station_code;
    $scope.entry.loin.station_code = $scope.station_code;
    MakeEntry(form, 'scan', $scope);
    MakeEntry(form, 'loin', $scope);
  };


})

.controller('RemoveLoinCtrl', function($scope, $http, DatabaseServices) {
  $scope.RemoveItem = function(id){
    var query = '?id=eq.' + id;
    var func = function(){
      $scope.RemoveScan(id);
    };
    DatabaseServices.RemoveEntry('loin', query, func);
  };

  $scope.RemoveScan = function(id){
    var query = '?loin_id=eq.' + id;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };
})



.controller('BoxCtrl', function($scope, $http, DatabaseServices) {

  $scope.MakeBoxScanEntry = function(form){
    $scope.entry.box.timestamp = moment(new Date()).format();
    $scope.entry.box.station_code = $scope.station_code;
    $scope.entry.box.shipping_unit_id = $scope.current.collectionid;
    $scope.entry.scan.timestamp = $scope.entry.box.timestamp;
    $scope.entry.scan.station_code = $scope.station_code;
    MakeEntry(form, 'box', $scope);
  };
  $scope.DatabaseBox = function(){    
    var func = function(response){
      $scope.entry.scan.box_id = response.data.id;
      Clear('box', $scope);
      $scope.DatabaseScan();     
    };
    if (NoMissingValues($scope.entry.scan, 'box_id')){
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
    $scope.MakeBoxScanEntry($scope.form);
    $scope.DatabaseBox();
  };

  $scope.init = function(){
    $scope.entry.box = {'timestamp': '', 'lot_number': ''};
    $scope.entry.scan = {'station_code': '', 'timestamp': '', 'box_id':''};
  };


})

.controller('RemoveBoxCtrl', function($scope, $http, DatabaseServices) {
  $scope.RemoveItem = function(id){
    var query = '?id=eq.' + id;
    var func = function(){
      $scope.RemoveScan(id);
    };
    DatabaseServices.RemoveEntry('box', query, func);
  };

  $scope.RemoveScan = function(id){
    var query = '?box_id=eq.' + id;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };
})


;

