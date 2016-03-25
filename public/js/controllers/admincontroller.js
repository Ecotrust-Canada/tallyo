'use strict';


angular.module('scanthisApp.AdminController', [])


//editentries.html - controller for listing and editing shipment entries
.controller('ShipListCtrl', function($scope, $http, DatabaseServices) {

  $scope.current.itemchange = true;

  $scope.limit = 10;

  $scope.ListShipments = function(){
    var func = function(response){
      $scope.list.shipments = response.data;
    };
    var query = '?station_code=eq.' + $scope.station_code;
    DatabaseServices.GetEntries('shipping_unit', func, query);
  };
  $scope.ListShipments();

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
      $scope.ListShipments();
    };
    var query = '?shipping_unit_number=eq.' + $scope.current.shipment.shipping_unit_number;
    DatabaseServices.PatchEntry('shipping_unit', $scope.current.shipment, query, func);
  }; 

  $scope.getTheData = function(ship_obj){

    $scope.getCSV(ship_obj.shipping_unit_number, ship_obj.po_number, 'box_detail', 'detail');
    $scope.getCSV(ship_obj.shipping_unit_number, ship_obj.po_number, 'box_sum', 'summary');

  };

  $scope.getCSV = function(ship_number, po_number, table, label){
    var query = '?shipping_unit_number=eq.' + ship_number + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.list.detail = response.data;
      var full_array = [];
      var title_array = propertyNames($scope.list.detail[0]);
      title_array.shift();
      title_array.shift();
      title_array.shift();
      full_array.push(title_array);
      for (var i=0;i<$scope.list.detail.length;i++){
        var the_array = [];
        var an_array = fjs.toArray($scope.list.detail[i]);
        an_array.forEach(function(el){
          the_array.push(el[1]);
        });
        the_array.shift();
        the_array.shift();
        the_array.shift();
        var new_array = JSON.parse(JSON.stringify(the_array));
        full_array.push(new_array);
      }
      var name = po_number;
      if (label){
        name += '_' + label;
      }
      name += '.csv';
      console.log(name);
      alasql("SELECT * INTO CSV( '"+name+"', {separator:','}) FROM ?",[full_array]);
    };
    DatabaseServices.GetEntries(table, func, query);
  };

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


  $scope.postHarResponse = function(tf_code, status, data){
    var patch = {'har_response_status': status, 'har_response_data': data};
    var query = '?tf_code=eq.' + tf_code;
    var func = function(response){

    };
    DatabaseServices.PatchEntry('thisfish', patch, query, func);
  };

  $scope.postProResponse = function(tf_code, status, data){
    var patch = {'pro_response_status': status, 'pro_response_data': data};
    var query = '?tf_code=eq.' + tf_code;
    var func = function(response){

    };
    DatabaseServices.PatchEntry('thisfish', patch, query, func);
  };


  $scope.ThisfishHar = function(lot_number){
    var posturl = '';
    var query = '?lot_number=eq.' + lot_number;
    var func = function(response){
      //console.log(response.data[0]);
      var harvester_entry = JSON.parse(JSON.stringify(response.data[0]));
      delete harvester_entry.lot_number;
      harvester_entry.entry_unit = $scope.settings.entry_unit;
      harvester_entry.shipped_to_user = $scope.settings.tf_user_id;
      harvester_entry.landing_slip_number = '000000';
      harvester_entry.privacy_display_date = '20';
      harvester_entry.amount = Math.round(harvester_entry.amount);
      //console.log(harvester_entry);

      for (var key in harvester_entry) {
        if (harvester_entry.hasOwnProperty(key) && tf_har_options[key]) {
          var name = harvester_entry[key];
          var filtered = tf_har_options[key].filter(function(el){
            return el.name === name;
          });
          //console.log(key, name, filtered);
          if(!filtered[0]){
            //console.log(key, name);
          }
          else{
            var id = filtered[0].id;
            harvester_entry[key] = id;
            if (key === 'user'){
              if (filtered[0].group === 'fleet'){
                posturl = posturl_fleet;
              }
              else if (filtered[0].group === 'fish_harvester'){
                posturl = posturl_harvester;
              }
            }
          }
          
          

          //console.log(id);
        }
      }
      console.log(harvester_entry);
      //console.log(posturl);
      $http.post(posturl, harvester_entry, tfconfig).then
      (function(response){
        console.log(response);
        $scope.postHarResponse(harvester_entry.end_tag, response.status, response.data);
        $scope.ThisfishPro(lot_number);
      }, 
        function(response){
          console.log(response);
          $scope.postHarResponse(harvester_entry.end_tag, response.status, response.data);
        });

      
    };
    DatabaseServices.GetEntries('tf_harvester_entry', func, query);
  };


  $scope.ThisfishPro = function(lot_number){
    var query = '?lotnum=eq.' + lot_number;
    var func = function(response){
      //console.log(response.data[0]);
      var processor_entry = JSON.parse(JSON.stringify(response.data[0]));
      delete processor_entry.lotnum;
      processor_entry.user = $scope.settings.tf_user;
      processor_entry.entry_unit = $scope.settings.entry_unit;
      processor_entry.location = $scope.settings.process_location;
      processor_entry.privacy_display_date = '20';
      processor_entry.amount = Math.round(processor_entry.amount);

      for (var key in processor_entry) {
        if (processor_entry.hasOwnProperty(key) && tf_pro_options[key]) {
          var name = processor_entry[key];
          var filtered = tf_pro_options[key].filter(function(el){
            return el.name === name;
          });
          //console.log(key, name, filtered);
          var id = filtered[0].id;
          processor_entry[key] = id;

          //console.log(id);
        }
      }
      console.log(processor_entry);
      $http.post(posturl_processor, processor_entry, tfconfig)
      .then(function(response){
        console.log(response);
        $scope.postProResponse(processor_entry.end_tag, response.status, response.data);
      }, 
      function(response){
        $scope.postProResponse(processor_entry.end_tag, response.status, response.data);
      });
    };
    DatabaseServices.GetEntries('tf_processor_entry_simple', func, query);
  };


  $scope.SubmitLot = function(lot_number, tf_code){
    if (tf_code){
      $scope.ThisfishHar(lot_number);
      //$scope.ThisfishPro(lot_number);
    }
  };

  $scope.getTheData = function(lot_number, stn, lot_code){
    if (stn.csv === 'scan'){
      $scope.getCSV(lot_number, stn, lot_code, 'scan_detail');

    }
    else if (stn.csv === 'box_scan'){
      $scope.getCSV(lot_number, stn, lot_code, 'box_detail', 'detail');
      $scope.getCSV(lot_number, stn, lot_code, 'box_sum', 'summary');
    }
    else if (stn.csv === 'loin_scan'){
      $scope.getCSV(lot_number, stn, lot_code, 'loin_detail');
    }

  };

  $scope.getCSV = function(lot_number, stn, lot_code, table, label){
    var query = '?lot_number=eq.' + lot_number + '&station_code=eq.' + stn.code;
    var func = function(response){
      $scope.list.detail = response.data;
      var full_array = [];
      var title_array = propertyNames($scope.list.detail[0]);
      title_array.shift();
      title_array.shift();
      title_array.shift();
      full_array.push(title_array);
      for (var i=0;i<$scope.list.detail.length;i++){
        var the_array = [];
        var an_array = fjs.toArray($scope.list.detail[i]);
        an_array.forEach(function(el){
          the_array.push(el[1]);
        });
        the_array.shift();
        the_array.shift();
        the_array.shift();
        var new_array = JSON.parse(JSON.stringify(the_array));
        full_array.push(new_array);
      }
      var name = lot_code + '_' + stn.name;
      if (label){
        name += '_' + label;
      }
      name += '.csv';
      console.log(name);
      alasql("SELECT * INTO CSV( '"+name+"', {separator:','}) FROM ?",[full_array]);
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
      return (item.internal_lot_code && item.internal_lot_code.indexOf($scope.searchText) > -1) || 
             item.lot_number.indexOf($scope.searchText) > -1 ||
             (item.supplier && item.supplier.indexOf($scope.searchText) > -1) ||
             (item.fleet && item.fleet.indexOf($scope.searchText) > -1) ||
             (item.tf_code && item.tf_code.indexOf($scope.searchText) > -1) ||
             (item.landing_location && item.landing_location.indexOf($scope.searchText) > -1) ||
             (item.ft_fa_code && item.ft_fa_code.indexOf($scope.searchText) > -1); 
  }
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

  $scope.boxconfig = 
  {
    cssclass: "fill small", 
    headers: ["Total Weight", "Cases"], 
    fields: ["weight_total", "boxes"], 
  };

  $scope.loinconfig = 
  {
    cssclass: "fill small", 
    headers: ["Total Weight", "Pieces"], 
    fields: ["weight_total", "pieces"], 
  };

  $scope.ListBoxes = function(){
    var func = function(response){
      $scope.list.box_inventory = response.data;
    };
    var query = '';
    DatabaseServices.GetEntries('box_inventory', func, query);
  };
  $scope.ListBoxes();


  $scope.ListLoins = function(){
    var func = function(response){
      $scope.list.loin_inventory = response.data;
    };
    var query = '';
    DatabaseServices.GetEntries('loin_inventory', func, query);
  };
  $scope.ListLoins();

  $scope.SetCurrent = function(selected){
    var filtered;
    if (selected.item === 'box'){
      filtered = $scope.list.box_inventory.filter(
        function(value){
          return isInArray(value.station_code, selected.station_code);
        });
      $scope.listconfig = JSON.parse(JSON.stringify($scope.boxconfig));      
    }else if (selected.item === 'loin'){
      filtered = $scope.list.loin_inventory.filter(
        function(value){
          return isInArray(value.station_code, selected.station_code);
        });
      $scope.listconfig = JSON.parse(JSON.stringify($scope.loinconfig));
    }
    
    $scope.list.items = filtered;
    $scope.listconfig.headers = selected.headers.concat($scope.listconfig.headers);
    $scope.listconfig.fields = selected.fields.concat($scope.listconfig.fields);

    
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
