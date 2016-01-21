'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ScanCtrl', function($scope, $http, $interval, DatabaseServices, toastr) {
  var scalePromise;

  $scope.entry.scan = {};
  $scope.entry.loin = {};
  $scope.entry.box = {};
  $scope.form = {};
  $scope.formchange = true;
  if ($scope.scanform.startpolling) {
    $scope.scaleon = true;
  }

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
    //stop polling scale
    $scope.stopPolling();
    // if toggle_state command is sent flip scale state and start polling
    if (fieldName === 'toggle_state') {
      $scope.scaleon = !$scope.scaleon;
      $scope.startPolling($scope.scanform.startpolling);
      return;
    }
    // if no scale url, or stop command is set, or scale is 'off' exit
    if (!$scope.scaleURL || fieldName==='stop' || !$scope.scaleon) {
      return;
    }
    scalePromise = $interval(function() {
      $http({
        method: 'GET',
        url: $scope.scaleURL + 'weight',
      }).then(
        function successCallback(response) {
          $scope.form[fieldName] = response.data.value;
        },
        function errorCallback(response) {
          console.log(response);
        }
      );
    }, 500);
  };

  // stop polling scale and clear scalePromise
  $scope.stopPolling = function() {
    $interval.cancel(scalePromise);
    scalePromise = null;
  };


  if ($scope.scanform.startpolling) {
    $scope.startPolling($scope.scanform.startpolling);
  }
  

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
    if (NoMissingValues($scope.entry[table], itemid)){
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

    //assign trade_unit and weight(kg) from weight and units 
    if ($scope.options.trade_unit){
      $scope.entry.box.trade_unit = $scope.form.trade_unit_w + ' ' + $scope.form.trade_unit;
      if ($scope.form.trade_unit === 'lb'){
        $scope.entry.box.weight = $scope.form.trade_unit_w / 2.2;
      }
      else if ($scope.form.trade_unit === 'kg'){
        $scope.entry.box.weight = $scope.form.trade_unit_w;
      }
      delete $scope.entry.box.trade_unit_w;
    }
    //attach harvester, shipment
    if ($scope.options.lot_info){
      $scope.entry.box.harvester_code = $scope.current.harvester_lot.harvester_code;
      $scope.entry.box.shipping_unit_number = $scope.current.harvester_lot.shipping_unit_number;
      $scope.entry.box.lot = $scope.current.harvester_lot.lot_number;
    }

  };

  $scope.Submit = function(form){
    if($scope.station_info.itemtable === 'scan'){
      $scope.MakeScanEntry(form);
      $scope.DatabaseScan(form);
    }
    else{
      $scope.MakeItemScanEntry(form);
      $scope.DatabaseItem();
      //console.log($scope.entry.box);
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

;

