'use strict';


angular.module('scanthisApp.createlotController', [])


//packingstation.html, receivingstation.html - fills in dropdown to select collection and assigns selected
.controller('CollectionTableDropDownCtrl', function($scope, $http, DatabaseServices) {

  $scope.ListCollections = function(){
    var query = '?station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.list.collection = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.collectiontable, func, query);
  };

  $scope.changeFn = function(selected){
    $scope.current.collectionid = selected;
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
    }
  });

})



//selectfromcurrentlots.html (weightstation.html)
//fills in dropdown menu with lots current as per lotlocations table
.controller('SelectLotDropDownCtrl', function($scope, $http, DatabaseServices) {

  $scope.currentlots = function(){
    var query = '?station_code=eq.' + $scope.station_code + '&in_progress=eq.true';
    var func = function(response){
      $scope.list.harvester_lot = response.data;

    };
    DatabaseServices.GetEntries('expandedlotlocations', func, query);
  };


  $scope.completedlots = function(){
    var query = '?station_code=eq.' + $scope.station_code + '&in_progress=eq.false';
    var func = function(response){
      $scope.list.old_harvester_lot = response.data;
    };
    DatabaseServices.GetEntries('expandedlotlocations', func, query);
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

  $scope.current.selected = "no selected";

  $scope.$on('collection-change', function(event, args) {
    $scope.currentlots();
    $scope.completedlots();
  });
})

//packingstation.html, receiveshipment.html, receiving_lots.html, receivingstation.html, weighstation.html
//queries whichever table is listed in config as 'collection', updates as necessary
//also has a delete function
.controller('DisplayCollectionCtrl', function($scope, $http, DatabaseServices) {

  $scope.DisplayCollectionInfo = function(){
    var func = function(response){
      if (response.data.length > 0){
        $scope.current[$scope.station_info.collectiontable] = response.data[0];
        $scope.current.itemchange = !$scope.current.itemchange;
        if ($scope.station_info.collectiontable === 'harvester_lot'){
          $scope.GetHarvester($scope.current.harvester_lot.harvester_code);
        }
      }
    };
    var query = '?' + $scope.station_info.collectionid + '=eq.' + $scope.current.collectionid;
    DatabaseServices.GetEntryNoAlert($scope.station_info.collectiontable, func, query);
  };

  $scope.GetHarvester = function(harvester_code){
    var query = '?harvester_code=eq.' + harvester_code;
    var func = function(response){
      if (response.data.length > 0){
        $scope.current.harvester = response.data[0];
        $scope.current.harvester_lot.ft_fa_code = $scope.current.harvester.ft_fa_code;
      }
      
    };
    DatabaseServices.GetEntryNoAlert('harvester', func, query);
  };

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
      var thediv = document.getElementById('scaninput');
      if(thediv){
        thediv.focus();
      }
    }
  });

  $scope.$on('collection-change', function(event, args) {

    $scope.current.collectionid = args.id;
  });

  $scope.$on('change-lot', function(event) {

    $scope.current.collectionid = null;
  });

  $scope.delete = function(){
    var id = $scope.current[$scope.station_info.collectiontable][$scope.station_info.collectionid];
    var querystring = '?' + $scope.station_info.collectionid + '=eq.' + id;
    var func = function(response){
      //$scope.current.collectionid = 'no selected';
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
    $scope.printLabel(data, labels);
  };

})


//packingstation.html, receivingstation.html, weighstation.html
//fills in list.included with 'item' table if config belonging to selected collection
.controller('DisplayItemsCtrl', function($scope, $http, DatabaseServices) {

  $scope.ListCollectionItems = function(){
    var query = '?station_code=eq.' + $scope.station_code + '&' + $scope.station_info.collectionid + '=eq.' + $scope.current.collectionid;
    var func = function(response){
      $scope.list.included = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.itemtable, func, query);
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


})



//weighstation.html
//gets totals from database
.controller('TotalsCtrl', function($scope, $http, DatabaseServices) {

  $scope.ItemTotals = function(){
    var query = '?' + $scope.station_info.collectionid + '=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.totals = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.itemtotals, func, query);
  };

  $scope.$watch('current.itemchange', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.ItemTotals();
    }
  });

  $scope.istotal = true;

})

.controller('prevStationCtrl', function($scope, $http, DatabaseServices) {

  $scope.station_code = $scope.prevStation;
})



//loadcurrentcollection.html (weighstation.html)
//gets the current lot_number from lotlocations table
.controller('GetCurrentCtrl', function($scope, $http, DatabaseServices) {
  $scope.GetCurrent = function(){
    var func = function(response){
      var station = response.data[0];
      var today = moment(new Date()).startOf('day').format();
      if(station){
        if (moment(station.in_progress_date).startOf('day').format() === today){
          $scope.current.collectionid = station.lot_number;
        }
      }
    };
    var query = '?station_code=eq.' + $scope.station_code + '&in_progress=eq.true';
    DatabaseServices.GetEntries('lotlocations', func, query);
  };

  $scope.GetCurrent();

  

})

//updates the lotlocations table
/*.controller('CompleteLotCtrl', function($scope, $injector, DatabaseServices) {

  $scope.CompleteLot = function(lot_number){
    var patch = {'in_progress': false};
    var func = function(response){
      //todo: toast - lot completed
      $scope.current.collectionid = null;
      $scope.current[$scope.station_info.collectiontable] = null;
      $scope.current.lotlistchange = !$scope.current.lotlistchange;
    };
    var query = '?station_code=eq.' + $scope.station_code + '&collectionid=eq.' + lot_number;
    var r = confirm("Are you sure you want to complete this lot?");
    if (r === true) {
      DatabaseServices.PatchEntry('lotlocations',patch, query, func);
    }     
  };

})*/


//reprint.html - get list of loins for station, reprint function
.controller('ReprintCtrl', function($scope, $injector, DatabaseServices) {

  $scope.ListAllItems = function(station_code){
    var query = '?station_code=eq.' + station_code;
    var func = function(response){
      $scope.items = response.data;
    };
    DatabaseServices.GetEntries('loin_lot', func, query);
  };

  $scope.Reprint = function(loin_number, lot_number){
    if($scope.onLabel){
      var query = '?station_code=eq.' + $scope.station_code + '&loin_number=eq.' + loin_number;
      var func = function(response){
        var data = dataCombine((response.data[0] || response.data), $scope.onLabel.qr);
        var labels = ArrayFromJson((response.data[0] || response.data), $scope.onLabel.print);
        console.log(data, labels);
        $scope.printLabel(data, labels);
      };
      DatabaseServices.GetEntries('reprint_table', func, query);
      
    }
  };

  $scope.ListAllItems($scope.station_code);

})

//selectsamedaylot.html - dropdown menu with lots from current day
.controller('LotSelectCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.ListLots = function(){
    var date = moment(new Date()).format();
    var query = '?end_date=gte.'+ date + '&processor_code=eq.' + $scope.processor;
    var func = function(response){
      $scope.list.lot = response.data;
    };
    DatabaseServices.GetEntries('lot', func, query);
  };

  $scope.ListLots();
})


.controller('BufferScrollCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.limit = 10;

  $scope.ResetLimit = function(){
    $scope.limit = 5;
  };

})




;
