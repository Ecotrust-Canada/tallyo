'use strict';


angular.module('scanthisApp.receivingController', [])

// This is to read boxes from HS at AM, and from buru at ambon
.controller('ReadBoxCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.clearField = function(){
    $scope.raw.string = null;
    var thediv = document.getElementById('scaninput');
          if (thediv){
            //console.log(thediv.innerHTML);
              thediv.focus();
          }
  };

  var err_func = function(response) {
    console.log(response);
    if (!response.data || response.data.code !== '23505'){
    toastr.error('Error: ' + (response.statusText || 'no Network Connection'));
    }
    //$scope.clearField();
    var enabled = function(event) {
        return true;
    };
    document.onkeydown = enabled;
  };


  $scope.current.addnew = false;

  //get info from QR
  $scope.readQR = function(){
    //console.log($scope.raw.string);
    var rawArray = $scope.raw.string.toUpperCase().split("/");
    $scope.clearField();
    
    //console.log(rawArray);
    var jsonvalues = {};
    for (var i=0;i<$scope.valuesarray.length;i++){
      jsonvalues[$scope.valuesarray[i]] = rawArray[i];
    }
    $scope.checkBox(jsonvalues);
  };

  //Check if box exists
  $scope.checkBox = function(jsonvalues){
    var func = function(response){
      if (response.data.length === 0){
        $scope.CheckHarvester(jsonvalues);
      }
      else{
        var box = response.data[0];
        if(($scope.current.shipping_unit && box.shipping_unit_in === $scope.current.shipping_unit.shipping_unit_number) || ($scope.current.harvester_lot && box.lot_in === $scope.current.harvester_lot.lot_number)){
          toastr.warning('Already scanned');
          //$scope.clearField();
        }else{
          toastr.error('Box with this code already exists');
          //$scope.clearField();
        }        
      }
    };
    var query = '?box_number=eq.' + jsonvalues.box_number;
    DatabaseServices.GetEntries('box', func, query);
  };

  //Check if Harvester exists
  $scope.CheckHarvester = function(jsonvalues){
    var query = '?harvester_code=eq.' + jsonvalues.harvester_code;
    var func = function(response){
      if (response.data.length<1 && jsonvalues.harvester_code){
        $scope.createHarvester(jsonvalues);
      }
      else{
        if(!jsonvalues.harvester_code || (response.data[0].ft_fa_code === jsonvalues.ft_fa_code && response.data[0].fishing_area === jsonvalues.fishing_area)){
          $scope.createBox(jsonvalues);
        }else{
          $scope.patchHarvester(jsonvalues);
        }
      }
    };
    DatabaseServices.GetEntries('harvester', func, query);
  };

  $scope.patchHarvester = function(jsonvalues){
    var query = '?harvester_code=eq.' + jsonvalues.harvester_code;
    var data = {
      'fleet': jsonvalues.fleet,
      'supplier_group': jsonvalues.supplier_group,
      'ft_fa_code': jsonvalues.ft_fa_code,
      'fishing_area': jsonvalues.fishing_area};
    var func = function(response){
      $scope.createBox(jsonvalues);
    };
    DatabaseServices.PatchEntry('harvester', data,query, func, err_func, err_func);
  };

  //create harvester if it doesn't
  $scope.createHarvester = function(jsonvalues){
    var data = {
      'harvester_code': jsonvalues.harvester_code,
      'fleet': jsonvalues.fleet,
      'supplier_group': jsonvalues.supplier_group,
      'ft_fa_code': jsonvalues.ft_fa_code,
      'fishing_area': jsonvalues.fishing_area};
    var func = function(response){
      $scope.createBox(jsonvalues);
    };
    DatabaseServices.DatabaseEntryReturn('harvester', data, func, err_func);
  };

  //create box object
  $scope.createBox = function(jsonvalues){
    var harvestDate = moment(parseInt(jsonvalues.harvest_date, 36)).format();
    var data = 
     {'box_number': jsonvalues.box_number, 
      'harvester_code': jsonvalues.harvester_code, 
      'size': jsonvalues.size, 
      'grade':jsonvalues.grade, 
      'pieces':jsonvalues.pieces, 
      'species': jsonvalues.species,
      'weight':jsonvalues.weight,
      'case_number':jsonvalues.case_number, /*can mod from box_number*/
      'internal_lot_code': jsonvalues.internal_lot_code,
      'pdc_text': jsonvalues.internal_lot_code,  
      'station_code': $scope.station_code,
      'harvest_date': moment(parseInt(jsonvalues.harvest_date, 36)).format(),
      'best_before_date': moment(harvestDate).add(2, 'years').format(),
      'tf_code': jsonvalues.tf_code};
    if ($scope.current.harvester_lot){
      data.shipping_unit_in = $scope.current.harvester_lot.shipping_unit_number;
      //data.supplier_code = $scope.current.harvester_lot.supplier_code;
      data.lot_in = $scope.current.harvester_lot.lot_number;
    }
    else if ($scope.current.shipping_unit){
      data.shipping_unit_in = $scope.current.shipping_unit.shipping_unit_number;
    }
    var func = function(response){
      var box_number = response.data.box_number;
      $scope.DatabaseScan(box_number);
    };
    DatabaseServices.DatabaseEntryReturn('box', data, func, err_func);
  };

  //and scan object
  $scope.DatabaseScan = function(box_number){ 
    var data = {'box_number': box_number, 'station_code':($scope.options.scan_station ? $scope.options.scan_station : $scope.station_code), 'shipping_unit_number': ($scope.current.harvester_lot ? $scope.current.harvester_lot.shipping_unit_number : $scope.current.shipping_unit.shipping_unit_number)};
    if ($scope.current.harvester_lot){
      data.lot_number = $scope.current.harvester_lot.lot_number;
    }   
    var func = function(response){
      //$scope.clearField();
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.current.addnew = true;
    };
    DatabaseServices.DatabaseEntryReturn('scan', data, func, err_func);
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

.controller('SetShipmentCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.$watch('createforms', function(newValue, oldValue) {
    $scope.formchange = !$scope.formchange;
  });

  $scope.formchange = true;
  $scope.entry.shipping_unit = {};

  //Get Data
  $scope.SubmitForm = function(form){  
    if (form){
      MakeEntry(form, 'shipping_unit', $scope);
      $scope.entry.shipping_unit.station_code = $scope.station_code;
      $scope.formchange = !$scope.formchange;
      $scope.CheckShipment();
    }
  };

  //Check if duplicate
  $scope.CheckShipment = function(){
    var func = function(response){
      if (response.data.length < 1){
        $scope.MakeShippingEntry();
      }
      else{
        toastr.warning('duplicate REF # & bill of lading');
      }
    };
    var query = '?po_number=eq.' + $scope.entry.shipping_unit.po_number + '&bill_of_lading=eq.' + $scope.entry.shipping_unit.bill_of_lading;
    DatabaseServices.GetEntries('shipping_unit', func, query);
  };

  //create shipment object
  $scope.MakeShippingEntry = function(){
    var func = function(response){
      $scope.current.shipping_unit = (response.data[0] || response.data);
    };
    DatabaseServices.DatabaseEntryCreateCode('shipping_unit', $scope.entry.shipping_unit, $scope.processor, func);
  };

})

.controller('SetOriginCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.$watch('createforms', function(newValue, oldValue) {
    $scope.formchange = !$scope.formchange;
  });

  $scope.formchange = true;
  $scope.entry.harvester = {};

  //get data
  $scope.SubmitForm = function(form){  
    if (form){
      MakeEntry(form, 'harvester', $scope);
      $scope.formchange = !$scope.formchange;
      $scope.entry.harvester.processor_code = $scope.processor;
      $scope.MakeHarvesterEntry();
    }    
  };

  //create harvester object
  $scope.MakeHarvesterEntry = function(){
    var func = function(response){
      $scope.current.harvester = (response.data[0] || response.data);
    };
    DatabaseServices.DatabaseEntryCreateCode('harvester', $scope.entry.harvester, $scope.processor, func);
  };

})


.controller('SettheSupplierCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.$watch('createforms', function(newValue, oldValue) {
    $scope.formchange = !$scope.formchange;
  });

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

  $scope.SetEditLot = function(lot_number){
    var func = function(response){
      $scope.current.edit_lot = response.data[0];
      $scope.GetEditShip();
    };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.GetEntries('harvester_lot', func, query);
  };


  $scope.GetEditShip = function(){
    $scope.GetReceiveDate();
    var func = function(response){
      $scope.current.ship_edit = response.data[0];
      $scope.GetEditSup();
    };
    var query = '?shipping_unit_number=eq.' + $scope.current.edit_lot.shipping_unit_number;
    DatabaseServices.GetEntries('shipping_unit', func, query);
  };

  $scope.GetReceiveDate = function(){
    var _date;
    if ($scope.current.edit_lot.receive_date){
      _date = new Date($scope.current.edit_lot.receive_date);
      _date = _date.valueOf() + _date.getTimezoneOffset()*60000;
      $scope.current.receivedate = new Date(_date);
    }
    else{
      $scope.current.receivedate=null;
    }    
  };

  $scope.GetEditSup = function(){
    $scope.current.supplier_code = $scope.current.edit_lot.supplier_code;
    var func = function(response){
      $scope.current.sup_edit = response.data[0];
      if ($scope.current.edit_lot.harvester_code){
        $scope.GetEditHar();
      }
    };
    var query = '?supplier_code=eq.' + $scope.current.edit_lot.supplier_code;
    DatabaseServices.GetEntries('supplier', func, query);
  };

  $scope.GetEditHar = function(){
    var func = function(response){
      $scope.current.har_edit = response.data[0];
    };
    var query = '?harvester_code=eq.' + $scope.current.edit_lot.harvester_code;
    DatabaseServices.GetEntries('harvester', func, query);
  };


})

.controller('CSVReceivingCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.getTheData = function(lot_number, stn, lot_code){
    if (stn.csv_lot){
      async.parallel([
          function(callback){ $scope.getlotCSV(callback, lot_number, stn, lot_code, stn.csv_lot.table, stn.csv_lot.fields);},
          function(callback){ $scope.getCSV(callback, lot_number, stn, lot_code, stn.csv_1.table, stn.csv_1.fields);}
      ],
      function(err, results) {
          var name = lot_code;
          name += '.xlsx';
          console.log(name);
          var opts = [{sheetid:'shipment_info',header:true},{sheetid:'boxes',header:true}];
          alasql('SELECT INTO XLSX("' + name + '",?) FROM ?',[opts,results]);
      });
    }
  };

  $scope.getCSV = function(callback, lot_number, stn, lot_code, table, fields){
    var query = '?lot_in=eq.' + lot_number + '&station_code=eq.' + stn.code;
    query += '&order=timestamp.desc';
    var func = function(response){
      if(response.data.length>0){
        $scope.list.detail = response.data;
        var newdata = alasql("SELECT " + fields + " FROM ?",[$scope.list.detail]);
        callback(null, newdata);
      }
      else{
        callback(null, [{nodata:'nodata'}]);
      }
    };
    DatabaseServices.GetEntries(table, func, query, callback);
  };

  $scope.getlotCSV = function(callback, lot_number, stn, lot_code, table, fields){
    var query = '?lot_number=eq.' + lot_number;
    var func = function(response){
      $scope.list.detail = response.data;
      var newdata = alasql("SELECT " + fields + " FROM ?",[$scope.list.detail]);
      callback(null, newdata);
    };
    DatabaseServices.GetEntries(table, func, query);
  };

})


.controller('EditLotCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.save_button = true;

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

  $scope.SetEditSupplier = function(value){
    $scope.current.supplier_code = value;
  };

  $scope.OnChangeShip = function(fieldname, val){
    $scope.current.ship_edit[fieldname] = val;
  };

  $scope.OnChangeHar = function(fieldname, val){
    $scope.current.har_edit[fieldname] = val;
  };

  $scope.ShipInfo = function(){
    $scope.save_button = false;
    var func = function(response){
      if ($scope.current.edit_lot.harvester_code){
        $scope.PatchHar();
      }else{
        $scope.PatchLot();
      }      
    };
    var query = '?shipping_unit_number=eq.' + $scope.current.edit_lot.shipping_unit_number;
    DatabaseServices.PatchEntry('shipping_unit', $scope.current.ship_edit, query, func);
  };

  $scope.PatchHar = function(){
    var func = function(response){
      $scope.PatchLot();
    };
    var patch = {'fleet':$scope.current.har_edit.fleet, 'fishing_area':$scope.current.har_edit.fishing_area, 'fishing_method':$scope.current.har_edit.fishing_method};
    var query = '?harvester_code=eq.' + $scope.current.edit_lot.harvester_code;
    DatabaseServices.PatchEntry('harvester', patch, query, func);
  };

  $scope.PatchLot = function(){
    var func = function(response){
      if ($scope.current.harvester_lot && ($scope.current.lot_to_edit_or_select === $scope.current.harvester_lot.lot_number)){
        $scope.SetLot($scope.current.lot_to_edit_or_select);
      }
      $scope.ListStationLots();
    };
    var browser_date = new Date();
    var _date = new Date($scope.current.receivedate);
    var receive = moment.utc(_date.valueOf() - browser_date.getTimezoneOffset()*60000).format();
    var patch = {'internal_lot_code': $scope.current.ship_edit.po_number, 'receive_date': receive, 'supplier_code': $scope.current.supplier_code};
    var query = '?lot_number=eq.' + $scope.current.edit_lot.lot_number;
    DatabaseServices.PatchEntry('lot', patch, query, func);
  };

  $scope.ListStationLots = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract(30, 'days').format();
      var query = '?end_date=gte.'+ date + '&processor_code=eq.' + $scope.processor + '&station_code=eq.' + $scope.station_code;
      var func = function(response){
        $scope.list.stnlots = response.data;
        $scope.list.stnlots.unshift(null);
        $scope.current.lot_to_edit_or_select=null;
        $scope.current.showforms='NONE';
        $scope.save_button = true;
      };
      DatabaseServices.GetEntries('harvester_lot', func, query);      
    }, function errorCallback(response) {
    });
  };

})

.controller('NewBoxCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.delete_label = "Delete Cases";

  $scope.$watch('current.collectionid', function(newValue, oldValue) {
    if ($scope.current.collectionid === undefined  || $scope.current.collectionid === null || $scope.current.collectionid === 'no selected'){
      $scope.formdisabled = true;
    }
    else{
      $scope.formdisabled = false;
    }
  });

  $scope.SubmitForm = function(choices){
    if (choices){
      var entry = {};
      entry.box = {};
      if ($scope.current.harvester_lot !== undefined && $scope.current.harvester_lot !== null){
        entry.box.harvester_code = $scope.current.harvester_lot.harvester_code;
        entry.box.supplier_code = $scope.current.harvester_lot.supplier_code;
        entry.box.shipping_unit_in = $scope.current.harvester_lot.shipping_unit_number;
        entry.box.lot_in = $scope.current.harvester_lot.lot_number;

        for (var j=0;j<choices.length;j++){
          var formrow = choices[j];
          entry.box.grade = formrow.grade; 
          entry.box.size = formrow.size;
          entry.box.weight = formrow.weight;
          entry.box.species = formrow.species;
          entry.box.station_code = $scope.station_code;

          for (var i=1;i<=formrow.num_boxes;i++){
            var entry_new = JSON.parse(JSON.stringify(entry.box));
            $scope.MakeBox(entry_new);
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
      $scope.current.addnew = true;
    };
    DatabaseServices.DatabaseEntryCreateCode('scan', entry, $scope.processor, func);
  };


  $scope.DeleteBoxes = function(choices){
    if (choices){
      if ($scope.current.harvester_lot !== undefined && $scope.current.harvester_lot !== null){
        var query = '?select=box_number&lot_in=eq.' + $scope.current.harvester_lot.lot_number + '&station_code=eq.' + $scope.station_code + '&lot_number=is.null';
        var func = function(response){
          if (response.data.length<formrow.num_boxes){
            var no_delete = parseInt(formrow.num_boxes) - parseInt(response.data.length);
            toastr.error('failed to delete ' + no_delete + ' boxes. Do not exist');
          }
          for (var k=0;k<response.data.length;k++){
            $scope.DeleteScan(response.data[k].box_number);
          }
        };

        for (var j=0;j<choices.length;j++){
          var formrow = choices[j];
          query += '&grade=eq.' + formrow.grade + '&size=eq.' + formrow.size.toUpperCase() + '&weight=eq.' + formrow.weight + '&species=eq.' + formrow.species + '&limit=' + formrow.num_boxes;
          DatabaseServices.GetEntries('box', func, query);
        }            
      }
    }    
  };

  $scope.DeleteBox = function(box_number){
    var query = '?box_number=eq.' + box_number;
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry('box', query, func);
  };
  $scope.DeleteScan = function(box_number){
    var query = '?box_number=eq.' + box_number + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.DeleteBox(box_number);
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };


})

.controller('NoLabelTotalCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.istotal = true;

  $scope.ListBoxes = function(){
    var func = function(response){
      $scope.list.boxes = response.data;
    };
    var query = '?shipping_unit_number=eq.' + $scope.current.harvester_lot.shipping_unit_number;
    DatabaseServices.GetEntries('box_har_total', func, query);
  };

  $scope.$watch('current.itemchange', function(newValue, oldValue) {
    if ($scope.current.harvester_lot){
        $scope.ListBoxes();
    }
  });

  $scope.RemoveScan = function(obj){
    if (obj.lot_number !== null){
      toastr.error('cannot delete - box in processing');
    }
    else{
      var itemid = obj.box_number;
      var query = '?box_number=eq.' + itemid + '&station_code=eq.' + ($scope.options.scan_station ? $scope.options.scan_station : $scope.station_code);
      var func = function(response){ 
          $scope.removeBox(obj);        
      };
      DatabaseServices.RemoveEntry('scan', query, func);
    }    
  };

  $scope.removeBox = function(obj){
    var query = '?box_number=eq.' + obj.box_number;
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
      $scope.current.removing = !$scope.current.removing;
    };
    DatabaseServices.RemoveEntry('box', query, func);
  };

  $scope.getTheData = function(lot_number, stn, lot_code){
    if (stn.csv_lot){
      async.parallel([
          function(callback){ $scope.getlotCSV(callback, lot_number, stn, lot_code, stn.csv_lot.table, stn.csv_lot.fields);},
          function(callback){ $scope.getCSV(callback, lot_number, stn, lot_code, stn.csv_1.table, stn.csv_1.fields);}
      ],
      function(err, results) {
          var name = lot_code;
          name += '.xlsx';
          console.log(name);
          var opts = [{sheetid:'shipment_info',header:true},{sheetid:'boxes',header:true}];
          alasql('SELECT INTO XLSX("' + name + '",?) FROM ?',[opts,results]);
      });
    }
  };

  $scope.getCSV = function(callback, lot_number, stn, lot_code, table, fields){
    var query = '?lot_in=eq.' + lot_number + '&station_code=eq.' + stn.code;
    var func = function(response){
      if(response.data.length>0){
        $scope.list.detail = response.data;
        var newdata = alasql("SELECT " + fields + " FROM ?",[$scope.list.detail]);
        callback(null, newdata);
      }
      else{
        callback(null, [{nodata:'nodata'}]);
      }
    };
    DatabaseServices.GetEntries(table, func, query, callback);
  };

  $scope.getlotCSV = function(callback, lot_number, stn, lot_code, table, fields){
    var query = '?lot_number=eq.' + lot_number;
    var func = function(response){
      $scope.list.detail = response.data;
      var newdata = alasql("SELECT " + fields + " FROM ?",[$scope.list.detail]);
      callback(null, newdata);
    };
    DatabaseServices.GetEntries(table, func, query);
  };

})



;
