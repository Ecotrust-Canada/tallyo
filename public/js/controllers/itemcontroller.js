'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ScanCtrl', function($scope, $http, $interval, DatabaseServices, toastr) {
  var scalePromise;

  $scope.entry.scan = {};
  $scope.entry.loin = {};
  $scope.entry.box = {};
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

  $scope.startPolling = function(fieldName) {
    $scope.stopPolling();
    if (fieldName==='stop') {
      $scope.scalePromise = null;
      return;
    }
    scalePromise = $interval(function() {
      $http({
        method: 'GET',
        url: $scope.scaleURL + 'weight',
      }).then(
        function successCallback(response) {
          console.log(response.data.value);
          $scope.form[fieldName] = response.data.value;
        },
        function errorCallback(response) {
          console.log(response);
        }
      );
    }, 500);
  }
  $scope.stopPolling = function() {
    $interval.cancel(scalePromise);
  }


  if ($scope.scanform.startpolling) {
    $scope.startPolling($scope.scanform.startpolling);
  };
  

  /*fills in fields in json to submit to database*/
  $scope.MakeScanEntry = function(form){
    var date = moment(new Date()).format();
    AddtoEntryNonFormData($scope, date, 'scan');
    AddtoEntryFormData(form, 'scan', $scope);
  };

  $scope.DatabaseItem = function(){ 
    var table = $scope.station_info.itemtable.split('_')[0];
    var itemid = $scope.station_info.itemid;  
    var func = function(response){      
      //print a label if onLabel specified in config
      if($scope.onLabel){
        var data = dataCombine((response.data[0] || response.data), $scope.onLabel.qr);
        var labels = ArrayFromJson((response.data[0] || response.data), $scope.onLabel.print);
        console.log(data, labels);
        $scope.printLabel(data, labels);
      }
      $scope.entry.scan[itemid] = (response.data[0][itemid] || response.data[itemid]);
      $scope.DatabaseScan();     
    };
    if (NoMissingValues($scope.entry.scan, itemid)){
      DatabaseServices.DatabaseEntryCreateCode(table, $scope.entry[table], $scope.processor, func);
    }
    else{ toastr.error("missing values"); }
  };

  $scope.MakeItemScanEntry = function(form){
    var table = $scope.station_info.itemtable.split('_')[0];
    var date = moment(new Date()).format();
    AddtoEntryNonFormData($scope, date, table);
    AddtoEntryNonFormData($scope, date, 'scan');
    AddtoEntryFormData(form, table, $scope);
  };

  $scope.Submit = function(form){
    if($scope.station_info.itemtable === 'scan'){
      $scope.MakeScanEntry(form);
      $scope.DatabaseScan(form);
    }
    else{
      $scope.MakeItemScanEntry(form);
      $scope.DatabaseItem();
    }

  };

  $scope.ListProducts = function(){
    var query = '';
    var func = function(response){
      $scope.list.product = response.data;
    };
    DatabaseServices.GetEntries('product', func, query);
  };
  $scope.ListProducts();
})

.controller('RemoveScanCtrl', function($scope, $http, toastr, DatabaseServices) {

  $scope.RemoveItem = function(id){
    if($scope.station_info.itemtable === 'scan'){
      $scope.RemoveScanOnly(id);
    }
    else{
      $scope.RemoveItemScan(id);
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

  $scope.RemoveItemScan = function(id){
    var table = $scope.station_info.itemtable.split('_')[0];
    var itemid = $scope.station_info.itemid;
    var query = '?' + itemid + '=eq.' + id;
    var func = function(){
      $scope.RemoveScan(id, itemid);
    };
    DatabaseServices.RemoveEntry(table, query, func);
  };

  $scope.RemoveScan = function(id, itemid){
    var query = '?' + itemid + '=eq.' + id;
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

