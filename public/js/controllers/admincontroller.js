'use strict';


angular.module('scanthisApp.AdminController', [])


//editentries.html - controller for listing and editing shipment entries
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


//Lot summary page - loads all the data, has functions for exporting to csv and completing lot
.controller('LotCtrl', function($scope, $http, DatabaseServices) {

  $scope.GetHarvesters = function(){
    var query = '';
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    DatabaseServices.GetEntries('harvester', func, query);
  };
  $scope.GetHarvesters();

  $scope.GetHarvesterLot = function(){
    var query = '?processor_code=eq.' + $scope.processor;
    var func = function(response){
      $scope.list.harvester_lot = response.data;
      $scope.GetLotSummary();
    };
    DatabaseServices.GetEntries('harvester_lot', func, query);
  };
  $scope.GetHarvesterLot();

  $scope.GetLotSummary = function(){
    var query = '';
    var func = function(response){
      $scope.list.lot_summary = response.data;
      $scope.GetLotTotals();
    };
    DatabaseServices.GetEntries('lot_summary', func, query);
  };
  
  $scope.GetLotTotals = function(){
    var query = '';
    var func = function(response){
      $scope.list.totals_by_lot = response.data;
      $scope.GetLotLocations();
    };
    DatabaseServices.GetEntries('totals_by_lot', func, query);
  };
  
  $scope.GetLotLocations = function(){
    var query = '?in_progress=eq.true';
    var func = function(response){
      $scope.list.lotlocations = response.data;
      $scope.GetRecentLots();
    };
    DatabaseServices.GetEntries('lotlocations', func, query);
  };

  $scope.GetRecentLots = function(){
    var query = '';
    var func = function(response){
      $scope.list.recent = response.data;
      $scope.loaddata();
    };
    DatabaseServices.GetEntries('recent_lot', func, query);
  };

  $scope.loaddata = function(){
    var cellfilter = function(item){
      return (item.lot_number  === lot.lot_number && item.station_code === stn.code);
    };

    for (var i=0;i<$scope.list.harvester_lot.length;i++){
      var lot = $scope.list.harvester_lot[i];
    
        for (var j=0;j<$scope.sumStations.length;j++){
        var stn = $scope.sumStations[j];
        lot[stn.code]= {};        
        var summary = fjs.select(cellfilter, $scope.list.lot_summary);
        if (summary.length>0){
          lot[stn.code].summary = JSON.parse(JSON.stringify(summary[0]));
        }
        var totals = fjs.select(cellfilter, $scope.list.totals_by_lot);
        if (totals.length>0){
          lot[stn.code].totals = JSON.parse(JSON.stringify(totals));
        }
        var locations = fjs.select(cellfilter, $scope.list.lotlocations);
        if (locations.length>0){
          lot[stn.code].in_progress = JSON.parse(JSON.stringify(locations[0].in_progress));
        }
        if (lot[$scope.sumStations[j].code].summary){ 
          var thesum = lot[$scope.sumStations[j].code].summary;
          var start = (thesum.weight_2 || thesum.weight_1 || 0);
          lot[stn.code].current_weight = JSON.parse(JSON.stringify(start));
        }  
        if (j===0 && lot[stn.code].current_weight){
          lot.start_weight = lot[stn.code].current_weight;
        }
        if (j>0){
          if (lot[$scope.sumStations[j-1].code].summary && (lot[$scope.sumStations[j-1].code].summary[$scope.station_info.trackBy])){
            lot[stn.code].prev = JSON.parse(JSON.stringify(lot[$scope.sumStations[j-1].code].summary[$scope.station_info.trackBy]));
          }
          if (lot[$scope.sumStations[j-1].code].summary){
            if ($scope.sumStations[j].yield && $scope.sumStations[j].yield.prev){ 
              var thesummary = lot[$scope.sumStations[j-1].code].summary;
              var prev = (thesummary.weight_2 || thesummary.weight_1 || 0);
              var prevWeight = JSON.parse(JSON.stringify(prev));
              lot[stn.code].prev_yield  = lot[stn.code].current_weight/prevWeight*100;
            }
            if ($scope.sumStations[j].yield && $scope.sumStations[j].yield.start){ 
              lot[stn.code].start_yield  = lot[stn.code].current_weight/lot.start_weight*100;
            } 
          }                
        }
      }

      if(arrayObjectIndexOf($scope.list.recent, lot.lot_number, 'lot_number') !== -1){
        var index = arrayObjectIndexOf($scope.list.recent, lot.lot_number, 'lot_number');
        lot.expanded = true;
        lot[$scope.sumStations[0].code].in_progress = false;
        if (!lot[$scope.sumStations[0].code].summary){
          lot[$scope.sumStations[0].code].summary = true;          
          if (isToday($scope.list.recent[index].timestamp)){
            lot[$scope.sumStations[0].code].in_progress = true;
          }
        }
        
      }
    }

  };








  $scope.CompleteLot = function(lot_number, station_codes){
    var patch = {'in_progress': false};
    var func = function(response){
      window.location.reload();
    };
    var r = confirm("Are you sure you want to complete this lot?");
    if (r === true) {
      for (var i=0;i<station_codes.length;i++){
        var station_code=station_codes[i];
        var query = '?station_code=eq.' + station_code + '&lot_number=eq.' + lot_number;     
          DatabaseServices.PatchEntry('lotlocations',patch, query, func);
      }
    }
  };

  $scope.GetScan = function(){
    var query = '';
    var func = function(response){
      $scope.list.scan = response.data;
      $scope.list.scan.forEach(function(el){
        delete el.weight;
        delete el.pieces;
        delete el.serial_id;
      });
    };
    DatabaseServices.GetEntries('scan', func, query);
  };
  $scope.GetScan();

  $scope.GetBoxScan = function(){
    var query = '';
    var func = function(response){
      $scope.list.box_scan = response.data;
      $scope.list.box_scan.forEach(function(el){
        delete el.shipping_unit_number;
        delete el.harvester_code;
        delete el.product_code;
        delete el.box_number;
      });
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

    var filteredlots = $scope.list.harvester_lot.filter(function(el){
      return el.lot_number === lot_number;
    });
    var lot = filteredlots[0];


    var filteredharvesters = $scope.list.harvester.filter(function(el){
      return el.harvester_code === lot.harvester_code;
    });
    var harvester = filteredharvesters[0];

    var cellData = table.filter(cellFilter);
    cellData.forEach(function(el){
      delete el.lot_number;
      delete el.station_code;
      el.fleet = lot.fleet_vessel;
      el.supplier = lot.supplier;
      el.supplier_group = lot.supplier_group;
      el.ft_fa_code = harvester.ft_fa_code;
    });

    cleanJsonArray(cellData);    
    return cellData;
  };

  $scope.cssWarn = function(lot, stn) {
    if ( lot[stn.code] && lot[stn.code].summary) { 
      return lot[stn.code].summary[$scope.station_info.trackBy]>lot[stn.code].prev;
    }
    return false;  
  };

  $scope.cssOk = function(lot, stn) {
    if ( lot[stn.code] && lot[stn.code].summary) { 
      return lot[stn.code].summary[$scope.station_info.trackBy]===lot[stn.code].prev; 
    }
    return false;
  };  
})

//shipmenttotals.html - view summary of unloaded boxes for incoming shipments
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
      for (var i=0;i<$scope.list.origin.length;i++){
        $scope.list[$scope.list.origin[i]] = {};
        $scope.list[$scope.list.origin[i]].summary = $scope.list.containersummary.filter(
          function(value){
            return value.harvester_code === $scope.list.origin[i];
          }
          );
        $scope.GetOrigin($scope.list.origin[i]);
      }
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

//inventory.html - shows current totals of boxes at given stations
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
        return isInArray(value.station_code, selected);
      });
    $scope.list.boxes = filtered;

    var lists = $scope.stations.filter(
      function(value){
        return value.station_code[0] === JSON.parse(selected)[0];
      });
    $scope.listconfig = $scope[lists[0].list];
    $scope.inventorytitle = lists[0].name;
  };
})
;
