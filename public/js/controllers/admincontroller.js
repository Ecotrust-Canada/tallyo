'use strict';


angular.module('scanthisApp.AdminController', [])


.controller('StartNewLotCtrl', function($scope, $injector, $timeout, toastr, DatabaseServices) {

  $scope.isDisabled = false;
  $scope.StartNewLot = function(){
    var func = function(response){
      $scope.current.collectionid = response.data.lot_number;
      //$scope.current.lot = response.data;
      $scope.list.lot.push(response.data);
      toastr.success('lot created');
    };
    $scope.isDisabled = true;
    // reenable button after two seconds have passed
    $timeout(function(){
      $scope.isDisabled = false;},
      2000);
    var entry = {};
    var date = new Date();
    entry.lot_number = createLotNum($scope.station_code, date);
    entry.timestamp = moment(date).format();
    var dates = dateManipulation(date, 'day');
    entry.start_date = dates.start_date;
    entry.end_date = dates.end_date;
    entry.station_code = $scope.station_code;
    DatabaseServices.DatabaseEntryReturn('lot', entry, func);
  };

})



.controller('FormSelectionCtrl', function($scope, $http, DatabaseServices) {

  $scope.getProcessors = function(){

    var func = function(response){
      $scope.list.processor = response.data;
    };
    var query = '';
    DatabaseServices.GetEntries('processor', func, query);
  };

  $scope.getProcessors();
})



.controller('HarvesterDropDownCtrl', function($scope, $http, DatabaseServices) {

  $scope.getHarvesters = function(processor){

    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query = '?processor_code=eq.' + processor;
    DatabaseServices.GetEntries('harvester', func, query);
  };

  $scope.$watch('current.shipping_unit.received_from', function(newValue, oldValue) {
    if ($scope.current.shipping_unit !== undefined){
       $scope.getHarvesters($scope.current.shipping_unit.received_from);
    }
  }); 
})

.controller('ShipListCtrl', function($scope, $http, DatabaseServices) {

  $scope.ListShipments = function(){
    var func = function(response){
      $scope.list.shipments = response.data;
    };
    var query = '?station_code=eq.' + $scope.station_code;
    DatabaseServices.GetEntries('shipping_unit', func, query);
  };

  $scope.ListShipments();

  $scope.Edit = function(ship_id){

    var index = arrayObjectIndexOf($scope.list.shipments, ship_id, 'shipping_unit_number');
    $scope.current.shipment = {};
    for (var name in $scope.list.shipments[index]){
      $scope.current.shipment[name] = $scope.list.shipments[index][name];
    }
  };



  $scope.form={};

  
  $scope.ShipInfo = function(){

    var func = function(response){
      $scope.current.shipment = null;
      $scope.ListShipments();
    };
    var query = '?shipping_unit_number=eq.' + $scope.current.shipment.shipping_unit_number;
    DatabaseServices.PatchEntry('shipping_unit', $scope.current.shipment, query, func);
  }; 

})

.controller('LotCtrl', function($scope, $http, DatabaseServices) {

  $scope.sumStations = 
  [
    {'name': 'Receiving', 'code': 'HS0-001'},
    {'name': 'Trimming', 'code': 'HS0-002'},
    {'name': 'Retouching', 'code': 'HS0-003'},
    {'name': 'Boxing', 'code': 'HS0-004'},
    {'name': 'Shipping', 'code': 'HS0-005'},
  ];

 
  $scope.GetLotLocations = function(){
    var query = '';
    var func = function(response){
      $scope.list.lot_location = response.data;
    };
    DatabaseServices.GetEntries('select_lot', func, query);
  };

  $scope.GetLotLocations();


  $scope.GetLotSummary = function(){
    var query = '';
    var func = function(response){
      $scope.list.lot_summary = response.data;
    };
    DatabaseServices.GetEntries('lot_summary', func, query);
  };

  $scope.GetLotSummary();

  $scope.GetLotTotals = function(){
    var query = '';
    var func = function(response){
      $scope.list.totals_by_lot = response.data;
    };
    DatabaseServices.GetEntries('totals_by_lot', func, query);
  };

  $scope.GetLotTotals();

})

.controller('DropDownCtrl',function($scope, $http, DatabaseServices){
  $scope.FormData = function(table){
      var func = function(response){
        $scope.formjson = response.data[0].form;  
      };
      var query = '?tablename=eq.' + table + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntryNoAlert('form', func, query);
    };

  $scope.New = function(value){
    if (value){
      $scope.formjson.fields[$scope.model.id].value.push({"name": value});
      $scope.SaveDB();
    }    
    
  };

  $scope.SaveDB = function(){
    var func = function(response){
    };
    var query = '?tablename=eq.' + $scope.tablename + '&station_code=eq.' + $scope.station_code;
    DatabaseServices.PatchEntry('form', {'form': $scope.formjson }, query, func);
  };

  $scope.Edit = function(index, name){
    $scope.formjson.fields[$scope.model.id].value[index].name = name;
  };

  $scope.Save = function(index, name){
    $scope.formjson.fields[$scope.model.id].value[index].name = name;
    $scope.SaveDB();
  };

  $scope.Delete = function(index, name){
    $scope.formjson.fields[$scope.model.id].value = $scope.formjson.fields[$scope.model.id].value.filter(function (el) {
                        return el.name !== name;
                       });
    $scope.SaveDB();
  };

  $scope.init = function(table){
    $scope.tablename = table;
    $scope.FormData(table);
    $scope.model = {};
    $scope.search = {};
    $scope.search.type = "select";
  };



})

.controller('SubmitProcessorCtrl',function($scope, $http, DatabaseServices, toastr){
  $scope.FormData = function(){
    console.log('function called');
      var func = function(response){
        $scope.formjson = response.data[0].form; 
        console.log($scope.formjson); 
        $scope.New($scope.codepatch);
      };
      var query = '?tablename=eq.harvester' + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntryNoAlert('form', func, query);
    };

  $scope.New = function(value){
    if (value){
      $scope.formjson.fields[14].value.push({"name": value});
    }    
    
    var func = function(response){
    };
    var query = '?tablename=eq.harvester' + '&station_code=eq.' + $scope.station_code;
    DatabaseServices.PatchEntry('form', {'form': $scope.formjson }, query, func);
  };


  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
      responsefunction(response);
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryReturn($scope.table, $scope.entry[$scope.table], func);
    }
    else{ toastr.error("empty form"); }  
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    MakeEntry(form, $scope.table, $scope);
    $scope.codepatch = $scope.form.processor_code;
    console.log($scope.codepatch);
    $scope.ToDatabase(responsefunction);
  };

  //The different submit buttons
  $scope.SubmitAddtoList = function(form){
    $scope.Submit(form, $scope.FormData);
  };

})
;
