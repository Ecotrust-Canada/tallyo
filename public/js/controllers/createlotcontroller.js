'use strict';


angular.module('scanthisApp.createlotController', [])


/*
 * Fills in the list for a drop-down menu to select current collection
 * Finds collection objects which match station_code -> view recent objects created at current station
 * Selected item will be stored as $scope.current.collectionid
 * Table and primary key field is determined by station
 */
.controller('SelectDropDownCtrl', function($scope, $http, DatabaseServices) {

  $scope.ListCollections = function(){
    var query = '?station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.list[$scope.station_info.collectiontable] = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.collectiontable, func, query);
  };

  $scope.$watch('station_info', function(newValue, oldValue) {
    if ($scope.station_info !== undefined){
      $scope.ListCollections();
    }
  });

})

/*
 * Fills in dropdown menu for selection current lot
 * lot_number gets saved as $scope.current.collectionid
 * selects lot which have a scan object at a first station and have not gotten to a second station
 */
.controller('SelectLotDropDownCtrl', function($scope, $http, DatabaseServices) {

  $scope.ListCollections = function(station1, station2){
    var query = '?stations=like.*' + station1 + '*&stations=not.like.*' + station2 + '*';
    var func = function(response){
      $scope.list.harvester_lot = response.data;
    };
    DatabaseServices.GetEntries('select_lot', func, query);
  };

  $scope.init = function(station1, station2){
    $scope.$watch('station_info', function(newValue, oldValue) {
      if ($scope.station_info !== undefined){
        $scope.ListCollections(station1, station2);
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

  //Display items trigered by this variable changing
  $scope.current.itemchange = true;

  $scope.$watch('current.collectionid', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.DisplayCollectionInfo();
    }
  });

})

/*
 * Loads list of all included items in a collection
 * stores as $scope.list.included
 * table specified in station
 */
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
      $scope.ListCollectionItems();
    }
  });

})



/*
 * This displays total/summary information about items in a collection
 * table specified for station
 * stores as list.totals
 */
.controller('TotalsCtrl', function($scope, $http, DatabaseServices) {

  $scope.ItemTotals = function(){
    var query = '?' + $scope.station_info.collectionid + '=eq.' + $scope.current.collectionid + '&station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.list.totals = response.data;
    };
    DatabaseServices.GetEntries($scope.station_info.itemtotals, func, query);
  };

  $scope.$watch('current.itemchange', function() {
    if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
      $scope.ItemTotals();
    }
  });

})


/*
 * Gets the id of collection table from station_table 
 * collectionid is set in database when set on different page
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


/*
 * Listing all loins for lot in order to reprint labels
 */
.controller('ReprintCtrl', function($scope, $injector, DatabaseServices) {

  $scope.ListAllItems = function(station_code){
      var query = '?station_code=eq.' + station_code;
      var func = function(response){
        $scope.items = response.data;
      };
      //TODO: create database view
      DatabaseServices.GetEntries('loin_lot', func, query);
    };

  $scope.Reprint = function(loin_id){
    //TODO: write this function
  };

  $scope.ListAllItems($scope.station_code);

})
;
