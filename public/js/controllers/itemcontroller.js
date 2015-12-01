'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ScanOnlyCtrl', function($scope, $http, DatabaseServices, toastr) {

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
    else{ toastr.error("missing values"); }
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





.controller('LoinCtrl', function($scope, $http, DatabaseServices, toastr) {

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
    else{ toastr.error("missing values"); }
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



.controller('BoxCtrl', function($scope, $http, DatabaseServices, toastr) {
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
    else{ toastr.error("missing values"); }
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
        toastr.warning("already exists");
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

.controller('LotBoxScanCtrl', function($scope, $http, DatabaseServices) {
  
  $scope.MakeScan = function(box_number){
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    var entry = {};
    var date = new Date();
    entry.lot_number = $scope.current.collectionid;
    entry.timestamp = moment(date).format();
    entry.station_code = $scope.station_code;
    entry.box_number = box_number;
    DatabaseServices.DatabaseEntryReturn('scan', entry, func);
  };
  
})


.controller('RemoveBoxScanCtrl', function($scope, $http, DatabaseServices) {
  $scope.RemoveItem = function(id){
    var query = '?box_number=eq.' + id + '&station_code=eq.' + $scope.station_code;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

})


.controller('WeighLotCtrl', function($scope, $http, DatabaseServices) {
  $scope.GetLots = function(){
    var date = moment(new Date());
    var today = date.startOf('day').format();
    var query = '?start_date=eq.' + today + '&station_code=eq.AM2-002';
    var func = function(response){
      $scope.list.todaylots = response.data;
    };
    DatabaseServices.GetEntries('lot', func, query);
  };
  $scope.GetLots();


  $scope.StationLot = function(lot_number, index){
    $scope.current.index = index;
    var today = moment(new Date()).format();
    var patch = {'current_collectionid': lot_number, 'collectionid_date': today};
    var query = '?code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.current.collectionid = response.data[0].current_collectionid;
    };
    DatabaseServices.PatchEntry('station', patch, query, func);
  };

  $scope.$watch('current.collectionid', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined  && $scope.list.todaylots !== undefined){
      var myArray = $scope.list.todaylots;
      var property = $scope.station_info.collectionid;
      var searchTerm = $scope.current.collectionid;

      $scope.current.index = arrayObjectIndexOf(myArray, searchTerm, property);
    }
  });

})
;

