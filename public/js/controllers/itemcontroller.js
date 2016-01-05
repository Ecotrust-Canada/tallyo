'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ScanOnlyCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.entry.scan = {};
  $scope.entry.loin = {};
  $scope.form = {};
  $scope.formchange = true;

  $scope.DatabaseScan = function(form){    
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.formchange = !$scope.formchange;
      toastr.success("submit successful");
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

  $scope.DatabaseLoin = function(){   
    var func = function(response){
      if($scope.onLabel){
        var data = dataCombine($scope.entry.loin, $scope.onLabel);
        console.log(data);
        $scope.printLabel(data,[
          $scope.entry.loin.weight_1,
          $scope.entry.loin.grade,
          $scope.current.harvester_lot.internal_lot_code]);
      }
      $scope.entry.scan.loin_number = response.data.loin_number;
      $scope.DatabaseScan();     
    };
    if (NoMissingValues($scope.entry.scan, 'loin_number')){
      DatabaseServices.DatabaseEntryReturn('loin', $scope.entry.loin, func);
    }
    else{ toastr.error("missing values"); }
  };

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

  $scope.Submit = function(form){
    if($scope.station_info.itemtable === 'scan'){
      $scope.MakeScanEntry(form);
      $scope.DatabaseScan(form);
    }
    else if ($scope.station_info.itemtable === 'loin_scan'){
      $scope.MakeLoinScanEntry(form);
      $scope.DatabaseLoin();
    }
  };
})

.controller('RemoveScanCtrl', function($scope, $http, toastr, DatabaseServices) {
  $scope.RemoveItem = function(id){
    if($scope.station_info.itemtable === 'scan'){
      $scope.RemoveScanOnly(id);
    }
    else if ($scope.station_info.itemtable === 'loin_scan'){
      $scope.RemoveLoin(id);
    }    
  };

  $scope.RemoveScanOnly = function(scan_id){
    var query = '?serial_id=eq.' + scan_id;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
      toastr.success('item removed');
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

  $scope.RemoveLoin = function(id){
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




/*.controller('WeighLotCtrl', function($scope, $http, DatabaseServices) {
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

})*/
;

