'use strict';


angular.module('scanthisApp.receivingController', [])


.controller('QRScanCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.readQR = function(){
    var rawArray = $scope.raw.string.split("/");
    var jsonvalues = {};
    for (var i=0;i<$scope.valuesarray.length;i++){
      jsonvalues[$scope.valuesarray[i]] = rawArray[i];
    }
    $scope.MakeItemFromQR(jsonvalues);
    
  };

  $scope.DatabaseScan = function(box_number){ 
    var data = {'box_number': box_number, 'station_code':$scope.station_code};   
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.DatabaseEntryReturn('scan', data, func);
  };


  $scope.MakeItemFromQR = function(jsonvalues){
    if ($scope.current.collectionid){
      var func = function(response){
        if (response.data.length >0){
          $scope.raw.string = null;
          toastr.warning("already exists");
        }
        else{
          $scope.CheckLot(jsonvalues);
        }
      };
      var query = '?box_number=eq.' + jsonvalues.box_number + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntries('box', func, query);
    }
    else{
      $scope.raw.string = null; 
      toastr.error("select Collection");
    }
  };

  $scope.CheckLot = function(jsonvalues){
    var query = '?lot_number=eq.' + jsonvalues.lot + '&tf_code=eq.' + jsonvalues.tf_code;
    var func = function(response){
      if (response.data.length<1){
        $scope.createLot(jsonvalues);
      }
      else{
        $scope.createBox(jsonvalues);
      }
    };
    DatabaseServices.GetEntries('receive_lot', func, query);
  };

  $scope.createLot = function(jsonvalues){
    var data = {'lot_number': jsonvalues.lot, 'harvester_code': jsonvalues.harvester_code, 'received_from': $scope.current.shipping_unit.received_from, 'tf_code': jsonvalues.tf_code, 'station_code': $scope.station_code, 'harvest_date': jsonvalues.harvest_date};
    var func = function(response){
      //console.log(response.data);
      $scope.createBox(jsonvalues, response.data[0].receive_code);
    };
    DatabaseServices.DatabaseEntryCreateCode('receive_lot', data, $scope.processor, func);
    //DatabaseServices.DatabaseEntryReturn('receive_lot', data, func);
  };

  $scope.createBox = function(jsonvalues, receive_code){
    var data = {'lot': jsonvalues.lot, 'box_number': jsonvalues.box_number, 'harvester_code': jsonvalues.harvester_code, 'size': jsonvalues.size, 'grade':jsonvalues.grade, 'pieces':jsonvalues.pieces, 'weight':jsonvalues.weight, 'receive_code': receive_code, 'station_code': $scope.station_code, 'shipping_unit_number':$scope.current.shipping_unit.shipping_unit_number};
    var func = function(response){
      var box_number = response.data.box_number;
      $scope.DatabaseScan(box_number);
    };
    DatabaseServices.DatabaseEntryReturn('box', data, func);
  };

  $scope.$watch('current.collectionid', function(newValue, oldValue) {
    if ($scope.current.collectionid === undefined  || $scope.current.collectionid === null || $scope.current.collectionid === 'no selected'){
      $scope.formdisabled = true;
    }
    else{
      $scope.formdisabled = false;
    }
  });

  $scope.Complete = function(){ 
    $scope.current.selected = 'no selected';
    $scope.current.collectionid = 'no selected';
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
  $scope.SubmitForm = function(choices){
    if (choices){
      if ($scope.current.harvester !== undefined && $scope.current.harvester !== null){
        $scope.entry.box.harvester_code = $scope.current.harvester.harvester_code;

        if ($scope.current.shipping_unit !== undefined && $scope.current.shipping_unit !== null){
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
