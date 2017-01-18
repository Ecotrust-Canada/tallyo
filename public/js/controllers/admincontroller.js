'use strict';
angular.module('scanthisApp.AdminController', [])


// ShipListCtrl, InventoryCtrl, LotCtrl, CompleteLotCtrl

//editentries.html - controller for listing and editing shipment entries
.controller('ShipListCtrl', function($scope, $http, DatabaseServices) {

  $scope.current.itemchange = true;
  $scope.stn = {};
  $scope.stn.index= 0;
  
  $scope.ListShipments = function(station_code){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract(7, 'days').format();
      var query = '?timestamp=gte.'+ date + '&station_code=eq.' + station_code + '&order=timestamp.desc';
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

      var query = '?timestamp=gte.'+ start_date + '&timestamp=lte.' + end_date + '&station_code=eq.' + station_code + '&order=timestamp.desc';
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
    order: "grade"
  };
  
  $scope.changeStn = function(index) {
    $scope.stn.index = index;
    $scope.current.shipment = null;
    $scope.current.station_code = $scope.sumStations[$scope.stn.index].station;
    var station = $scope.sumStations[$scope.stn.index];
    if (station.send_field === 'customer'){
      $scope.sort_by = 'lot';
      $scope.sort_id = 'internal_lot_code';
    }
    else if (station.send_field === 'received_from'){
      $scope.sort_by = 'harvester';
      $scope.sort_id = 'internal_lot_code';
    }
    $scope.ListShipments($scope.sumStations[$scope.stn.index].station);
  };
  $scope.changeStn($scope.stn.index);

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
    if (stn.csv_1 && stn.csv_ship){
      async.parallel([
          function(callback){ $scope.getCSV(callback, ship_obj.shipping_unit_number, ship_obj.po_number, stn.csv_ship.table, stn.csv_ship.fields);},
          function(callback){ $scope.getCSV(callback, ship_obj.shipping_unit_number, ship_obj.po_number, stn.csv_1.table, stn.csv_1.fields);}
      ],
      function(err, results) {
          var name = ship_obj.po_number;
          name += '.xlsx';
          console.log(name);
          var opts = [{sheetid:'Shipment',header:true},{sheetid:'Boxes',header:true}];
          alasql('SELECT INTO XLSX("' + name + '",?) FROM ?',[opts,results]);
      });
    }
    else if (stn.csv_1 && !stn.csv_2){
      async.parallel([
          function(callback){ $scope.getCSV(callback, ship_obj.shipping_unit_number, ship_obj.po_number, stn.csv_1.table, stn.csv_1.fields);}
      ],
      function(err, results) {
          var name = ship_obj.po_number;
          name += '.xlsx';
          console.log(name);
          alasql('SELECT * INTO XLSX ("' + name + '", { headers:true }) FROM ?', results);
      });

    }
    else if (stn.csv_1 && stn.csv_2){
      async.parallel([
          function(callback){ $scope.getCSV(callback, ship_obj.shipping_unit_number, ship_obj.po_number, stn.csv_1.table, stn.csv_1.fields, 'summary');},
          function(callback){ $scope.getCSV(callback, ship_obj.shipping_unit_number, ship_obj.po_number, stn.csv_2.table, stn.csv_2.fields, 'detail');}
      ],
      function(err, results) {
          var name = ship_obj.po_number;
          name += '.xlsx';
          console.log(name);
          var opts = [{sheetid:'Summary',header:true},{sheetid:'Loins',header:true}];
          alasql('SELECT INTO XLSX("' + name + '",?) FROM ?',[opts,results]);
      });
    }
  };

  $scope.getCSV = function(callback, ship_number, po_number, table, fields, label){
    var query = '';
    if ($scope.sumStations[$scope.stn.index].send_field === 'received_from'){
      query += '?shipping_unit_in=eq.' + ship_number;
    }
    else{
      query += '?shipping_unit_number=eq.' + ship_number;
    }
    if (!$scope.options.no_station){
      query += '&station_code=eq.' +$scope.sumStations[$scope.stn.index].station;
    }
    query += '&order=timestamp.desc';
    var func = function(response){
      var newdata;
      if (response.data.length > 0){
        $scope.list.detail = response.data;
        newdata = alasql("SELECT " + fields + " FROM ?",[$scope.list.detail]);
      }else{
        newdata = alasql("SELECT " + fields + " FROM ?",[{'nodata':'nodata'}]);
      }
      
      callback(null, newdata);
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
        $scope.ListBoxes();
      }
    }
  });

  $scope.ShipTotals = function(){
    var query = '?shipping_unit_number=eq.' + $scope.current.collectionid;
    var func = function(response){
      $scope.totals = response.data;
    };
    DatabaseServices.GetEntries('shipment_summary', func, query);
  };

  $scope.$watch('current.itemchange', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.ShipTotals();
    }
  });

  $scope.istotal = true;

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

  $scope.invconfig = 
  {
    cssclass: "fill small", 
    headers: ["Case #", "Lot", ""], 
    fields: ["case_number", "internal_lot_code"], 
    order: '-timestamp',
    button: 'remove'
  };

  $scope.ListAllItems = function(){
    var query = '?station_code=eq.' + $scope.sumStations[$scope.stn.index].station + '&weight=neq.0&order=timestamp.desc';
    var func = function(response){
      $scope.items = response.data;
    };
    DatabaseServices.GetEntries('inventory_all', func, query, 'fifty');
  };

  $scope.DeleteInv = function(str){
    $scope.to_delete = str.box_number;
    $scope.overlay('del_box');
  };

  $scope.DelBox = function(){
    var scan = {"station_code": 'deleted', 'box_number': $scope.to_delete};
    var func = function(response){
      $scope.to_delete=null;
      $scope.search = {};
      $scope.ListBoxes();
      $scope.items = null;
    };
    DatabaseServices.DatabaseEntryReturn('scan', scan, func);
  };

  $scope.ListFilteredItems = function(box_number, int_lot_code, case_number){
    var query = '?station_code=eq.' + $scope.sumStations[$scope.stn.index].station ;
    if (box_number !== undefined && box_number !== null && box_number !== ''){
      query += '&box_number=like.*' + box_number.toUpperCase() + '*';
    }
    if (int_lot_code !== undefined && int_lot_code !== null && int_lot_code !== ''){
      query += '&internal_lot_code=like.*' + int_lot_code + '*';
    }
    if (case_number !== undefined && case_number !== null && case_number !== ''){
      query += '&case_number=like.*' + case_number.toUpperCase() + '*';
    }
    query += '&order=timestamp.desc';
    var func = function(response){
      $scope.items = response.data;
      $scope.search = {};
    };
    DatabaseServices.GetEntries('inventory_all', func, query, 'fifty');
  };

  $scope.changeStn = function(index) {
    $scope.stn.index = index; 
    $scope.ListBoxes();
  };
  $scope.changeStn($scope.stn.index);

  $scope.getTheData = function(){
    var stn = $scope.sumStations[$scope.stn.index];
    if (stn.csv_1 && !stn.csv_2){
      async.parallel([
          function(callback){ $scope.getCSV(callback, stn.csv_1.table, stn.csv_1.fields);}
      ],
      function(err, results) {
          var name = 'inventory';
          name += '.xlsx';
          console.log(name);
          alasql('SELECT * INTO XLSX ("' + name + '", { headers:true }) FROM ?', results);
      });
    }
    else if (stn.csv_1 && stn.csv_2){
      async.parallel([
          function(callback){ $scope.getCSV(callback, stn.csv_1.table, stn.csv_1.fields, 'summary');},
          function(callback){ $scope.getCSV(callback, stn.csv_2.table, stn.csv_2.fields, 'detail');}
      ],
      function(err, results) {
          var name = 'inventory';
          name += '.xlsx';
          console.log(name);
          var opts = [{sheetid:'Summary',header:true},{sheetid:'Loins',header:true}];
          alasql('SELECT INTO XLSX("' + name + '",?) FROM ?',[opts,results]);
      });
    }
  };

  $scope.getCSV = function(callback, table, fields, label){
    var query;
    if (label === 'summary'){
      query = '?station_code=eq.' + $scope.sumStations[$scope.stn.index].station + '&weight=neq.0';
    }
    else if (label === 'detail'){
      query = '?station_code=eq.' + $scope.sumStations[$scope.stn.index].station + '&box_weight=neq.0';
    }
    query += '&order=timestamp.desc';
    var func = function(response){
      $scope.list.detail = response.data;
      var newdata = alasql("SELECT " + fields + " FROM ?",[$scope.list.detail]);
      callback(null, newdata);
    };
    DatabaseServices.GetEntries(table, func, query);
  };

})

//Lot summary page - loads all the data, has functions for exporting to csv and completing lot
.controller('LotCtrl', function($scope, $http, DatabaseServices, $timeout) {

  $scope.limit = 10;

  $scope.hide_search = true;

  $scope.search = {};

  $scope.myValueFunction = function(total) {
    return total.grade + 'Z';
  };

  $scope.FilterDate = function(){
    $http.get('/server_time').then(function successCallback(response) {

      var s_offset = parseInt(moment($scope.startDate).format("Z").substring(0,3));
      var e_offset = parseInt(moment($scope.endDate).format("Z").substring(0,3));
      var the_offset = response.data.timezone/60;

      var end_date = moment($scope.endDate).add(e_offset, 'hours').utcOffset(response.data.timezone).subtract(the_offset, 'hours').endOf('day').format();
      var start_date = moment($scope.startDate).add(s_offset, 'hours').utcOffset(response.data.timezone).subtract(the_offset, 'hours').startOf('day').format();

      var query = '?start_date=not.gte.'+ end_date + '&end_date=not.lte.' + start_date + '&processor_code=eq.' + $scope.processor;
      if ($scope.options.internal_lot){//limits to production lots
        query += '&shipping_unit_number=is.null';
      }
      for (var key in $scope.search){
        var val = $scope.search[key];
        query += '&' + key + '=ilike.*' + val + '*';
      }
      query += '&order=timestamp.desc';
      var func = function(response){
        $scope.hide_search = true;
        $scope.list.harvester_lot = response.data;
        $scope.paginate();
        $scope.BeginLoadLots(0, true);
        $scope.loadTimeframeSummary(start_date, end_date);
      };
      DatabaseServices.GetEntries('harvester_lot', func, query/*, 'fifty'*/);      
    }, function errorCallback(response) {
    });
  };

  $scope.GetHarvesterLot = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract(7, 'days').format();
      var now = moment(the_date).utcOffset(response.data.timezone).add(1, 'days').format();
      var query = '?end_date=gte.'+ date + '&processor_code=eq.' + $scope.processor;
      if ($scope.options.internal_lot){
        query += '&shipping_unit_number=is.null';
      }      
      query += '&order=timestamp.desc';
      var func = function(response){
        $scope.list.harvester_lot = response.data;
        $scope.paginate();
        $scope.BeginLoadLots(0);
        $scope.loadTimeframeSummary(date, now);
      };
      DatabaseServices.GetEntries('harvester_lot', func, query/*, 'fifty'*/);      
    }, function errorCallback(response) {
    });
  };
  $scope.GetHarvesterLot();

  $scope.paginate = function(){
    var num = $scope.list.harvester_lot.length;
    var pages = Math.ceil(num/10);
    $scope.list.pages = [];
    for (var i=0;i<pages;i++){
      $scope.list.pages.push(i);
    }
  };

  $scope.BeginLoadLots = function(page, start){
    if ($scope.current.page !== page || start){
      $scope.current.page = page;
      $scope.list.paginated_lots = $scope.list.harvester_lot.slice(page*10,(page*10)+10);
      $scope.list.lot_summary = [];
      $scope.list.totals_by_lot = [];
      $scope.list.lotlocations = [];
      async.forEachOfSeries($scope.list.paginated_lots, function iterator(item, key, callback) {
       $scope.getOneLotSummary(item, key, callback);
      }, function done() {
      });
    }
  };

  $scope.loadTimeframeSummary = function(start_timeframe, end_timeframe){
    var data = {"start_timeframe": start_timeframe, "end_timeframe": end_timeframe};
    $http.post('/timeframe_summary', data, {headers: {'Prefer': 'return=representation'}}).then(
      function(response){
        $scope.list.summary_info = response.data;
        //console.log($scope.list.summary_info);
        $scope.displayTimeframeSummary();
      }
      );
  };


  $scope.displayTimeframeSummary = function(){
     $scope.sum_info ={};

    for (var key in $scope.options.sum_display){
      var row = $scope.options.sum_display[key];
      $scope.sum_info[row.field] = Array.from(new Set(fjs.pluck(row.field, $scope.list.harvester_lot))).length;
    }   
    $scope.sum_info.num_lots = $scope.list.harvester_lot.length;

    var cellfilter = function(item){
      return (item.station_code === stn1.code);
    };

    for (var l=0;l<$scope.sumStations.length;l++){
        var stn1 = $scope.sumStations[l];
        var numbers = fjs.select(cellfilter, $scope.list.summary_info)[0];
        if (numbers){
          $scope.sum_info[stn1.code]=
            {
              'weight_1': (numbers.weight_1 || 0),
              'pieces': (numbers.pieces || 0 ),
              'boxes': (numbers.boxes || 0)
            };
        }
        else{
          $scope.sum_info[stn1.code]=
            {
              'weight_1': 0,
              'pieces': 0,
              'boxes': 0
            };
        }
        if (l===0 && $scope.sum_info[stn1.code].weight_1){
          $scope.sum_info.start_weight = $scope.sum_info[stn1.code].weight_1;
        }
        if (l>0){
          if ($scope.sum_info[$scope.sumStations[l-1].code] && ($scope.sum_info[$scope.sumStations[l-1].code][$scope.station_info.trackBy])){
            $scope.sum_info[stn1.code].prev = JSON.parse(JSON.stringify($scope.sum_info[$scope.sumStations[l-1].code][$scope.station_info.trackBy]));
          }
          if ($scope.sum_info[$scope.sumStations[l-1].code]){
            if ($scope.sumStations[l].yield && $scope.sumStations[l].yield.prev){ 
              var thesummary1 = $scope.sum_info[$scope.sumStations[l-1].code];
              var prev1 = (thesummary1.weight_1 || 0);
              var prevWeight1 = JSON.parse(JSON.stringify(prev1));
              $scope.sum_info[stn1.code].prev_yield  = $scope.sum_info[stn1.code].weight_1/prevWeight1*100;
            }
            if ($scope.sumStations[l].yield && $scope.sumStations[l].yield.start){ 
              $scope.sum_info[stn1.code].start_yield  = $scope.sum_info[stn1.code].weight_1/$scope.sum_info.start_weight*100;
            } 
          }                
        }
      }
  };

  
  $scope.getOneLotSummary = function(harvester_lot, key, callback){
    var data = {"lot_number": harvester_lot.lot_number};
    $http.post('/lot_summary', data, {headers: {'Prefer': 'return=representation'}}).then(
      function(response){
        var lot_summary = response.data;
        for (var the_key in lot_summary){
          $scope.list.lot_summary.push(lot_summary[the_key]);
        } 
        $scope.getOneLotTotal(harvester_lot, key, callback);
      }
      );
  };

  $scope.getOneLotTotal = function(harvester_lot, key, callback){
    var data = {"lot_number": harvester_lot.lot_number};
    $http.post('/lot_totals', data, {headers: {'Prefer': 'return=representation'}}).then(
      function(response){
        var lot_summary = response.data;
        for (var the_key in lot_summary){
          $scope.list.totals_by_lot.push(lot_summary[the_key]);
        } 
        $scope.GetLotLocations(harvester_lot, key, callback);
      }
      );
  };
  $scope.GetLotLocations = function(harvester_lot, key, callback){
    var query = '/lotlocations?in_progress=eq.true&lot_number=eq.' + harvester_lot.lot_number;
    $http.get(query).then(
      function(response){
        var lot_summary = response.data;
        for (var the_key in lot_summary){
          $scope.list.lotlocations.push(lot_summary[the_key]);
        } 
        callback(null, lot_summary);
        $scope.loaddata(harvester_lot, key);
      }
      );
  };
  

  $scope.loaddata = function(harvester_lot, key){
    var cellfilter = function(item){
      return (item.lot_number  === lot.lot_number && item.station_code === stn.code);
    };
    var lot = harvester_lot;
    
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
    if (key === 0){
      $scope.list.harvester_lot[0].expanded = true;
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

  $scope.getAllData = function(lot_number, lot_code){
    var func_array = [];
    var opts = [];
    if ($scope.sumStations[0].csv_lot){
      var stn = $scope.sumStations[0];
      func_array.push(function(callback){ $scope.getlotCSV(callback, lot_number, stn, lot_code, stn.csv_lot.table, stn.csv_lot.fields);});
      opts.push({sheetid: 'lot_info' , header:true});
    }
    else if ($scope.sumStations[0].csv_prolot){
      var prostn = $scope.sumStations[0];
      func_array.push(function(callback){ $scope.getprolotCSV(callback, lot_number, prostn, lot_code, prostn.csv_prolot.table, prostn.csv_prolot.fields);});
      opts.push({sheetid: 'lot_info' , header:true});
    }
    for (var index in $scope.sumStations){      
      opts.push({sheetid: $scope.sumStations[index].name , header:true});
    }

    async.forEachOf($scope.sumStations, function (value, key, callback) {
      func_array.push(function(callback){ $scope.getCSV(callback, lot_number, value, lot_code, value.csv_1.table, value.csv_1.fields);});
    }, function (err, results) {
        if (err) console.error(err.message);        
    });

    async.parallel(func_array,
      function(err, results) {
          var name = lot_code;
          name += '.xlsx';
          console.log(name);
          alasql('SELECT INTO XLSX("' + name + '",?) FROM ?',[opts,results]);
      });
  };

  $scope.getTheData = function(lot_number, stn, lot_code){
    if (stn.csv_lot){
      async.parallel([
          function(callback){ $scope.getlotCSV(callback, lot_number, stn, lot_code, stn.csv_lot.table, stn.csv_lot.fields);},
          function(callback){ $scope.getCSV(callback, lot_number, stn, lot_code, stn.csv_1.table, stn.csv_1.fields);}
      ],
      function(err, results) {
          var name = lot_code + '_' + stn.name;
          name += '.xlsx';
          console.log(name);
          var opts = [{sheetid:'Lot_info',header:true},{sheetid:'Station_info',header:true}];
          alasql('SELECT INTO XLSX("' + name + '",?) FROM ?',[opts,results]);
      });
    }
    else if (stn.csv_prolot){
      async.parallel([
          function(callback){ $scope.getprolotCSV(callback, lot_number, stn, lot_code, stn.csv_prolot.table, stn.csv_prolot.fields);},
          function(callback){ $scope.getCSV(callback, lot_number, stn, lot_code, stn.csv_1.table, stn.csv_1.fields);}
      ],
      function(err, results) {
          var name = lot_code + '_' + stn.name;
          name += '.xlsx';
          console.log(name);
          var opts = [{sheetid:'Lot_info',header:true},{sheetid:'Station_info',header:true}];
          alasql('SELECT INTO XLSX("' + name + '",?) FROM ?',[opts,results]);
      });
    }
    else if (stn.csv_1 && !stn.csv_2){
      async.parallel([
          function(callback){ $scope.getCSV(callback, lot_number, stn, lot_code, stn.csv_1.table, stn.csv_1.fields);}
      ],
      function(err, results) {
          var name = lot_code + '_' + stn.name;
          name += '.xlsx';
          console.log(name);
          alasql('SELECT * INTO XLSX ("' + name + '", { headers:true }) FROM ?', results);
      });
    }
    else if (stn.csv_1 && stn.csv_2){
      async.parallel([
          function(callback){ $scope.getCSV(callback, lot_number, stn, lot_code, stn.csv_1.table, stn.csv_1.fields);},
          function(callback){ $scope.getCSV(callback, lot_number, stn, lot_code, stn.csv_2.table, stn.csv_2.fields);}
      ],
      function(err, results) {
          var name = lot_code + '_' + stn.name;
          name += '.xlsx';
          console.log(name);
          var opts = [{sheetid:'Summary',header:true},{sheetid:'Loins',header:true}];
          alasql('SELECT INTO XLSX("' + name + '",?) FROM ?',[opts,results]);
      });
    }
  };

  $scope.getCSV = function(callback, lot_number, stn, lot_code, table, fields){
    var query = '?lot_number=eq.' + lot_number + '&station_code=eq.' + stn.code;
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
    query += '&order=timestamp.desc';
    var func = function(response){
      $scope.list.detail = response.data;
      var newdata = alasql("SELECT " + fields + " FROM ?",[$scope.list.detail]);
      callback(null, newdata);
    };
    DatabaseServices.GetEntries(table, func, query);
  };


  $scope.getprolotCSV = function(callback, lot_number, stn, lot_code, table, fields){
    var query = '?production_lot=eq.' + lot_number;
    query += '&order=timestamp.desc';
    var func = function(response){
      $scope.list.detail = response.data;
      var newdata = alasql("SELECT " + fields + " FROM ?",[$scope.list.detail]);
      callback(null, newdata);
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
  $scope.startDate = moment().subtract(7, 'days').toDate();
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
             (item.supplier_name && item.supplier_name.toLowerCase().indexOf(searchkey) > -1) ||
             (item.country_origin && item.country_origin.toLowerCase().indexOf(searchkey) > -1) ||
             (item.species && item.species.toLowerCase().indexOf(searchkey) > -1) ||
             (item.fishing_area && item.fishing_area.toLowerCase().indexOf(searchkey) > -1) ||
             (item.sap_code && item.sap_code.toLowerCase().indexOf(searchkey) > -1) ||
             (item.msc_code && item.msc_code.toLowerCase().indexOf(searchkey) > -1) ||
             (item.ref_number && item.ref_number.toLowerCase().indexOf(searchkey) > -1) ||
             (item.ft_fa_code && item.ft_fa_code.toLowerCase().indexOf(searchkey) > -1); 
  };
})

.controller('CompleteLotCtrl', function($scope, $http, DatabaseServices, $rootScope) {

  $scope.CompleteLot = function(lot_number, station_codes){
    var patch = {'in_progress': false};
    var func = function(response){
      $rootScope.$broadcast('collection-change', {id: 'no selected'});
    };
      for (var i=0;i<station_codes.length;i++){
        var station_code=station_codes[i];
        var query = '?station_code=eq.' + station_code + '&lot_number=eq.' + lot_number;     
          DatabaseServices.PatchEntry('lotlocations',patch, query, func);
      }
  };

})

;
