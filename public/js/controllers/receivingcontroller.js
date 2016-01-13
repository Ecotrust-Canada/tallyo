'use strict';


angular.module('scanthisApp.receivingController', [])


.controller('QRScanCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.form = {};

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
      toastr.success("added");     
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
      toastr.error("select Collection");
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




.controller('ReceivingPrintCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.form = {};
  $scope.formchange = true;

  $scope.entry.shipping_unit = {};
  $scope.entry.harvester = {};

  var fieldarray = fjs.pluck('fieldname', $scope.collectionform.fields);
  var shippingfields = fieldarray.slice(0, fieldarray.indexOf("split"));
  var harvesterfields = fieldarray.slice(fieldarray.indexOf("split")+1, fieldarray.length + 1);

  $scope.SubmitForm = function(form){  
    //console.log(shippingfields, harvesterfields);

    for (var i=0;i<shippingfields.length;i++){
      if ($scope.form[shippingfields[i]]){
        $scope.entry.shipping_unit[shippingfields[i]] = $scope.form[shippingfields[i]];
      }
    }
    for (var j=0;j<harvesterfields.length;j++){
      if ($scope.form[harvesterfields[j]]){
        $scope.entry.harvester[harvesterfields[j]] = $scope.form[harvesterfields[j]];
      }
    }

    var date = moment(new Date()).format();
    $scope.entry.shipping_unit.timestamp = date;
    $scope.entry.shipping_unit.station_code = $scope.station_code;
    $scope.entry.harvester.fair_trade = false;

    //console.log($scope.entry.shipping_unit, $scope.entry.harvester);

    $scope.MakeShippingEntry();
  };

  $scope.MakeShippingEntry = function(){
    var func = function(response){
      $scope.current.shipping_unit = (response.data[0] || response.data);
      $scope.MakeHarvesterEntry();
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryCreateCode('shipping_unit', $scope.entry.shipping_unit, $scope.processor, func);
    }
    else{ toastr.error("empty shipping info form"); } 
  };

  $scope.MakeHarvesterEntry = function(){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      $scope.current.harvester = (response.data[0] || response.data);
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryCreateCode('harvester', $scope.entry.harvester, $scope.processor, func);
    }
    else{ toastr.error("empty harvester info form"); } 
  };

})

.controller('NewBoxCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.form = {};
  $scope.entry.box = {};

  $scope.$watch('current.harvester.harvester_code', function(newValue, oldValue) {
    if ($scope.current.harvester !== undefined){
      $scope.form.harvester_code = $scope.current.harvester.harvester_code;
      $scope.form.shipping_unit_number = $scope.current.shipping_unit.shipping_unit_number;

      $scope.entry.box.harvester_code = $scope.current.harvester.harvester_code;
      $scope.entry.box.shipping_unit_number = $scope.current.shipping_unit.shipping_unit_number;
    }
  });

  $scope.SubmitForm = function(form){
    for (var i=1;i<form.num_boxes;i++){
      $scope.MakeBox();
    }
  };
  
  $scope.MakeBox = function(){
    var func = function(response){
      var data = dataCombine(response.data[0], $scope.onLabel.qr);
      var labels = ArrayFromJson(response.data[0], $scope.onLabel.print);
      console.log(data, labels);
      $scope.printLabel(data, labels);
    };
    if (NoMissingValues($scope.form)){
      DatabaseServices.DatabaseEntryCreateCode('box', $scope.entry.box, $scope.processor, func);
    }
    else{ toastr.error("missing values"); } 
  };
})


;
