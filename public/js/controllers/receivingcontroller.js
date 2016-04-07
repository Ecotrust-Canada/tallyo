'use strict';


angular.module('scanthisApp.receivingController', [])


.controller('ReadBoxCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.readQR = function(){
    var rawArray = $scope.raw.string.split("/").toUpperCase();
    var jsonvalues = {};
    for (var i=0;i<$scope.valuesarray.length;i++){
      jsonvalues[$scope.valuesarray[i]] = rawArray[i];
    }
    $scope.checkBox(jsonvalues);

  };

  $scope.checkBox = function(jsonvalues){
    var func = function(response){
      if (response.data.length === 0){
        $scope.MakeItemFromQR(jsonvalues);
      }
      else{
        var box = response.data[0];
        if(box.shipping_unit_in === $scope.current.shipping_unit.shipping_unit_number){
          toastr.warning('Already scanned');
          $scope.raw.string = null;
        }else{
          toastr.error('Box with this code already exists');
          $scope.raw.string = null;
        }        
      }
    };

    var query = '?box_number=eq.' + jsonvalues.box_number;
    DatabaseServices.GetEntry('box', func, query);

  };

  $scope.DatabaseScan = function(box_number){ 
    var data = {'box_number': box_number, 'station_code':$scope.station_code, 'shipping_unit_number': $scope.current.shipping_unit.shipping_unit_number};   
    var func = function(response){
      $scope.raw.string = null;
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
          $scope.CheckHarvester(jsonvalues);
        }
      };
      var query = '?box_number=eq.' + jsonvalues.box_number + '&station_code=eq.' + $scope.station_code + '&shipping_unit_number=eq.' + $scope.current.shipping_unit.shipping_unit_number;
      DatabaseServices.GetEntries('box', func, query);
    }
  };

  $scope.CheckHarvester = function(jsonvalues){
    var query = '?harvester_code=eq.' + jsonvalues.harvester_code;
    var func = function(response){
      if (response.data.length<1){
        $scope.createHarvester(jsonvalues);
      }
      else{
        $scope.createBox(jsonvalues);
      }
    };
    DatabaseServices.GetEntries('harvester', func, query);
  };

  $scope.createHarvester = function(jsonvalues){
    var data = 
     {'harvester_code': jsonvalues.harvester_code,
      'fleet': jsonvalues.fleet,
      'supplier_group': jsonvalues.supplier_group,
      'fishing_area': jsonvalues.fishing_area};

    var func = function(response){
      $scope.createBox(jsonvalues);
    };
    DatabaseServices.DatabaseEntryReturn('harvester', data, func);
  };

  $scope.createBox = function(jsonvalues){
    var data = 
     {'box_number': jsonvalues.box_number, 
      'harvester_code': jsonvalues.harvester_code, 
      'size': jsonvalues.size, 
      'grade':jsonvalues.grade, 
      'pieces':jsonvalues.pieces, 
      'weight':jsonvalues.weight,
      'case_number':jsonvalues.case_number, /*can mod from box_number*/
      'timestamp': jsonvalues.timestamp,
      'internal_lot_code': jsonvalues.internal_lot_code,  
      'station_code': $scope.station_code,
      'harvest_date': jsonvalues.harvest_date,
      'best_before_date': moment(jsonvalues.harvest_date).add(2, 'years').format(),
      'shipping_unit_in':$scope.current.shipping_unit.shipping_unit_number};
    //TF Code*****
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
      //$scope.MakeHarvesterEntry();
      $scope.CheckHarvester();
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


  $scope.CheckHarvester = function(){
    var func = function(response){
      if (response.data.length < 1){
        $scope.MakeHarvesterEntry();
      }
      else{
        toastr.warning('cannot create duplicate');
      }
    };
    var query = '?processor_code=eq.' + $scope.processor;
    $scope.addform.fields.forEach(function(row){
        query += '&' + row.fieldname + '=eq.' + $scope.entry.harvester[row.fieldname];
    });
    DatabaseServices.GetEntries('harvester', func, query);
  };

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
          $scope.entry.box.shipping_unit_in = $scope.current.shipping_unit.shipping_unit_number;
          //$scope.entry.box.received_from = $scope.current.shipping_unit.received_from;

          for (var j=0;j<choices.length;j++){
            var formrow = choices[j];
            $scope.entry.box.grade = formrow.grade; 
            $scope.entry.box.size = formrow.size;
            $scope.entry.box.weight = formrow.weight;

            for (var i=1;i<=formrow.num_boxes;i++){
              var entry = JSON.parse(JSON.stringify($scope.entry.box));
              $scope.MakeBox(entry);
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
  
  $scope.MakeBox = function(entry){
    var func = function(response){
      var values = response.data[0];
      values.origin = $scope.current.harvester.supplier;
      if($scope.onLabel){
        var data = dataCombine(values, $scope.onLabel.qr);
        var labels = ArrayFromJson(values, $scope.onLabel.print);
        console.log(data, labels);
        $scope.printLabel(data, labels);
      }
    };
    DatabaseServices.DatabaseEntryCreateCode('box', entry, $scope.processor, func);
  };
})

;
