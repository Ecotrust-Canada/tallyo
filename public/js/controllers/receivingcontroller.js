'use strict';


angular.module('scanthisApp.receivingController', [])


.controller('ReadBoxCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.current.addnew = false;

  $scope.readQR = function(){
    var rawArray = $scope.raw.string.toUpperCase().split("/");
    var jsonvalues = {};
    for (var i=0;i<$scope.valuesarray.length;i++){
      jsonvalues[$scope.valuesarray[i]] = rawArray[i];
    }
    $scope.checkBox(jsonvalues);

  };

  $scope.checkBox = function(jsonvalues){
    var func = function(response){
      if (response.data.length === 0){
        $scope.CheckHarvester(jsonvalues);
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
    DatabaseServices.GetEntries('box', func, query);

  };

  $scope.DatabaseScan = function(box_number){ 
    var data = {'box_number': box_number, 'station_code':($scope.options.scan_station ? $scope.options.scan_station : $scope.station_code), 'shipping_unit_number': ($scope.current.harvester_lot ? $scope.current.harvester_lot.shipping_unit_number : $scope.current.shipping_unit.shipping_unit_number)};   
    var func = function(response){
      $scope.raw.string = null;
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.current.addnew = true;
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
      var query = '?box_number=eq.' + jsonvalues.box_number;
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
    var harvestDate = moment(parseInt(jsonvalues.harvest_date, 36)).format();
    var data = 
     {'box_number': jsonvalues.box_number, 
      'harvester_code': jsonvalues.harvester_code, 
      'size': jsonvalues.size, 
      'grade':jsonvalues.grade, 
      'pieces':jsonvalues.pieces, 
      'weight':jsonvalues.weight,
      'case_number':jsonvalues.case_number, /*can mod from box_number*/
      'timestamp': moment(parseInt(jsonvalues.timestamp, 36)).format(),
      'internal_lot_code': jsonvalues.internal_lot_code,  
      'station_code': $scope.station_code,
      'harvest_date': moment(parseInt(jsonvalues.harvest_date, 36)).format(),
      'best_before_date': moment(harvestDate).add(2, 'years').format(),
      'tf_code': jsonvalues.tf_code};
    if ($scope.current.harvester_lot){
      data.shipping_unit_in = $scope.current.harvester_lot.shipping_unit_number;
      data.supplier_code = $scope.current.harvester_lot.supplier_code;
      data.lot_in = $scope.current.harvester_lot.lot_number;
    }
    else if ($scope.current.shipping_unit){
      data.shipping_unit_in = $scope.current.shipping_unit.shipping_unit_number;
    }


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
      $scope.CheckHarvester();
      $scope.formchange = !$scope.formchange;
      $scope.addinfo = false;
    }
    
  };

  $scope.MakeHarvesterEntry = function(){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      $scope.current.harvester = (response.data[0] || response.data);
      $scope.current.itemchange = !$scope.current.itemchange;
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
     $scope.current.itemchange = !$scope.current.itemchange;
    $scope.addinfo = false;
  };

})


.controller('SettheSupplierCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.formchange = true;
  $scope.addinfo = true;
  $scope.entry.supplier = {};
  $scope.selected = "no selected";

  $scope.SubmitForm = function(form){  
    if (form){
      MakeEntry(form, 'supplier', $scope);
      $scope.entry.supplier.processor_code = $scope.processor;
      $scope.CheckSupplier();
      $scope.formchange = !$scope.formchange;
      $scope.addinfo = false;
    }
    
  };

  $scope.MakeSupplierEntry = function(){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      $scope.current.supplier = (response.data[0] || response.data);
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.list.supplier.push($scope.current.supplier);
    };
    DatabaseServices.DatabaseEntryCreateCode('supplier', $scope.entry.supplier, $scope.processor, func);

  };

  $scope.ListSuppliers = function(){
    var func = function(response){
      $scope.list.supplier = response.data;
    };
    var query = '?processor_code=eq.' + $scope.processor;
    DatabaseServices.GetEntries('supplier', func, query);
  };
  $scope.ListSuppliers();


  $scope.CheckSupplier = function(){
    var func = function(response){
      if (response.data.length < 1){
        $scope.MakeSupplierEntry();
      }
      else{
        toastr.warning('cannot create duplicate');
      }
    };
    var query = '?processor_code=eq.' + $scope.processor;
    $scope.supplierform1.fields.forEach(function(row){
        query += '&' + row.fieldname + '=eq.' + $scope.entry.supplier[row.fieldname];
    });
    DatabaseServices.GetEntries('supplier', func, query);
  };

  $scope.SetCurrent = function(selected){
     var filtered = $scope.list.supplier.filter(
      function(value){
        return value.supplier_code === selected;
      });
     $scope.current.supplier = filtered[0];
     $scope.current.itemchange = !$scope.current.itemchange;
    $scope.addinfo = false;
  };

  $scope.supplierform1 = 
  {
    id: 15, 
    hide: 'Add Supplier',
    submit: 'Set',
    fields:[
      {"value":"","fieldname":"sap_code","title":"Supplier SAP Code","type":"text"}, 
      {"value":"","fieldname":"name","title":"Supplier Name","type":"text", "required": true},
      {"value":"", "fieldname":"msc_code","title":"Certification","type":"text"}
    ],
    dboptions: 'origin',
    editinform: true
  };
  $scope.supplierdropdown = 
  { id: 1, 
    order: "-timestamp", 
    arg: "supplier_code", 
    searchfield: "sap_code",
    delimeter: '-',
    fields: ["name"]
  };
  $scope.supplierdisplay = 
  { id: 1, 
    layout: [
      [{'name':'Supplier Code', 'val':'sap_code'},
      {'name':'Supplier Name', 'val':'name'},
      {'name': 'Certification', 'val':'msc_code'}]
    ]
  };

})

.controller('LoadEditLotCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.GetEditShip = function(){
    var func = function(response){
      $scope.current.ship_edit = response.data[0];
      if ($scope.current.harvester_lot.harvester_code){
        $scope.GetEditHar();
      }
    };
    var query = '?shipping_unit_number=eq.' + $scope.current.harvester_lot.shipping_unit_number;
    DatabaseServices.GetEntries('shipping_unit', func, query);
  };

  $scope.GetEditHar = function(){
    var func = function(response){
      $scope.current.har_edit = response.data[0];
      //console.log($scope.current.har_edit);
      $scope.GetHarArea();
    };
    var query = '?harvester_code=eq.' + $scope.current.harvester_lot.harvester_code;
    DatabaseServices.GetEntries('harvester', func, query);
  };

  $scope.GetHarArea = function(){
    var func = function(response){
      $scope.current.har_area = response.data;
      //console.log($scope.current.har_area);
      $scope.GetHarMethod();
    };
    var query = '?table_name=eq.origin&field_name=eq.fishing_area';
    DatabaseServices.GetEntries('formoptions', func, query);
  };

  $scope.GetHarMethod = function(){
    var func = function(response){
      $scope.current.har_method = response.data;
      //console.log($scope.current.har_method);
    };
    var query = '?table_name=eq.origin&field_name=eq.fishing_method';
    DatabaseServices.GetEntries('formoptions', func, query);
  };  
})


.controller('EditLotCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.ShipInfo = function(){
    var func = function(response){
      if ($scope.current.harvester_lot.harvester_code){
        $scope.PatchHar();
      }else{
        $scope.PatchLot();
      }
      
    };
    var query = '?shipping_unit_number=eq.' + $scope.current.harvester_lot.shipping_unit_number;
    DatabaseServices.PatchEntry('shipping_unit', $scope.current.ship_edit, query, func);
  };

  $scope.PatchHar = function(){
    var func = function(response){
      $scope.PatchLot();
    };
    var patch = {'fleet':$scope.current.har_edit.fleet, 'fishing_area':$scope.current.har_edit.fishing_area, 'fishing_method':$scope.current.har_edit.fishing_method}
    var query = '?harvester_code=eq.' + $scope.current.harvester_lot.harvester_code;
    DatabaseServices.PatchEntry('harvester', patch, query, func);
  };

  $scope.PatchLot = function(){
    var func = function(response){
      $scope.GetLot();
    };
    var patch = {'internal_lot_code': $scope.current.ship_edit.po_number, 'receive_date': $scope.current.receivedate};
    var query = '?shipping_unit_number=eq.' + $scope.current.harvester_lot.shipping_unit_number;
    DatabaseServices.PatchEntry('lot', patch, query, func);
  };

  $scope.GetLot = function(){
    var func = function(response){
      $scope.current.harvester_lot = response.data[0];
    };
    var query = '?lot_number=eq.' + $scope.current.harvester_lot.lot_number;
    DatabaseServices.GetEntries('harvester_lot', func, query);
  };


})

.controller('NewBoxCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.$watch('current.collectionid', function(newValue, oldValue) {
    if ($scope.current.collectionid === undefined  || $scope.current.collectionid === null || $scope.current.collectionid === 'no selected'){
      $scope.formdisabled = true;
    }
    else{
      $scope.formdisabled = false;

    }
  });

  $scope.entry.box = {};
  $scope.SubmitForm = function(choices){
    if (choices){
      if ($scope.current.harvester_lot !== undefined && $scope.current.harvester_lot !== null){
        $scope.entry.box.harvester_code = $scope.current.harvester_lot.harvester_code;
        $scope.entry.box.supplier_code = $scope.current.harvester_lot.supplier_code;
        $scope.entry.box.shipping_unit_in = $scope.current.harvester_lot.shipping_unit_number;
        $scope.entry.box.lot_in = $scope.current.harvester_lot.lot_number;

        for (var j=0;j<choices.length;j++){
          var formrow = choices[j];
          $scope.entry.box.grade = formrow.grade; 
          $scope.entry.box.size = formrow.size;
          $scope.entry.box.weight = formrow.weight;
          $scope.entry.box.station_code = $scope.station_code;

          for (var i=1;i<=formrow.num_boxes;i++){
            var entry = JSON.parse(JSON.stringify($scope.entry.box));
            $scope.MakeBox(entry);
          }
        }            
      }
    }    
  };

  $scope.MakeBox = function(entry){
    var func = function(response){
      $scope.MakeScan(response.data[0].box_number);
    };
    DatabaseServices.DatabaseEntryCreateCode('box', entry, $scope.processor, func);
  };

  $scope.MakeScan = function(id){
    var entry = {};
    entry.box_number = id;
    entry.station_code = $scope.station_code;
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.DatabaseEntryCreateCode('scan', entry, $scope.processor, func);
  };


})

.controller('NoLabelTotalCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.istotal = true;

  $scope.ListBoxes = function(){
    var func = function(response){
      $scope.list.boxes = response.data;
    };
    var query = '?shipping_unit_number=eq.' + $scope.current.harvester_lot.shipping_unit_number;
    DatabaseServices.GetEntries('shipment_summary_more', func, query);
  };

  $scope.ListAllBoxes = function(){
    var func = function(response){
      $scope.list.included = response.data;
    };
    var query = '?shipping_unit_in=eq.' + $scope.current.harvester_lot.shipping_unit_number  + '&order=timestamp.desc';
    DatabaseServices.GetEntries('box_with_info', func, query, 'hundred');
  };


  $scope.totallistconfig = 
  { id: 11,    
    cssclass: "fill small", 
    fields: ["size_grade", "weight", "boxes"]
  };


  $scope.itemlistconfig = 
  { id: 11,    
    cssclass: "fill small", 
    headers: ["Grade", "Size", "weight", ""],
    fields: ["grade", "size", "weight"], 
    button: "remove"
  };

  $scope.$watch('current.itemchange', function(newValue, oldValue) {
    if ($scope.current.harvester_lot){
        $scope.ListBoxes();
        $scope.ListAllBoxes();

    }
  });

  $scope.RemoveScan = function(obj){
    var itemid = obj.box_number;
    var query = '?box_number=eq.' + itemid + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
        $scope.removeBox(obj);
      
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

  $scope.removeBox = function(obj){
    var query = '?box_number=eq.' + obj.box_number;
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('box', query, func);
  };


})



;
