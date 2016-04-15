'use strict';
angular.module('scanthisApp.AdminController', [])

//editentries.html - controller for listing and editing shipment entries
.controller('ShipListCtrl', function($scope, $http, DatabaseServices) {

  $scope.current.itemchange = true;
  //$scope.limit = 10;
  $scope.stn = {};
  $scope.stn.index= 0;

  $scope.ListShipments = function(station_code){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract(7, 'days').format();
      var query = '?timestamp=gte.'+ date + '&station_code=eq.' + station_code;
      var func = function(response){
        $scope.list.shipments = response.data;
      };
      DatabaseServices.GetEntries('shipping_unit', func, query, 'fifty');      
    }, function errorCallback(response) {
    });
  };


  $scope.FilterShipDate = function(){
    var station_code = $scope.current.station_code;
    $http.get('/server_time').then(function successCallback(response) {

      var s_offset = parseInt(moment($scope.startDate).format("Z").substring(0,3));
      var e_offset = parseInt(moment($scope.endDate).format("Z").substring(0,3));
      var the_offset = response.data.timezone/60;

      var end_date = moment($scope.endDate).add(e_offset, 'hours').utcOffset(response.data.timezone).subtract(the_offset, 'hours').endOf('day').format();
      var start_date = moment($scope.startDate).add(s_offset, 'hours').utcOffset(response.data.timezone).subtract(the_offset, 'hours').startOf('day').format();

      var query = '?timestamp=gte.'+ start_date + '&timestamp=lte.' + end_date + '&station_code=eq.' + station_code;
      var func = function(response){
        $scope.list.shipments = response.data;
      };
      DatabaseServices.GetEntries('shipping_unit', func, query, 'fifty');      
    }, function errorCallback(response) {
    });
  };

  $scope.totallistconfig = 
  { id: 11,    
    cssclass: "fill small", 
    fields: ["size_grade", "weight", "boxes"], 
    limit: "10000",
    order: "grade",
    /*csv: true*/
  };

  $scope.ListHarvesters = function(){
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    var query = '';
    DatabaseServices.GetEntries('harvester', func, query);
  };
  $scope.ListHarvesters();
  
  $scope.$watch('stn.index', function() {
    if ($scope.stn.index !== undefined && $scope.stn.index !== null){
      $scope.current.shipment = null;
      $scope.current.station_code = $scope.sumStations[$scope.stn.index].station;
      $scope.ListShipments($scope.sumStations[$scope.stn.index].station);
    }
  });

  $scope.Edit = function(ship_obj){
    $scope.current.collectionid = ship_obj.shipping_unit_number;
    $scope.current.shipment = {};
    for (var name in ship_obj){
      $scope.current.shipment[name] = ship_obj[name];
    }
    $scope.current.itemchange = !$scope.current.itemchange;
  };

  $scope.form={};
  
  $scope.ShipInfo = function(){
    var func = function(response){
      $scope.current.shipment = null;
      $scope.ListShipments($scope.sumStations[$scope.stn.index].station);
    };
    var query = '?shipping_unit_number=eq.' + $scope.current.shipment.shipping_unit_number;
    DatabaseServices.PatchEntry('shipping_unit', $scope.current.shipment, query, func);
  }; 


  $scope.getTheData = function(ship_obj){
    var stn = $scope.sumStations[$scope.stn.index];
    if (stn.csv_1 && !stn.csv_2){
      $scope.getCSV(lot_number, stn, lot_code, stn.csv_1.table, stn.csv_1.fields);

    }
    else if (stn.csv_1 && stn.csv_2){
      $scope.getCSV(ship_obj.shipping_unit_number, ship_obj.po_number, stn.csv_1.table, stn.csv_1.fields, 'summary');
      $scope.getCSV(ship_obj.shipping_unit_number, ship_obj.po_number, stn.csv_2.table, stn.csv_2.fields, 'detail');
    }
  };

  $scope.getCSV = function(ship_number, po_number, table, fields, label){
    var query = '?shipping_unit_number=eq.' + ship_number + '&station_code=eq.' +$scope.sumStations[$scope.stn.index].station;
    var func = function(response){
      $scope.list.detail = response.data;
      var name = po_number;
      if (label){
        name += '_' + label;
      }
      name += '.csv';
      console.log(name);
      alasql("SELECT " + fields + " INTO CSV( '"+name+"', {headers: true, separator:','}) FROM ?",[$scope.list.detail]);
    };
    DatabaseServices.GetEntries(table, func, query);
  };

  $scope.searchText = '';
  $scope.startDate = moment().subtract(14, 'days').toDate();
  $scope.endDate = new Date();

  $scope.filter_shipping = function(item){
      if ($scope.searchText === '') return true;
      var searchkey = $scope.searchText.toLowerCase();
      return (item.po_number && item.po_number.toLowerCase().indexOf(searchkey) > -1) || 
             (item.customer && item.customer.toLowerCase().indexOf(searchkey) > -1) ||
             (item.container_number && item.container_number.toLowerCase().indexOf(searchkey) > -1) ||
             (item.bill_of_lading && item.bill_of_lading.toLowerCase().indexOf(searchkey) > -1) ||
             (item.vessel_name && item.vessel_name.toLowerCase().indexOf(searchkey) > -1) ||
             (item.seal_number && item.seal_number.toLowerCase().indexOf(searchkey) > -1); 
  };

  $scope.ListBoxes = function(){
    var query = '?station_code=eq.' + $scope.sumStations[$scope.stn.index].station + '&shipping_unit_number=eq.' + $scope.current.collectionid;    
    var func = function(response){
      $scope.list.included = response.data;
    };
    DatabaseServices.GetEntries('box_with_info', func, query);
  };

  $scope.$watch('current.itemchange', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      if ($scope.current.collectionid === 'no selected'){
        $scope.list.included = null;
      }
      else{
        $scope.show_sorted = false;
        //$scope.totallistconfig.fields[0] = $scope.sumStations[$scope.stn.index].box_info;
        $scope.ListBoxes();
      }
    }
  });

  $scope.ShipTotals = function(){
    var query = '?shipping_unit_number=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.sumStations[$scope.stn.index].station;
    var func = function(response){
      $scope.totals = response.data;
      $scope.loadSorted();
    };
    DatabaseServices.GetEntries('shipment_summary', func, query);
  };

  $scope.$watch('current.itemchange', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.ShipTotals();
    }
  });

  $scope.istotal = true;

  $scope.loadSorted = function(){
    var query = '?shipping_unit_number=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.sumStations[$scope.stn.index].station;
    var func = function(response){
      $scope.totals_sorted = response.data;
      var origins = fjs.pluck('harvester_code', $scope.totals_sorted);
      var originlist = origins.filter(onlyUnique);
      var filtered_origin = originlist.filter(notNull);
      $scope.list.origin = $scope.list.harvester.filter(function(el){
        return (filtered_origin.indexOf(el.harvester_code) != -1);
      });
    };
    DatabaseServices.GetEntries('shipment_summary_more', func, query);
  };

  $scope.showSorted = function(){
    $scope.show_sorted = true;   
  };

  $scope.hideSorted = function(){
    $scope.show_sorted = false;
  };

})


//inventory.html - shows current totals of boxes at given stations
.controller('InventoryCtrl', function($scope, $http, DatabaseServices, toastr) {
  $scope.stn = {};
  $scope.istotal = true;
  $scope.stn.index= 0;
  

  $scope.boxconfig = 
  {
    cssclass: "fill small", 
    fields: ["weight_total", "boxes"], 
    order: 'grade'
  };

  $scope.ListBoxes = function(){
    var func = function(response){
      $scope.list.items = response.data;
      var stn = $scope.sumStations[$scope.stn.index];
      var fields = stn.fields;
      $scope.totallistconfig = JSON.parse(JSON.stringify($scope.boxconfig)); 
      $scope.totallistconfig.fields = fields.concat($scope.totallistconfig.fields);
    };
    var query = '?station_code=eq.' + $scope.sumStations[$scope.stn.index].station;
    DatabaseServices.GetEntries('box_inventory', func, query);
  };

  $scope.$watch('stn.index', function() {
    if ($scope.stn.index !== undefined && $scope.stn.index !== null){    
    $scope.ListBoxes();
    }
  });
})


//Lot summary page - loads all the data, has functions for exporting to csv and completing lot
.controller('LotCtrl', function($scope, $http, DatabaseServices, $timeout) {

  $scope.limit = 10;

  $scope.GetHarvesters = function(){
    var query = '';
    var func = function(response){
      $scope.list.harvester = response.data;
    };
    DatabaseServices.GetEntries('harvester', func, query);
  };
  $scope.GetHarvesters();

  $scope.GetHarvesterLot = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract(7, 'days').format();
      var query = '?start_date=gte.'+ date + '&processor_code=eq.' + $scope.processor;
      var func = function(response){
        $scope.list.harvester_lot = response.data;
        $scope.GetLotSummary();
      };
      DatabaseServices.GetEntries('harvester_lot', func, query, 'fifty');      
    }, function errorCallback(response) {
    });
  };
  $scope.GetHarvesterLot();


  $scope.FilterDate = function(){
    $http.get('/server_time').then(function successCallback(response) {

      var s_offset = parseInt(moment($scope.startDate).format("Z").substring(0,3));
      var e_offset = parseInt(moment($scope.endDate).format("Z").substring(0,3));
      var the_offset = response.data.timezone/60;

      var end_date = moment($scope.endDate).add(e_offset, 'hours').utcOffset(response.data.timezone).subtract(the_offset, 'hours').endOf('day').format();
      var start_date = moment($scope.startDate).add(s_offset, 'hours').utcOffset(response.data.timezone).subtract(the_offset, 'hours').startOf('day').format();

      var query = '?start_date=gte.'+ start_date + '&end_date=lte.' + end_date + '&processor_code=eq.' + $scope.processor;
      var func = function(response){
        $scope.list.harvester_lot = response.data;
        $scope.GetLotSummary();
      };
      DatabaseServices.GetEntries('harvester_lot', func, query, 'fifty');      
    }, function errorCallback(response) {
    });
  };

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



  $scope.getTheData = function(lot_number, stn, lot_code){
    if (stn.csv_1 && !stn.csv_2){
      $scope.getCSV(lot_number, stn, lot_code, stn.csv_1.table, stn.csv_1.fields);

    }
    else if (stn.csv_1 && stn.csv_2){
      $scope.getCSV(lot_number, stn, lot_code, stn.csv_1.table, stn.csv_1.fields, 'summary');
      $scope.getCSV(lot_number, stn, lot_code, stn.csv_2.table, stn.csv_2.fields, 'detail');
    }

  };

  $scope.getCSV = function(lot_number, stn, lot_code, table, fields, label){
    var query = '?lot_number=eq.' + lot_number + '&station_code=eq.' + stn.code;
    var func = function(response){
      $scope.list.detail = response.data;
      var name = lot_code + '_' + stn.name;
      if (label){
        name += '_' + label;
      }
      name += '.csv';
      console.log(name);
      alasql("SELECT " + fields + " INTO CSV( '"+name+"', {headers: true, separator:','}) FROM ?",[$scope.list.detail]);
    };
    DatabaseServices.GetEntries(table, func, query);
  };

  $scope.cssWarn = function(lot, stn) {
    if ( lot[stn.code] && lot[stn.code].summary ) { 

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
  
  $scope.searchText = '';
  $scope.startDate = moment().subtract('days', 7).toDate();
  $scope.endDate = new Date();
  $scope.filter_lot = function(item){
      if ($scope.searchText === '') return true;
      var searchkey = $scope.searchText.toLowerCase();
      return (item.internal_lot_code && item.internal_lot_code.toLowerCase().indexOf(searchkey) > -1) || 
             item.lot_number.toLowerCase().indexOf(searchkey) > -1 ||
             (item.supplier && item.supplier.toLowerCase().indexOf(searchkey) > -1) ||
             (item.fleet && item.fleet.toLowerCase().indexOf(searchkey) > -1) ||
             (item.tf_code && item.tf_code.toLowerCase().indexOf(searchkey) > -1) ||
             (item.landing_location && item.landing_location.toLowerCase().indexOf(searchkey) > -1) ||
             (item.ft_fa_code && item.ft_fa_code.toLowerCase().indexOf(searchkey) > -1); 
  };
})

.controller('CompleteLotCtrl', function($scope, $http, DatabaseServices, $rootScope) {

  $scope.CompleteLot = function(lot_number, station_codes){
    var patch = {'in_progress': false};
    var func = function(response){
      //window.location.reload();
      $rootScope.$broadcast('collection-change', {id: 'no selected'});
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

})





;
