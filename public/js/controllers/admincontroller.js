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
    var query = '?processor_code=eq.' + $scope.processor;
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

.controller('ViewShipmentCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.istotal = true;
  $scope.selected = "no selected";
  $scope.ListShipments = function(){
    var func = function(response){
      $scope.list.shipping_unit = response.data;
    };
    var query = '?received_from=neq.null';
    DatabaseServices.GetEntries('shipping_unit', func, query);
  };
  $scope.ListShipments();

  $scope.SetCurrent = function(selected){
     var filtered = $scope.list.shipping_unit.filter(
      function(value){
        return value.shipping_unit_number === selected;
      });
     $scope.current.shipping_unit = filtered[0];
     $scope.ShipSummary(selected);
     $scope.OriginSummary(selected);
    //$scope.addinfo = false;
  };


  $scope.ShipSummary = function(ship_num){
    var func = function(response){
      $scope.list.included = response.data;
    };
    var query = '?shipping_unit_number=eq.' + ship_num;
    DatabaseServices.GetEntries('shipment_summary', func, query);
  };

  $scope.OriginSummary = function(ship_num){
    var func = function(response){
      $scope.list.containersummary = response.data;
      var origins = fjs.pluck('harvester_code', $scope.list.containersummary);
      $scope.list.origin = origins.filter(onlyUnique);
      //$scope.list.container = {};
      for (var i=0;i<$scope.list.origin.length;i++){
        $scope.list[$scope.list.origin[i]] = {};
        $scope.list[$scope.list.origin[i]].summary = $scope.list.containersummary.filter(
          function(value){
            return value.harvester_code === $scope.list.origin[i];
          }
          );
        $scope.GetOrigin($scope.list.origin[i]);
      }
      //console.log($scope.list.origin);
    };
    var query = '?shipping_unit_number=eq.' + ship_num;
    DatabaseServices.GetEntries('shipment_summary_more', func, query);
  };

  $scope.GetOrigin = function(origin){
    var func = function(response){
      $scope.list[origin].harvester = response.data[0];
    };
    var query = '?harvester_code=eq.' + origin;
    DatabaseServices.GetEntries('harvester', func, query);
  };

})


.controller('InventoryCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.selected = "no selected";
  $scope.stations = $scope.sumStations;

  $scope.ListStations = function(){
    var func = function(response){
      $scope.list.box_inventory = response.data;
    };
    var query = '';
    DatabaseServices.GetEntries('box_inventory', func, query);
  };
  $scope.ListStations();

  $scope.SetCurrent = function(selected){
     var filtered = $scope.list.box_inventory.filter(
      function(value){
        return value.station_code === selected;
      });
     $scope.list.boxes = filtered;

     var lists = $scope.stations.filter(
      function(value){
        return value.station_code === selected;
      });
     $scope.listconfig = $scope[lists[0].list];
  };
})
;
