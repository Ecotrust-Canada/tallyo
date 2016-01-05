'use strict';


angular.module('scanthisApp.receivingController', [])


.controller('QRScanCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.form = {};

  $scope.valuesarray = ['box_number', 'size', 'grade', 'pieces', 'weight', 'case_number', 'lot_number', 'harvester_code'];

  //{collectiontable: "shipping_unit", collectionid: "shipping_unit_number", itemtable: "box", patchtable: "box", itemid:"box_number"}

  $scope.readQR = function(){
    var rawArray = $scope.raw.string.split("/");
    for (var i=0;i<$scope.valuesarray.length;i++){
      $scope.form[$scope.valuesarray[i]] = rawArray[i];
    }
    $scope.MakeItemFromQR();
  };



  $scope.MakeItemScanEntry = function(form){
    var date = moment(new Date()).format();
    $scope.entry.scan = {};
    $scope.entry[$scope.station_info.itemtable] = {};

    $scope.entry[$scope.station_info.itemtable].timestamp = date;
    $scope.entry[$scope.station_info.itemtable].station_code = $scope.station_code;
    $scope.entry[$scope.station_info.itemtable][$scope.station_info.collectionid] = $scope.current.collectionid;
    
    $scope.entry.scan.timestamp = date;
    $scope.entry.scan.station_code = $scope.station_code;
    MakeEntry(form, $scope.station_info.itemtable, $scope);
  };
  $scope.DatabaseItem = function(){    
    var func = function(response){
      $scope.entry.scan[$scope.station_info.itemid] = response.data[$scope.station_info.itemid];
      $scope.DatabaseScan();
      $scope.raw.string = null;
      toastr.success("box added");     
    };
    if (NoMissingValues($scope.entry.scan, $scope.station_info.itemid)){
      DatabaseServices.DatabaseEntryReturn($scope.station_info.itemtable, $scope.entry[$scope.station_info.itemtable], func);
    }
    else{ toastr.error("missing values"); }
  };

  $scope.DatabaseScan = function(){    
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  $scope.MakeItemFromQR = function(){
    if ($scope.current.collectionid){
      var func = function(response){
        if (response.data.length >0){
          $scope.raw.string = null;
          toastr.warning("already exists");
        }
        else{
          $scope.MakeItemScanEntry($scope.form);
          $scope.DatabaseItem();
        }
      };
      var query = '?' + $scope.station_info.itemid + '=eq.' + $scope.form[$scope.station_info.itemid] + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntries($scope.station_info.itemtable, func, query);
    }
    else{
      $scope.raw.string = null; 
      toastr.error("select a Shipment");
    }
  };

})

.controller('RemoveItemCtrl', function($scope, $http, DatabaseServices) {
  $scope.RemoveItem = function(id){
    var query = '?' + $scope.station_info.itemid + '=eq.' + id;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry($scope.station_info.itemtable, query, func);
  };

})


;
