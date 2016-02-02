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

    $scope.entry[$scope.station_info.itemtable].station_code = $scope.station_code;
    $scope.entry[$scope.station_info.itemtable][$scope.station_info.collectionid] = $scope.current.collectionid;
    
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




.controller('SetShipmentCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.formchange = true;
  $scope.addinfo = true;
  $scope.entry.shipping_unit = {};
  $scope.selected = "no selected";

  $scope.SubmitForm = function(form){  
    if (form){
      MakeEntry(form, 'shipping_unit', $scope);
      $scope.entry.shipping_unit.station_code = $scope.station_code;
      $scope.MakeShippingEntry();
      $scope.formchange = !$scope.formchange;
      $scope.addinfo = false;
    }
  };

  $scope.MakeShippingEntry = function(){
    var func = function(response){
      $scope.current.shipping_unit = (response.data[0] || response.data);
      $scope.list.shipping_unit.push($scope.current.shipping_unit);
    };
    DatabaseServices.DatabaseEntryCreateCode('shipping_unit', $scope.entry.shipping_unit, $scope.processor, func);
  };

  $scope.ListShipments = function(){
    var func = function(response){
      $scope.list.shipping_unit = response.data;
    };
    var query = '?station_code=eq.' + $scope.station_code;
    DatabaseServices.GetEntries('shipping_unit', func, query);
  };
  $scope.ListShipments();

  $scope.SetCurrent = function(selected){
     var filtered = $scope.list.shipping_unit.filter(
      function(value){
        return value.shipping_unit_number === selected;
      });
     $scope.current.shipping_unit = filtered[0];
    $scope.addinfo = false;
  };

})

.controller('SetOriginCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.formchange = true;
  $scope.addinfo = true;
  $scope.entry.harvester = {};
  $scope.selected = "no selected";

  $scope.SubmitForm = function(form){  
    if (form){
      MakeEntry(form, 'harvester', $scope);
      $scope.entry.harvester.processor_code = $scope.processor;
      $scope.MakeHarvesterEntry();
      $scope.formchange = !$scope.formchange;
      $scope.addinfo = false;
    }
    
  };

  $scope.MakeHarvesterEntry = function(){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      $scope.current.harvester = (response.data[0] || response.data);
      $scope.list.harvester.push($scope.current.harvester);
    };
    DatabaseServices.DatabaseEntryCreateCode('harvester', $scope.entry.harvester, $scope.processor, func);

  };

  $scope.ListHarvesters = function(){
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query = '?processor_code=eq.' + $scope.processor;
    DatabaseServices.GetEntries('harvester', func, query);
  };
  $scope.ListHarvesters();

  $scope.SetCurrent = function(selected){
     var filtered = $scope.list.harvester.filter(
      function(value){
        return value.harvester_code === selected;
      });
     $scope.current.harvester = filtered[0];
    $scope.addinfo = false;
  };

})

.controller('NewBoxCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.entry.box = {};
  $scope.SubmitForm = function(form, choices){
    if ($scope.current.harvester !== undefined){
      $scope.entry.box.harvester_code = $scope.current.harvester.harvester_code;

      if ($scope.current.shipping_unit !== undefined){
        $scope.entry.box.shipping_unit_number = $scope.current.shipping_unit.shipping_unit_number;
        $scope.entry.box.received_from = $scope.current.shipping_unit.received_from;

        var date = moment(new Date()).format();
        for (var j=0;j<choices.length;j++){
          var formrow = choices[j];
          $scope.entry.box.grade = formrow.grade; 
          $scope.entry.box.size = formrow.size;
          $scope.entry.box.weight = formrow.weight;

          for (var i=1;i<=formrow.num_boxes;i++){
            var entry = JSON.parse(JSON.stringify($scope.entry.box));
            $scope.MakeBox(entry, date);
          }
        }    
      }else{
        toastr.error("missing shipment info");
      }
    }else{
      toastr.error("missing origin info");
    }    
  };
  
  $scope.MakeBox = function(entry, date){
    var func = function(response){
      var values = response.data[0];
      values.origin = $scope.current.harvester.supplier;
      var data = dataCombine(values, $scope.onLabel.qr);
      var labels = ArrayFromJson(values, $scope.onLabel.print);
      console.log(data, labels);
      $scope.printLabel(data, labels);
    };
    DatabaseServices.DatabaseEntryCreateCode('box', entry, $scope.processor, func);
  };
})



;
