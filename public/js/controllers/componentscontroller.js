'use strict';


angular.module('scanthisApp.createlotController', [])

// CollectionTableDropDownCtrl, SelectLotDropDownCtrl, DisplayCollectionCtrl, DisplayItemsCtrl, DisplayItemsPackingCtrl, TotalsOnceCtrl,
// TotalsWeighCtrl, ReprintCtrl, LotSelectCtrl, BufferScrollPackingCtrl, BufferScrollCtrl 


//packingstation.html - fills in dropdown to select collection and assigns selected
// Select box or shipment or lot
.controller('CollectionTableDropDownCtrl', function($scope, $http, DatabaseServices) {

  $scope.ListCollections = function(){
    var table;
    if ($scope.station_info.collectiontable === 'lot'){
      table = 'harvester_lot';
    }
    else{
      table = $scope.station_info.collectiontable;
    }
    var query;
    if (table === 'harvester_lot'){
      query = '?processor_code=eq.' + $scope.processor + '&lot_in=not.is.null';//AM2 Int. Receiving
    }
    else{
      query = '?station_code=eq.' + $scope.station_code;
    }
    if ($scope.options.incoming){
      query += "&shipping_unit_in=is.null";
    }
    query += '&order=timestamp.desc';
    var func = function(response){
      $scope.list.collection = response.data;
    };
    DatabaseServices.GetEntries(table, func, query, 'hundred');
  };

//for AM2 int. receiving, sets end_date to current day 
  $scope.changeFn = function(selected){
    if ($scope.options.p_date){
      $http.get('/server_time').then(function successCallback(response) {
        var the_date = response.data.timestamp;
        var date = moment(the_date).utcOffset(response.data.timezone).format();
        var end_date = moment.parseZone(date).endOf('day').format();
        var patch = {'end_date': end_date};
        var query = '?lot_number=eq.' + selected;
        var func = function(response){
          if (response.data.length > 0){
            $scope.current.collectionid = response.data[0].lot_number;
          }
          else{
          }
        };
        DatabaseServices.PatchEntry('lot', patch, query, func);
      }, function errorCallback(response) {
      });
    }else{
      $scope.current.collectionid = selected;
    }   
  };

  $scope.current.selected = "no selected";

  //initially load available collections (box/shipment/lot)
  $scope.$watch('station_info', function(newValue, oldValue) {
    if ($scope.station_info !== undefined){
      $scope.ListCollections();
    }
  });

  //reload dropdown list on selection/creation of new
  $scope.$watch('current.collectionid', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      $scope.current.selected = $scope.current.collectionid;
      $scope.ListCollections();
    }
  });

})

//selectfromcurrentlots.html (weightstation.html)
//fills in dropdown menu with lots current as per lotlocations table
.controller('SelectLotDropDownCtrl', function($scope, $http, DatabaseServices) {

  $scope.currentlots = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract($scope.options.selectfromcurrentlots, 'days').format();
      var query = '?end_date=gte.'+ date + '&station_code=eq.' + $scope.station_code + '&in_progress=eq.true';
      var func = function(response){
        $scope.list.harvester_lot = response.data;
      };
      DatabaseServices.GetEntries('expandedlotlocations', func, query);      
    }, function errorCallback(response) {
    });
  };

  $scope.completedlots = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract($scope.options.selectfromcurrentlots, 'days').format();
      var query = '?end_date=gte.'+ date + '&station_code=eq.' + $scope.station_code + '&in_progress=eq.false';
      var func = function(response){
        $scope.list.old_harvester_lot = response.data;
      };
      DatabaseServices.GetEntries('expandedlotlocations', func, query);      
    }, function errorCallback(response) {
    });
  };

  $scope.$watch('current.lotlistchange', function() {
    if ($scope.station_info !== undefined && $scope.current.lotlistchange !== undefined){
      $scope.currentlots();
      $scope.completedlots();
    }
  });

  $scope.changeFn = function(selected){
    $scope.current.collectionid = selected;
  };
  
  $scope.$on('collection-change', function(event, args) {
    $scope.currentlots();
    $scope.completedlots();
  });
})

//packingstation.html, receiveshipment.html, receivingstation.html, weighstation.html
//queries whichever table is listed in config as 'collection', updates as necessary
//also has a delete function
.controller('DisplayCollectionCtrl', function($scope, $http, DatabaseServices, $timeout) {

  $scope.DisplayCollectionInfo = function(){
    var table;
    if ($scope.station_info.collectiontable === 'lot'){
      if ($scope.options.lot_count){
        table = 'harvester_lot_with_count';
      }else{
        table = 'harvester_lot';
      }
    }
    else{
      table = $scope.station_info.collectiontable;
    }
    var func = function(response){

      if (response.data.length > 0){
        $scope.current[$scope.station_info.collectiontable] = response.data[0];
        $http.get('/server_time').then(function successCallback(response) {
          var the_date = response.data.timestamp;
          console.log('called');
          $scope.current.start_of_day = moment(the_date).utcOffset(response.data.timezone).startOf('day').format();
          
          $scope.current.itemchange = !$scope.current.itemchange;
          var thediv = document.getElementById('scaninput');
          if(thediv){
           $timeout(function(){thediv.focus();}, 0);
          }
        }, function errorCallback(response) {
        });
      }
     
    };
    var query = '?' + $scope.station_info.collectionid + '=eq.' + $scope.current.collectionid;
    DatabaseServices.GetEntryNoAlert(table, func, query);
  };

  //Display items triggered by this variable changing
  $scope.current.itemchange = true;

  $scope.$watch('current.collectionid', function() {
    $scope.current[$scope.station_info.collectiontable] = null;
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      if ($scope.current.collectionid === 'no selected' || $scope.current.collectionid === null){
      }
      else{
        $scope.DisplayCollectionInfo();
      }
    }
  });

  $scope.$on('collection-change', function(event, args) {
    if ($scope.current.collectionid !== args.id){
      $scope.current.collectionid = args.id;
    }   
  });

  $scope.$on('change-lot', function(event) {

    $scope.current.collectionid = null;
  });

  $scope.delete = function(){
    var id = $scope.current[$scope.station_info.collectiontable][$scope.station_info.collectionid];
    var querystring = '?' + $scope.station_info.collectionid + '=eq.' + id;
    var func = function(response){
      $scope.current.collectionid = null;
      $scope.list.collection = $scope.list.collection
      .filter(function (el) {
        return el[$scope.station_info.collectionid] !== id;
      });
    };
    DatabaseServices.RemoveEntry($scope.station_info.collectiontable, querystring, func);
  };

  $scope.MakeQR = function(){
    var data = dataCombine($scope.current[$scope.station_info.collectiontable], $scope.onLabel.qr);
    var labels = ArrayFromJson($scope.current[$scope.station_info.collectiontable], $scope.onLabel.print);
    console.log(data, labels);
    if ($scope.current[$scope.station_info.collectiontable].ft_fa_code) {
      $scope.printLabelFairTrade(data, labels);
    } else {
      $scope.printLabel(data, labels);
    }

  };
})


//weighstation.html
//fills in list.included with 'item' table if config belonging to selected collection
.controller('DisplayItemsCtrl', function($scope, $http, DatabaseServices, $timeout) {

  var datasource = {};

  datasource.get = function(index, count, success){
    index = index - ($scope.datasource.minIndex||0);
    //console.log($scope.current.start_of_day);
      var table;
      var query;
      if ($scope.station_info.itemtable === 'box' && !$scope.options.print_uuid){
        table = 'box_with_info';
      }else if ($scope.station_info.itemtable === 'box' && $scope.options.print_uuid){
        table = 'boxes_uuid';
      }
      else{
        table = $scope.station_info.itemtable;
      }
      var func = function(response){
        success(response.data);
        $scope.list.length = response.headers()['content-range'].split('/')[1];
      };

      if ($scope.current.collectionid && index>=0 && index<=($scope.list.length||0)){
        if ($scope.options.hundred_limit || $scope.options.all_items){
          query = '?station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=' + count +'&offset=' + index;
            DatabaseServices.GetEntries(table, func, query); 
        }
        else if ($scope.current.start_of_day){
          query = '?timestamp=gte.' + $scope.current.start_of_day + '&station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=' + count +'&offset=' + index;
          DatabaseServices.GetEntries(table, func, query); 
        }else{
          success([]);
        }
      }else if ($scope.current.collectionid && index>-10 && index<=($scope.list.length||0)){
        if ($scope.options.hundred_limit || $scope.options.all_items){
          query = '?station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=' + (count+index) +'&offset=0';
            DatabaseServices.GetEntries(table, func, query); 
        }
        else if ($scope.current.start_of_day){
          query = '?timestamp=gte.' + $scope.current.start_of_day + '&station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=' + (count+index) +'&offset=0';
          DatabaseServices.GetEntries(table, func, query); 
        }
        else{
          success([]);
        }
      }else{
          success([]);
      }  
  };

  $scope.getLatest = function(prep){
      var table;
      var query;
      if ($scope.station_info.itemtable === 'box' && !$scope.options.print_uuid){
        table = 'box_with_info';
      }else if ($scope.station_info.itemtable === 'box' && $scope.options.print_uuid){
        table = 'boxes_uuid';
      }
      else{
        table = $scope.station_info.itemtable;
      }
      var func = function(response){
        prep(response.data);
        $scope.list.length = response.headers()['content-range'].split('/')[1];
      };
      if ($scope.options.hundred_limit || $scope.options.all_items){
        query = '?station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=1';
        DatabaseServices.GetEntries(table, func, query); 
      }else if ($scope.current.start_of_day){
        query = '?timestamp=gte.' + $scope.current.start_of_day + '&station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=1';
        DatabaseServices.GetEntries(table, func, query); 
      }
      

  };

  $scope.datasource = datasource;

  $scope.$watch('current.itemchange', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      if ($scope.current.collectionid === 'no selected'){
        $scope.list.included = null;
      }
      else{
        $scope.ItemTotals();
      }
    }
  });


  $scope.HighlightGreen = function(){
    $timeout(function(){ $scope.current.addnew = false; }, 500);
  };

  $scope.ItemTotals = function(){
    var query = '?' + ( $scope.station_info.patchid || $scope.station_info.collectionid ) + '=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.list.totals = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.itemtotals, func, query);
  };
})

//Harsam packing and shipping, Amanda shipping stations - used for workflow of patching object into container
.controller('DisplayItemsPackingCtrl', function($scope, $http, DatabaseServices, $timeout) {

  var datasource = {};
  datasource.minIndex = 0;

  datasource.get = function(index, count, success){
    index = index - ($scope.datasource.minIndex||0);
    var table;
    if ($scope.station_info.itemtable === 'box'){
      if ($scope.options.shiplist){
        table = 'shipment_list';
      }
      else{
        table = 'box_with_info';
      } 
    }
    else{
      table = $scope.station_info.itemtable;
    }

    var func = function(response){
      success(response.data);
      $scope.list.length = response.headers()['content-range'].split('/')[1];
    };
    var query;

    if ($scope.current.collectionid && index>=0 && index<=($scope.list.length||0)){ 

      if ($scope.options.no_station){
        query = '?' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=' + count +'&offset=' + index;
        DatabaseServices.GetEntries(table, func, query); 
      }
      else if ($scope.options.all_items || $scope.options.hundred_limit){
        query = '?station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=' + count +'&offset=' + index;
        DatabaseServices.GetEntries(table, func, query); 
      }
      else if ($scope.current.start_of_day){
          query = '?timestamp=gte.' + $scope.current.start_of_day + '&station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=' + count +'&offset=' + index;
        DatabaseServices.GetEntries(table, func, query); 
      }
      else{
          success([]);
        }


    }else if ($scope.current.collectionid && index>-10 && index<=($scope.list.length||0)){


      if ($scope.options.no_station){
        query = '?' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=' + (count+index) +'&offset=0';
        DatabaseServices.GetEntries(table, func, query); 
      }
      else if ($scope.options.all_items || $scope.options.hundred_limit){
        query = '?station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=' + (count+index) +'&offset=0';
        DatabaseServices.GetEntries(table, func, query); 
      }
      else if ($scope.current.start_of_day){
          query = '?timestamp=gte.' + $scope.current.start_of_day + '&station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=' + (count+index) +'&offset=0';
        DatabaseServices.GetEntries(table, func, query); 
      }
      else{
          success([]);
        }

    }else{
      success([]);
    }  
  };

  $scope.getLatest = function(prep){
    var table;
    if ($scope.station_info.itemtable === 'box'){
      if ($scope.options.shiplist){
        table = 'shipment_list';
      }
      else{
        table = 'box_with_info';
      } 
    }
    else{
      table = $scope.station_info.itemtable;
    }
    var query;
    var func = function(response){
      prep([response.data[0]]);
      $scope.list.length = response.headers()['content-range'].split('/')[1];
    };

    if ($scope.options.no_station){
      query = '?' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=1&offset=0';
      DatabaseServices.GetEntries(table, func, query); 
    }
    else{
      query = '?station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc&limit=1&offset=0';
      DatabaseServices.GetEntries(table, func, query); 
    }

  };

  $scope.datasource = datasource;

  $scope.$watch('current.itemchange', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined && $scope.station_info.itemtable==='loin_with_info'){
      if ($scope.current.collectionid === 'no selected'){
        $scope.list.included = null;
      }
      else{
        var func = function(response){
          $scope.list.included = response.data;
        };
        var query = '?station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid;
        DatabaseServices.GetEntries('loin_with_info', func, query);
      }
    }
  });

  $scope.HighlightGreen = function(str){
    $timeout(function(){ $scope.current.addnew = false; }, 500);
  };
})

//to fill in prev station info
.controller('TotalsOnceCtrl', function($scope, $http, DatabaseServices) {

  $scope.ItemTotals = function(){
    var query = '?' + ( $scope.station_info.patchid || $scope.station_info.collectionid ) + '=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.totals = response.data;
    };
    DatabaseServices.GetEntries('totals_by_lot', func, query);
  };

  $scope.$watch('current.collectionid', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      $scope.ItemTotals();
    }
  });

  $scope.istotal = true;

})


.controller('TotalsWeighCtrl', function($scope, $http, DatabaseServices) {
  $scope.istotal = true;
})




//reprint.html - get list of loins for station, reprint function
.controller('ReprintCtrl', function($scope, $injector, DatabaseServices) {

  $scope.current.edit_box=false;
  $scope.current.reload = false;

  $scope.ListAllItems = function(){
    var query = '?station_code=eq.' + $scope.station_code + '&order=timestamp.desc';
    var func = function(response){
      $scope.items = response.data;
    };
    DatabaseServices.GetEntries('loin_with_info', func, query, 'fifty');
  };

  $scope.Reprint = function(obj, lot_number){
    if($scope.onLabel){
      var query = '?station_code=eq.' + $scope.station_code + '&loin_number=eq.' + obj.loin_number;
      var func = function(response){
        var data = dataCombine((response.data[0] || response.data), $scope.onLabel.qr);
        var labels = ArrayFromJson((response.data[0] || response.data), $scope.onLabel.print);
        console.log(data, labels);
        $scope.printLabel(data, labels);
      };
      DatabaseServices.GetEntries('loin_with_info', func, query);      
    }
  };

  $scope.ListFilteredItems = function(loin_number, int_lot_code){
    var query = '?station_code=eq.' + $scope.station_code;
    if (loin_number !== undefined && loin_number !== null && loin_number !== ''){
      query += '&loin_number=like.*' + loin_number.toUpperCase() + '*';
    }
    if (int_lot_code !== undefined && int_lot_code !== null && int_lot_code !== ''){
      query += '&internal_lot_code=like.*' + int_lot_code + '*';
    }
    query += '&order=timestamp.desc';
    var func = function(response){
      $scope.items = response.data;
      $scope.search = {};
    };
    DatabaseServices.GetEntries('loin_with_info', func, query, 'fifty');
  };

  $scope.EditLoin = function(obj){
    $scope.current.edit_box = true;
    $scope.current.collectionid = obj.loin_number;
  };

  $scope.$watch('current.reload', function(newValue, oldValue) {
    if ($scope.current.reload !== undefined){
      $scope.ListFilteredItems($scope.current.collectionid);
    }
  });



})

//selectsamedaylot.html - dropdown menu with lots from current day
.controller('LotSelectCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.ListLots = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).format();
      var query = '?end_date=gte.'+ date + '&processor_code=eq.' + $scope.processor + '&lot_in=not.is.null';
      var func = function(response){
        $scope.list.lot = response.data;
      };
      DatabaseServices.GetEntries('harvester_lot', func, query);      
    }, function errorCallback(response) {
    });
  };
  $scope.ListLots();


  $scope.ListRecentLots = function(){
    $http.get('/server_time').then(function successCallback(response) {
      var the_date = response.data.timestamp;
      var date = moment(the_date).utcOffset(response.data.timezone).subtract(30, 'days').format();
      var query = '?end_date=gte.'+ date + '&processor_code=eq.' + $scope.processor + '&lot_in=not.is.null';
      var func = function(response){
        $scope.list.recent_lot = response.data;
      };
      DatabaseServices.GetEntries('harvester_lot', func, query);      
    }, function errorCallback(response) {
    });
  };
  $scope.ListRecentLots();

})

.controller('BufferScrollCtrl', function($scope, $http, DatabaseServices, toastr, $timeout) {

  $scope.static_limit = 10;

  $scope.limit = 5;

  $scope.ResetLimit = function(){
    $scope.limit = 5;
  };

})

.controller('BufferScrollPackingCtrl', function($scope, $http, DatabaseServices, toastr, $timeout) {

  $scope.static_limit = 40;

  $scope.limit = 35;

  $scope.ResetLimit = function(){
    $scope.limit = 35;
  };

})







;
