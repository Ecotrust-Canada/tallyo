'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ScanCtrl', function($scope, $http, $interval, DatabaseServices, toastr, $timeout) {
  var scalePromise;

  $scope.entry.scan = {};
  $scope.entry.loin = {};
  $scope.entry.box = {};
  $scope.current.to_print = true;
  //$scope.form = {};
  $scope.formchange = true;
  if ($scope.scanform.startpolling) {
    $scope.scaleon = true;
    $scope.scale= {};
  }
  $scope.current.addnew = false;

  $scope.PrintSwitch = function(){
    $scope.current.to_print = !$scope.current.to_print;
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
        timeout: ($scope.settings.scale_timeout || $scope.options.scale_timeout || 500)
      }).then(
        function successCallback(response) {
          if ($scope.options.truncate){
            $scope.scale[fieldName] = Math.floor(response.data.value * 10)/10;
          }
          else{
            $scope.scale[fieldName] = response.data.value.toFixed(3);
          }
        },
        function errorCallback(response) {
          //alert('once');

    
          $scope.stopPolling();
          var thediv = document.getElementById('manual_input_' + ($scope.scanform.station_id || ''));
          if(thediv){
           $timeout(function(){thediv.click();toastr.error('cannot connect to scale');}, 0);
          }

          
        }
      );
    }, 500);
  };

  // stop polling scale and clear scalePromise
  $scope.stopPolling = function() {
    $interval.cancel(scalePromise);
    scalePromise = null;
  };

  $scope.$on('$locationChangeStart', function( event ) {
      $scope.stopPolling();
  });

  $scope.DatabaseScan = function(form){
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.formchange = !$scope.formchange;
      //toastr.success("submit successful");

      // attempt to highlight new row in itemstable
      /*setTimeout(function () {
        var tr = angular.element(document.querySelector('#item-'+response.data[$scope.station_info.itemid]));  
        if (tr){
          var c = 'new_item';
          tr.addClass(c);
          $timeout(function(){ tr.removeClass(c); }, 700); 
        }
      }, 400);*/

      $scope.current.addnew = true;
      
      if ($scope.options.secondstation){
        $scope.SecondScan();
      }
    };
    if (NoMissingValues($scope.entry.scan)){
      DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
    }
    else{ toastr.error("missing values"); }
  };
  

  /*fills in fields in json to submit to database*/
  $scope.MakeScanEntry = function(form){
    AddtoEntryNonFormData($scope, 'scan');
    AddtoEntryFormData(form, 'scan', $scope);

    if ($scope.options && $scope.options.sizefromweight){
      $scope.entry.scan.size = sizefromweight(form.weight_1);
    }
  };

  $scope.DatabaseItem = function(){ 
    var table = $scope.station_info.itemtable.split('_')[0];
    var itemid = $scope.station_info.itemid;
    if (table === 'box'){
      $scope.entry.box.harvester_code = $scope.current[$scope.station_info.collectiontable].harvester_code;
      $scope.entry.box.internal_lot_code = $scope.current[$scope.station_info.collectiontable].internal_lot_code;
    }  
    var func = function(response){      
      //print a label if onLabel specified in config
      var thedata = ((response.data[0] || response.data));
      thedata.internal_lot_code = ($scope.current[$scope.station_info.collectiontable].internal_lot_code || $scope.current.collectionid);
      if ($scope.current[$scope.station_info.collectiontable].ft_fa_code){        
        thedata.ft_fa_code = $scope.current[$scope.station_info.collectiontable].ft_fa_code;
      }
      if($scope.onLabel && $scope.current.to_print===true){
        var data = dataCombine(thedata, $scope.onLabel.qr);
        var labels = ArrayFromJson(thedata, $scope.onLabel.print);
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

  $scope.SecondScan = function(){
    $scope.entry.scan.station_code = $scope.options.secondstation;    
    var func = function(response){
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  $scope.MakeItemScanEntry = function(form){
    var table = $scope.station_info.itemtable.split('_')[0];
    AddtoEntryNonFormData($scope, table);
    AddtoEntryNonFormData($scope, 'scan');
    AddtoEntryFormData(form, table, $scope);

    //assign trade_unit and weight(kg) from weight and units 
    if ($scope.options && $scope.options.trade_unit){
      //console.log(form.product_object);
      var product = JSON.parse(form.product_object);
      
      delete $scope.entry.box.product_object;
      //console.log(product);
      if (product.entry_unit === 'lb'){
        $scope.entry.box.weight = product.weight / 2.2;
      }
      else if (product.entry_unit === 'kg'){
        $scope.entry.box.weight = product.weight;
      }
      $scope.entry.box.product_code = product.product_code;

      //console.log($scope.entry.box);
    }
    //attach harvester, shipment
    if ($scope.options && $scope.options.lot_info){
      $scope.entry.box.harvester_code = $scope.current.harvester_lot.harvester_code;
      $scope.entry.box.shipping_unit_in = $scope.current.harvester_lot.shipping_unit_number;
      //$scope.entry.box.lot = $scope.current.harvester_lot.lot_number;
    }

  };

  $scope.Submit = function(form){
    if (form){
      if($scope.station_info.itemtable === 'scan'){
        $scope.MakeScanEntry(form);
        $scope.DatabaseScan(form);
      }
      else{
        $scope.MakeItemScanEntry(form);
        $scope.DatabaseItem();
      }
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


  $scope.$watch('current.collectionid', function(newValue, oldValue) {
    if ($scope.current.collectionid === undefined  || 
        $scope.current.collectionid === null  || $scope.current.collectionid === 'no selected'){

      $scope.formdisabled = true;
    }
    else{
      $scope.formdisabled = false;
    }
  });

})

.controller('RemoveScanCtrl', function($scope, $http, toastr, DatabaseServices, $timeout) {

  $scope.RemoveItem = function(id){
    $scope.to_delete = id;
    $scope.overlay('delete' + $scope.station_code);
  };

  $scope.DeleteItem = function(){
    var id = $scope.to_delete;
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
      $scope.to_delete = null;
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

  $scope.RemoveItemScan = function(id){
    var table = $scope.station_info.itemtable.split('_')[0];
    var itemid = $scope.station_info.itemid;
    var query = '?' + itemid + '=eq.' + id;
    var func = function(){
      $scope.RemoveObject(id, itemid, table);
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

  $scope.RemoveObject = function(id, itemid, table){
    var query = '?' + itemid + '=eq.' + id;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.to_delete = null;
    };
    DatabaseServices.RemoveEntry(table, query, func);
  };


  $scope.Reprint = function(loin_number){
    if($scope.onLabel){
      if($scope.current.to_print === true){
        var query = '?station_code=eq.' + $scope.station_code + '&loin_number=eq.' + loin_number;
        var func = function(response){
          var data = dataCombine((response.data[0] || response.data), $scope.onLabel.qr);
          var labels = ArrayFromJson((response.data[0] || response.data), $scope.onLabel.print);
          console.log(data, labels);
          $scope.printLabel(data, labels);
        };
        DatabaseServices.GetEntries('loin_with_info', func, query);        
      }
      else{
        toastr.error('printing off');
      }
    }

  };




})

;

