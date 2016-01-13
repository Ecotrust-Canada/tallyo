'use strict';


angular.module('scanthisApp.AdminController', [])


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


//Lot summary page
.controller('LotCtrl', function($scope, $http, DatabaseServices) {
 
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

  $scope.GetLotStations = function(){
    var query = '?in_progress=eq.true';
    var func = function(response){
      $scope.list.stationlot = response.data;
    };
    DatabaseServices.GetEntries('lotlocations', func, query);
  };
  $scope.GetLotStations();

  $scope.CompleteLot = function(lot_number, station_codes){
    var patch = {'in_progress': false};
    var func = function(response){
      window.location.reload();
    };
    var r = confirm("Are you sure you want to complete this lot?");
    if (r === true) {
      for (var i=0;i<station_codes.length;i++){
        var station_code=station_codes[i];
        var query = '?station_code=eq.' + station_code + '&collectionid=eq.' + lot_number;     
          DatabaseServices.PatchEntry('lotlocations',patch, query, func);
      }
    }
  };

  $scope.GetScan = function(){
    var query = '';
    var func = function(response){
      $scope.list.scan = response.data;
    };
    DatabaseServices.GetEntries('scan', func, query);
  };
  $scope.GetScan();

  $scope.GetBoxScan = function(){
    var query = '';
    var func = function(response){
      $scope.list.box_scan = response.data;
    };
    DatabaseServices.GetEntries('box_scan', func, query);
  };
  $scope.GetBoxScan();

  $scope.GetLoinScan = function(){
    var query = '';
    var func = function(response){
      $scope.list.loin_scan = response.data;
    };
    DatabaseServices.GetEntries('loin_scan', func, query);
  };
  $scope.GetLoinScan();

  $scope.getData = function(lot_number, station){
    var csvarray = [];
    var stations = stationlist;
    var isStation = function(value){
      return value.code === station;
    };
    var filtered = $scope.sumStations.filter(isStation);
    var table = $scope.list[filtered[0].csv];
    var cellFilter = function(value){
      return value.lot_number === lot_number && value.station_code === station;
    };
    var cellData = table.filter(cellFilter);
    cleanJsonArray(cellData);    
    return cellData;
  };

})

//editing drop-down options for forms
.controller('DropDownCtrl',function($scope, $http, DatabaseServices){
  $scope.FormData = function(table){
    var func = function(response){
      $scope.formoptions = response.data; 
    };
    var query = '?table_name=eq.' + table;
    DatabaseServices.GetEntryNoAlert('formoptions', func, query);
    };

  $scope.Delete = function(value, field){
    var query='?table_name=eq.' + $scope.tablename + '&value=eq.' + value + '&field_name=eq.' + field;
    var func = function(response){
      $scope.FormData($scope.tablename);
    };
    DatabaseServices.RemoveEntry('formoptions', query, func);
  };

  $scope.New = function(value, field){
    if (value){
      var entry ={"table_name": $scope.tablename, "value": value, "field_name": field};
      var func = function(response){
        $scope.FormData($scope.tablename);
      };
      DatabaseServices.DatabaseEntry('formoptions', entry, func);
    }    
  };

  $scope.init = function(table){
    $scope.tablename = table;
    $scope.FormData(table);
    $scope.model = {};
    $scope.search = {};
    $scope.search.type = "select";
  };



})

.controller('AddtoTableCtrl', function($scope, $http, DatabaseServices, toastr) {
  var table = $scope.tableinform;

  $scope.form = {};
  $scope.entry[table] = {};
  $scope.formchange = true;


  var AddtoList = function(response){
    var thedata = response.data;
    if ($scope.list[table] !== undefined){
      $scope.list[table].push(thedata);
      toastr.success("added");
    }    
  };

  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      responsefunction(response);
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryReturn(table, $scope.entry[table], func);
    }
    else{ toastr.error("empty form"); }
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    if (table === 'product'){
      $scope.entry.product.product_code = ($scope.form.sap_item_code ? $scope.form.sap_item_code : createProdCode(new Date()));
      MakeEntry(form, 'product', $scope);
      $scope.entry.product.best_before = ($scope.form.best_before ? moment.duration($scope.form.best_before, 'years') : moment.duration(1, 'years'));
    }
    else{
      MakeEntry(form, table, $scope);
    }
    $scope.ToDatabase(responsefunction);
  };

  $scope.SubmitAddtoList = function(form){
    $scope.Submit(form, AddtoList);
  };

})
;
