'use strict';


angular.module('scanthisApp.createlotController', [])


/*
 * Fills in the list for a drop-down menu to select correct collection
 * Selected item will be stored as $scope.current.collectionid
 * queryOn is station_code or stage_id
 * Table and primary key field is determined by station
 */
.controller('SelectDropDownCtrl', function($scope, $http, DatabaseServices) {

  $scope.ListCollections = function(queryOn){
    var query = '';
    if (queryOn !== undefined){
      query = '?' + queryOn + '=eq.' + $scope[queryOn];
    }
    else query = '';
    var func = function(response){
      $scope.list[$scope.station_info.collectiontable] = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.collectiontable, func, query);
  };

  $scope.init = function(queryOn){
    $scope.$watch('station_info', function(newValue, oldValue) {
      if ($scope.station_info !== undefined){
        $scope.ListCollections(queryOn);
      }
    });
  };

})

/*
 * Displays information about the collection
 * Tables and primary key field are determined by station
 */
.controller('DisplayCollectionCtrl', function($scope, $http, DatabaseServices) {

  $scope.DisplayCollectionInfo = function(){
    var func = function(response){
      $scope.current[$scope.station_info.collectiontable] = response.data[0];
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    var query = '?' + $scope.station_info.collectionid + '=eq.' + $scope.current.collectionid;
    DatabaseServices.GetEntryNoAlert($scope.station_info.collectiontable, func, query);
  };

  $scope.current.itemchange = true;

  $scope.$watch('current.collectionid', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.DisplayCollectionInfo();
    }
  });
  $scope.$watch('station_info', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.DisplayCollectionInfo();
    }
  });

})


.controller('DisplayItemsCtrl', function($scope, $http, DatabaseServices) {

  $scope.ListCollectionItems = function(){
    var query = '?station_code=eq.' + $scope.station_code + '&' + $scope.station_info.itemquery + '=eq.' + $scope.current.collectionid;
    var func = function(response){
      $scope.list.included = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.itemtable, func, query);
  };

  $scope.$watch('current.itemchange', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      $scope.ListCollectionItems();
    }
  });

  $scope.$watch('current.collectionid', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.ListCollectionItems();
    }
  });


  //this is specifically for harsam station 2
  $scope.$watch('entry.scan.loin_id', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      $scope.ListCollectionItems('station_code');
    }
  });

})



/*
 * Summary information for Scans
 */

.controller('TotalsCtrl', function($scope, $http, DatabaseServices) {

  $scope.ItemTotals = function(){
    var query = '?' + $scope.station_info.itemquery + '=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.list.totals = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.itemtotals, func, query);
  };

  $scope.$watch('current.collectionid', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.ItemTotals();
    }
  });

  $scope.$watch('list.included.length', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      $scope.ItemTotals();
    }
  });

})


/*
 * Gets the id of collection table given station
 */
.controller('GetCurrentCtrl', function($scope, $http, DatabaseServices) {
  $scope.GetCurrent = function(){
    var func = function(response){
      $scope.current.collectionid = response.data[0].current_collectionid;
    };
    var query = '?code=eq.' + $scope.station_code;
    DatabaseServices.GetEntries('station', func, query);
  };

  $scope.GetCurrent();

})







.controller('ReprintCtrl', function($scope, $injector, DatabaseServices) {

  $scope.ListAllItems = function(station_code){
      var query = '?station_code=eq.' + station_code;
      var func = function(response){
        $scope.items = response.data;
        for (var i=0;i<$scope.items.length;i++){
          $scope.items[i].internal_lot_code = $scope.items[i].internal_lot_code ? $scope.items[i].internal_lot_code : $scope.items[i].lot_number;
        }
      };
      DatabaseServices.GetEntries('loin_lot', func, query);
    };

  $scope.ListAllItems($scope.station_code);        
})




.controller('QRCtrl', function( $scope) {
  $scope.foo = window.aString;
})

;
