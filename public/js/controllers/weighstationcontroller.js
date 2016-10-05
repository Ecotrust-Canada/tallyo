'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ScanCtrl', function($scope, $http, $interval, DatabaseServices, toastr, $timeout) {
  var scalePromise;

  $scope.entry.scan = {};
  $scope.entry.loin = {};
  $scope.entry.box = {};
  $scope.current.to_print = true;
  $scope.formchange = true;
  if ($scope.scanform.startpolling) {
    $scope.scaleon = true;
    $scope.scale= {};
  }
  $scope.current.addnew = false;

  $scope.PrintSwitch = function(){
    $scope.current.to_print = !$scope.current.to_print;
    
  };

  $scope.retry = 0;


  $scope.startPolling = function(fieldName) {
    //stop polling scale
    $scope.stopPolling();
    // if toggle_state command is sent flip scale state and start polling
    if (fieldName === 'toggle_state') {
      $scope.scaleon = !$scope.scaleon;
      $scope.startPolling($scope.scanform.startpolling);
      return;
    }
    if (fieldName === 'set_off'){
      $scope.scaleon = false;
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
        timeout: ($scope.options.scale_timeout || $scope.settings.scale_timeout || 1000)
      }).then(
        function successCallback(response) {
          if ($scope.retry !== 0){
            toastr.success('scale reconnected');
          }
          $scope.retry = 0;
          if(response.data.value !== "" && response.data.value !== null){
            if ($scope.options.truncate){
              $scope.scale[fieldName] = Math.floor(response.data.value * 10)/10;
            }
            else if ($scope.options.decimal){
              $scope.scale[fieldName] = response.data.value.toFixed($scope.options.decimal);
            }
            else{
              $scope.scale[fieldName] = response.data.value.toFixed(3);
            }
          }else{
            $scope.scale[fieldName] = "";
          }
        },
        function errorCallback(response) {
          console.log(response);
          // get the manual_input_ element - this means clicking it will set manual input mode but it is currently in auto mode
          var thediv = document.getElementById('manual_input_' + ($scope.scanform.station_id || ''));
          if (thediv) {
            var _timeout = ($scope.options.scale_timeout || $scope.settings.scale_timeout || 1000);
            // let's avoid a divide by zero shall we
            if (_timeout <= 0) _timeout = 1000;

            // retry for at least 2 seconds
            if ($scope.retry < ( 2000 / _timeout )) {
              // we are retrying here now so we do not want to change the state of the scale until the retries have been exhausted
              // basically we are simply delaying the clicking of _thediv which will set the scale to manual mode

              // increment retry and prevent a toast flood by only sending every 5th retry
              if (( $scope.retry++ % 5 ) == 0) {
                toastr.warning('Scale connection is unstable...');
              }
            }
          } else {
            // we have retried for two seconds and no luck reconnectiong - switch to manual input
            // reverse logic here - thediv manual_input_ means clicking it will make it manual input
            thediv.click();

            // alert user to error condition
            toastr.error('Scale connection lost');
          }
        });
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
      $scope.current.addnew = true;      
      if ($scope.options.secondstation){
        $scope.SecondScan();
      }
      var thediv = document.getElementById('scaninput');
          if (thediv){
              thediv.focus();
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
      var product = form.product_object;
      
      delete $scope.entry.box.product_object;
      if (product.entry_unit === 'lb'){
        $scope.entry.box.weight = product.weight / 2.2;
      }
      else if (product.entry_unit === 'kg'){
        $scope.entry.box.weight = product.weight;
      }
      $scope.entry.box.grade = product.product_type;
      $scope.entry.box.product_code = product.product_code;
      $scope.entry.box.best_before_date = moment(new Date()).add(parseInt(product.best_before.split(' ')), 'months').format();
    }
    //attach harvester, shipment
    if ($scope.options && $scope.options.lot_info){
      $scope.entry.box.harvester_code = $scope.current.harvester_lot.harvester_code;
      $scope.entry.box.shipping_unit_in = $scope.current.harvester_lot.shipping_unit_number;
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

  $scope.ScanSubmit = function(form, uuid){ 
    if (form){ 
      $scope.entry.box = {};  
      var query = "?uuid_from_label=eq." + uuid;
      var func = function(response){
        if (response.data.length>0){
          toastr.warning('overwriting');
          $scope.overwrite_form = form;
          $scope.overwrite_uuid = uuid;
          //$scope.overlay('overwrite');
          $scope.OverwriteBox();
        }
        else{
          form.uuid_from_label = uuid;
          $scope.Submit(form);
          form = null;
        }
      };
      DatabaseServices.GetEntries('box', func, query);
    }
  };

  $scope.OverwriteBox = function(){
    delete $scope.overwrite_form['uuid_from_label'];
    $scope.MakeItemScanEntry($scope.overwrite_form);
    var patch = $scope.entry.box;
    var query = "?uuid_from_label=eq." + $scope.overwrite_uuid;
    var func = function(response){
      $scope.overwrite_form = null;
      $scope.overwrite_uuid = null;
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.formchange = !$scope.formchange;
      //$scope.current.addnew = true;
      var thediv = document.getElementById('scaninput');
          if (thediv){
              thediv.focus();
          }      
    };
    DatabaseServices.PatchEntry('box', patch, query, func);
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

  $scope.RemoveItem = function(obj){
    $scope.to_delete = obj;
    $scope.deletelabel = obj[($scope.station_info.deletelabel||$scope.station_info.itemid)];
    $scope.overlay('delete' + $scope.station_code);
  };

  $scope.DeleteItem = function(){
    var id = $scope.to_delete[$scope.station_info.itemid];
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
      var thediv = document.getElementById('scaninput');
          if (thediv){
              thediv.focus();
          }
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


.controller('PrintManyLabelsCtrl', function($scope, uuid) {
  $scope.formchange = false;

  $scope.PrintUUIDLabel = function(uuid){
    var data = uuid;
    var labels = [uuid];
    console.log(data, labels);
    $scope.printLabel(data, labels);
  };

  $scope.SubmitForm = function(form){
    if (form){
      var number_boxes = form.number_boxes;
      for (var i=0;i<number_boxes;i++){
        var hash = uuid.v4();
        $scope.PrintUUIDLabel(hash);
      }
      $scope.formchange = !$scope.formchange;
    }

  };

})

;

