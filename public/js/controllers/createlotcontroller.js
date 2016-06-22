'use strict';


angular.module('scanthisApp.createlotController', [])


//packingstation.html - fills in dropdown to select collection and assigns selected
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
        }//end if
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

  $scope.$watch('station_info', function(newValue, oldValue) {
    if ($scope.station_info !== undefined){
      $scope.ListCollections();
    }
  });

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
      var date = moment(the_date).utcOffset(response.data.timezone).subtract(7, 'days').format();
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
      table = 'harvester_lot';
    }
    else{
      table = $scope.station_info.collectiontable;
    }
    var func = function(response){

      if (response.data.length > 0){
        $scope.current[$scope.station_info.collectiontable] = response.data[0];
        $scope.current.itemchange = !$scope.current.itemchange;
        var thediv = document.getElementById('scaninput');
        if(thediv){
         $timeout(function(){thediv.focus();}, 0);
        }
        if ($scope.station_info.collectiontable === 'harvester_lot'){
          //$scope.GetHarvester($scope.current.harvester_lot.harvester_code);
        }

      }
    };
    var query = '?' + $scope.station_info.collectionid + '=eq.' + $scope.current.collectionid;
    DatabaseServices.GetEntryNoAlert(table, func, query);
  };

  /*$scope.GetHarvester = function(harvester_code){
    var query = '?harvester_code=eq.' + harvester_code;
    var func = function(response){
      if (response.data.length > 0){
        $scope.current.harvester = response.data[0];
        $scope.current.harvester_lot.ft_fa_code = $scope.current.harvester.ft_fa_code;
      }
      
    };
    DatabaseServices.GetEntryNoAlert('harvester', func, query);
  };*/

  //Display items triggered by this variable changing
  $scope.current.itemchange = true;

  $scope.$watch('current.collectionid', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      if ($scope.current.collectionid === 'no selected'){
        $scope.current.collectionid = null;
        $scope.current[$scope.station_info.collectiontable] = null;
        $scope.current.itemchange = !$scope.current.itemchange;
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
    else{
      $scope.DisplayCollectionInfo();
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


//packingstation.html, receivingstation.html, weighstation.html
//fills in list.included with 'item' table if config belonging to selected collection
.controller('DisplayItemsCtrl', function($scope, $http, DatabaseServices, $timeout) {

  $scope.ListCollectionItems = function(){
    var table;
    if ($scope.station_info.itemtable === 'box'){
      table = 'box_with_info';
    }
    else{
      table = $scope.station_info.itemtable;
    }
    var query = '?station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc';
    var func = function(response){
      $scope.list.included = response.data;
      $scope.list.length = response.headers()['content-range'].split('/')[1];
    };
    DatabaseServices.GetEntries(table, func, query, 'hundred');
  };

  $scope.$watch('current.itemchange', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      if ($scope.current.collectionid === 'no selected'){
        $scope.list.included = null;
      }
      else{
        $scope.ListCollectionItems();
      }
    }
  });


  $scope.HighlightGreen = function(str){
    if(str===0  && $scope.current.addnew === true){
          var tr = angular.element(document.querySelector('#item-'+ str + ($scope.itemlistconfig.station_id || '')));  
          if (tr){
            var c = 'new_item';
            tr.addClass(c);
            $timeout(function(){ tr.removeClass(c); }, 700); 
          }
    }
    $scope.current.addnew = false;
  };
})


.controller('DisplayItemsPackingCtrl', function($scope, $http, DatabaseServices, $timeout) {

  $scope.ListCollectionItems = function(){
    var table;
    if ($scope.station_info.itemtable === 'box'){
      table = 'box_with_info';
    }
    else{
      table = $scope.station_info.itemtable;
    }
    var query = '?station_code=eq.' + $scope.station_code + '&' + ($scope.station_info.patchid || $scope.station_info.collectionid) + '=eq.' + $scope.current.collectionid + '&order=timestamp.desc';
    var func = function(response){
      $scope.list.included = response.data;
      $scope.list.length = response.headers()['content-range'].split('/')[1];
    };
    DatabaseServices.GetEntries(table, func, query, 'hundred');
  };

  $scope.$watch('current.itemchange', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      if ($scope.current.collectionid === 'no selected'){
        $scope.list.included = null;
      }
      else{
        $scope.ListCollectionItems();
      }
    }
  });


  $scope.HighlightGreen = function(str){
    if(str===0  && $scope.current.addnew === true){
          var tr = angular.element(document.querySelector('#item-'+ str + ($scope.itemlistconfig.station_id || '')));  
          if (tr){
            var c = 'new_item';
            tr.addClass(c);
            $timeout(function(){ tr.removeClass(c); }, 700); 
          }
    }
    $scope.current.addnew = false;
  };
})



//weighstation.html
//gets totals from database
.controller('TotalsCtrl', function($scope, $http, DatabaseServices) {

  $scope.ItemTotals = function(){
    var query = '?' + ( $scope.station_info.patchid || $scope.station_info.collectionid ) + '=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.totals = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.itemtotals, func, query);
  };

  $scope.$watch('current.itemchange', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      $scope.ItemTotals();
    }
  });

  $scope.istotal = true;

})


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

  $scope.ItemTotals = function(){
    var query = '?' + ( $scope.station_info.patchid || $scope.station_info.collectionid ) + '=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.totals = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.itemtotals, func, query);
  };

  $scope.$watch('list.included.length', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      $scope.ItemTotals();
    }
  });

  $scope.istotal = true;

})

/*.controller('prevStationCtrl', function($scope, $http, DatabaseServices) {

  $scope.station_code = $scope.prevStation;
})*/




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
  //$scope.ListAllItems();

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



.controller('ThisfishLabelCtrl', function($scope, $http, DatabaseServices, toastr) {


  $scope.tableconfig = 
  { id: 2,    
    cssclass: "fill", 
    headers: ["Product Type", "Thisfish Code"], 
    fields: ["product,product_type", "tf_code"], 
  };

  $scope.dropdownconfig = 
  { id: 0, 
    title: "Search Labels", 
    limit: "5",
    order: "-timestamp", 
    arg: "label", 
    searchfield: "label", 
    delimeter: '-',
    fields: ["codes"]
  };



  $scope.ListProducts = function(){
    var query = '?traceable=eq.true';
    var func = function(response){
      $scope.list.product = response.data;
      $scope.availableProducts = response.data;
    };
    DatabaseServices.GetEntries('product', func, query);
  };

  $scope.ListProducts();


  $scope.ListLabels = function(){
    var query = '';
    var func = function(response){
      $scope.list.label = response.data;
    };
    DatabaseServices.GetEntries('group_codes', func, query);
  };

  $scope.ListLabels();

  $scope.selectedProducts = [];


  $scope.GetCodes = function(label){
    var query = "?product_code=is.null&order=tf_code";
    var func = function(response){
      var tf_list = response.data;
      var last = false;
      $scope.selectedProducts.forEach(
        function(el, index){
          if (index === $scope.selectedProducts.length-1){
            last = true;
          }
          var nextcode = tf_list[index].tf_code;
          $scope.assignCode(el.product_code, nextcode, label, last);
        }
      );
    };
    DatabaseServices.GetEntries('thisfish', func, query);
  };

  $scope.assignCode = function(product_code, tf_code, label, last){
    var today = moment(new Date()).format();
    var query = '?tf_code=eq.' + tf_code;
    var func = function(response){
      if (last === true){
        $scope.ShowCodes(label);
      }      
    };
    var patch = {'product_code': product_code, 'label':label, 'timestamp': today};
    DatabaseServices.PatchEntry('thisfish',patch, query, func);
  };

  $scope.ShowCodes = function(label){
    var query = '?label=eq.' + label + '&select=lot_number, tf_code, timestamp, product_code, product{*}';
    var func = function(response){
      $scope.list.codes = response.data;
      $scope.current.tf_group = response.data[0];
      $scope.ListLabels();
      $scope.moveAll($scope.selectedProducts,$scope.availableProducts);
      $scope.label = null;
    };
    DatabaseServices.GetEntries('thisfish', func, query);
      };

  $scope.moveItem = function(item, from, to) {

      var idx=from.indexOf(item);
      if (idx != -1) {
          from.splice(idx, 1);
          to.push(item);      
      }
  };
  $scope.moveAll = function(from, to) {

      angular.forEach(from, function(item) {
          to.push(item);
      });
      from.length = 0;
  };            



})

.controller('BufferScrollCtrl', function($scope, $http, DatabaseServices, toastr, $timeout) {

  $scope.limit = 5;

  $scope.ResetLimit = function(){
    $scope.limit = 5;
  };

})





;
