'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ScanCtrl', function($scope, $http, $interval, DatabaseServices, toastr, $timeout) {
  var scalePromise;

  // $scope.entry.scan = {};
  // $scope.entry.loin = {};
  // $scope.entry.box = {};
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
      var _timeout = ($scope.options.scale_timeout || $scope.settings.scale_timeout || 1000);

      $http({
        method: 'GET',
        url: $scope.scaleURL + 'weight',
        timeout: _timeout
      }).then(
        function successCallback(response) {
          if ($scope.retry != 0){
            var status_msg = document.getElementById('scale_status_message_' + ($scope.scanform.station_id || ''));
            if(status_msg) {
              status_msg.innerText = 'Scale OK';
              status_msg.className = 'scale_msg';
              console.log('Scale connection restored after ' + $scope.retry * _timeout / 1000 + ' seconds');
            }
          }
          $scope.retry = 0;
          if(response.data && response.data.value !== "" && response.data.value !== null  && response.data.value !== 'undefined'){
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
          // get the manual_input_ element - this means clicking it will set manual input mode but it is currently in auto mode
          var thediv = document.getElementById('manual_input_' + ($scope.scanform.station_id || ''));
          if (thediv) {
            // let's avoid a divide by zero shall we
            if (_timeout <= 0) _timeout = 1000;

            // retry for at least 2 seconds and increment retry counter every time to track total length of lost comms
            if ($scope.retry++ < ( 2000 / _timeout )) {
              // only log to console during unstable period
              console.log('Unstable scale connection for ' + $scope.retry * _timeout / 1000 + ' seconds');

              // we are retrying here now so we do not want to change the state of the scale until the retries have been exhausted
              // basically we are simply delaying the clicking of _thediv which will set the scale to manual mode
              var status_msg = document.getElementById('scale_status_message_' + ($scope.scanform.station_id || ''));
              if(status_msg) {
                status_msg.innerText = 'Scale Unstable';
                status_msg.className = 'scale_msg_warn';
              }
            } else {
              // we have retried for two seconds and no luck reconnectiong - switch to manual input
              // reverse logic here - thediv manual_input_ means clicking it will make it manual input
              //thediv.click();

              var status_msg = document.getElementById('scale_status_message_' + ($scope.scanform.station_id || ''));
              if(status_msg) {
                status_msg.innerText = 'Scale LOST';
                status_msg.className = 'scale_msg_error';

                // clear the scale value
                $scope.scale[fieldName] = "";
              }
            }
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

  $scope.DatabaseScan = function(entry){
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.formchange = !$scope.formchange;
      $scope.current.addnew = true;      
      if ($scope.options.secondstation){
        $scope.SecondScan(entry);
      }
      var thediv = document.getElementById('scaninput');
          if (thediv){
              thediv.focus();
          }
    };
    if (NoMissingValues(entry.scan)){
      DatabaseServices.DatabaseEntryReturn('scan', entry.scan, func);
    }
    else{ toastr.error("missing values"); }
  };
  

  /*fills in fields in json to submit to database*/
  $scope.MakeScanEntry = function(form, entry){
    entry.scan = {};
    entry.scan = AddtoEntryNonFormData($scope, entry.scan);
    entry.scan = AddtoEntryFormData(form, $scope, entry.scan);

    if ($scope.options && $scope.options.sizefromweight){
      entry.scan.size = sizefromweight(form.weight_1);
    }
    return entry;
  };

  $scope.DatabaseItem = function(entry){ 
    var table = $scope.station_info.itemtable.split('_')[0];
    var itemid = $scope.station_info.itemid;
    if (table === 'box'){
      entry.box.harvester_code = $scope.current[$scope.station_info.collectiontable].harvester_code;
      entry.box.internal_lot_code = $scope.current[$scope.station_info.collectiontable].internal_lot_code;
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
      entry.scan[itemid] = (thedata[itemid]);
      $scope.DatabaseScan(entry);     
    };
    if ($scope.options.print_uuid && NoMissingValues(entry[table], itemid)){
      entry[table].box_number = String(entry[table].uuid_from_label);
      DatabaseServices.DatabaseEntryReturn(table,entry[table], func);
    }
    else if (NoMissingValues(entry[table], itemid)){
      DatabaseServices.DatabaseEntryCreateCode(table, entry[table], $scope.processor, func);
    }
    else{ toastr.error("missing values"); }
  };

  $scope.SecondScan = function(entry){
    entry.scan.station_code = $scope.options.secondstation;    
    var func = function(response){
    };
    DatabaseServices.DatabaseEntryReturn('scan', entry.scan, func);
  };

  $scope.MakeItemScanEntry = function(form, entry){
    var table = $scope.station_info.itemtable.split('_')[0];
    entry.scan = {};
    entry[table] = {};
    entry[table] = AddtoEntryNonFormData($scope, entry[table]);
    entry.scan = AddtoEntryNonFormData($scope, entry.scan);
    entry[table] = AddtoEntryFormData(form, $scope, entry[table]);

    //assign trade_unit and weight(kg) from weight and units 
    if ($scope.options && $scope.options.trade_unit){
      var product = form.product_object;
      
      delete entry.box.product_object;
      if (product.entry_unit === 'lb'){
        entry.box.weight = product.weight / 2.2;
      }
      else if (product.entry_unit === 'kg'){
        entry.box.weight = product.weight;
      }
      entry.box.grade = product.product_type;
      entry.box.product_code = product.product_code;
      entry.box.best_before_date = moment(new Date()).add(parseInt(product.best_before.split(' ')), 'months').format();
    }
    //attach harvester, shipment
    if ($scope.options && $scope.options.lot_info){
      entry.box.harvester_code = $scope.current.harvester_lot.harvester_code;
      entry.box.shipping_unit_in = $scope.current.harvester_lot.shipping_unit_number;
    }
    return entry;
  };

  $scope.Submit = function(form){
    if (form){
      var entry = {};
      if($scope.station_info.itemtable === 'scan'){
        entry = $scope.MakeScanEntry(form, entry);
        $scope.DatabaseScan(entry);
      }
      else{
        entry = $scope.MakeItemScanEntry(form, entry);
        $scope.DatabaseItem(entry);
      }
    }
  };

  $scope.ScanSubmit = function(form, uuid){ 
    if (form){
      var query = "?uuid_from_label=eq." + uuid;
      var func = function(response){
        if (response.data.length>0){
          if (response.data[0].product_code === form.product_object.product_code){
            toastr.warning('overwriting');
          }else{
            toastr.warning('changing product');
          }
          $scope.OverwriteBox(response.data[0].box_number, form, uuid);
        }
        else{
          form.uuid_from_label = uuid;
          $scope.Submit(form);
          form = null;
        }
      };

      var err_func = function(response) {
        console.log(response);
        if (response.data && response.data.code == '22P02'){
          toastr.error('Invalid UUID');
        }
        else if (!response.data || response.data.code !== '23505'){
        toastr.error('Error: ' + (response.statusText || 'no Network Connection'));
        }
        var thediv = document.getElementById('scaninput');
              if (thediv){
                  thediv.focus();
              } 
        var enabled = function(event) {
            return true;
        };
        document.onkeydown = enabled;
      };

      DatabaseServices.GetEntries('box', func, query, null, err_func);
    }
  };

  $scope.OverwriteBox = function(box_number, form, uuid){
    var query = '?box_number=eq.' + box_number;
    var func = function(response){
      var query = '?box_number=eq.' + box_number;
      var func = function(response){
        form.uuid_from_label = uuid;
          $scope.Submit(form);
          form = null;
      };
      DatabaseServices.RemoveEntry('box', query, func, func);
    };
    DatabaseServices.RemoveEntry('scan', query, func, func);
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
    var err_func = function(response){
      if (response.statusText === 'Not Found'){
        $scope.RemoveObject(id, itemid, table);
      }else{
        console.log(response);
        if (response.data.code !== '23505'){
        toastr.error('Error: ' + (response.statusText || 'no Database Connection'));
        }
        var thediv = document.getElementById('scaninput');
              if (thediv){
                  thediv.focus();
              } 
        var enabled = function(event) {
            return true;
        };
        document.onkeydown = enabled;
      }
      
    };
    DatabaseServices.RemoveEntry('scan', query, func, err_func);
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


  $scope.Reprint = function(loin){
    if($scope.onLabel){
      if($scope.current.to_print === true){
        var data = dataCombine(loin, $scope.onLabel.qr);
        var labels = ArrayFromJson(loin, $scope.onLabel.print);
        console.log(data, labels);
        $scope.printLabel(data, labels);    
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

