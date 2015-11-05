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
 * Displays information about the collection and the list of items
 * queryOn is station_code or stage_id
 * Tables and primary key field are determined by station
 * Collection and Item tables often views (eg. harvester_lot & loin_scan)
 */
.controller('DisplayCollectionCtrl', function($scope, $http, DatabaseServices) {

  $scope.ListCollectionItems = function(queryOn){
    var query = '';
    if (queryOn !== undefined){
      query = '?' + queryOn + '=eq.' + $scope[queryOn] + '&' + $scope.station_info.itemquery + '=eq.' + $scope.current.collectionid;
    }
    else query = '?' + $scope.station_info.itemquery + '=eq.' + $scope.current.collectionid;
    var func = function(response){
      $scope.list.included = [];
      for (var i in response.data){
        $scope.list.included.push(response.data[i]);
      }
    };
    DatabaseServices.GetEntries($scope.station_info.itemtable, func, query);
  };


  //this is specifically for harsam station 2
  $scope.$watch('entry.scan.loin_id', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      $scope.ListCollectionItems('station_code');
    }
  });


  $scope.DisplayCollectionInfo = function(queryOn){
    var func = function(response){
      $scope.current[$scope.station_info.collectiontable] = response.data[0];
      $scope.ListCollectionItems(queryOn);
    };
    var query = '?' + $scope.station_info.collectionid + '=eq.' + $scope.current.collectionid;
    DatabaseServices.GetEntryNoAlert($scope.station_info.collectiontable, func, query);
  };

  $scope.init = function(queryOn){
    $scope.$watch('current.collectionid', function() {
      if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
        $scope.DisplayCollectionInfo(queryOn);
      }
    });
    $scope.$watch('station_info', function() {
      if ($scope.station_info !== undefined && $scope.current.collectionid !== undefined){
        $scope.DisplayCollectionInfo(queryOn);
      }
    });
  };
})


/*
 * Specifically gets the scan Totals for HarSam stations 1 & 2
 * Will need to abstract if other stations have 'totals' views
 */
.controller('TotalsCtrl', function($scope, $http, DatabaseServices) {

  $scope.ItemTotals = function(lot_number, station_code){
    var query = '?lot_number=eq.' + lot_number + '&station_code=eq.' + station_code;
    var func = function(response){
      $scope.list.totals = response.data;
    };
    DatabaseServices.GetEntries('scan_total', func, query);
  };

  $scope.$watch('list.included.length', function(newValue, oldValue) {
    if ($scope.current.collectionid !== undefined){
      $scope.ItemTotals($scope.current.collectionid, $scope.station_code);
    }
  });

})


/*
 * This gets the lot which is stored as current for the stage
 * Might Abstract some of this later
 */
.controller('CurrentCtrl', function($scope, $http, DatabaseServices) {
  $scope.GetCurrentLot = function(){
    var func = function(response){
      $scope.current.collectionid = response.data[0].current_lot_number;
    };
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.GetEntries('stage', func, query);
  };

  $scope.GetCurrentLot();

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


.controller('SubmitSetCurrentCtrl', function($scope, $http, DatabaseServices) {

  /*submits the form to the database*/
    $scope.ToDatabase = function(){
      var func = function(response){
        $scope.form = ClearFormToDefault($scope.form, $scope.formarray);
        var thedata = response.data;
        
        //If I add a drop-down then will need this - if statement, I guess
        //$scope.list[$scope.table].push(thedata);

        //not sure where this shortcut is needed or not now..
        //$scope.current[$scope.table] = thedata;

        $scope.list.included = [];
        $scope.StationCurrent(thedata[$scope.station_info.collectionid]);
      };
      if (NotEmpty($scope.form)){
        DatabaseServices.DatabaseEntryReturn($scope.table, $scope.entry[$scope.table], func);
      }
      else{ alert("empty form"); }  
    };

    $scope.StationCurrent = function(id){
      var patch = {'current_collectionid': id};
      var query = '?code=eq.' + $scope.station_code;
      var func = function(response){
        $scope.current.collectionid = id;
      };
      DatabaseServices.PatchEntry('station', patch, query, func);
    };

    /*fills in entry json obj from form, sends to database*/
    $scope.Submit = function(form){
      if ($scope.entry[$scope.table].timestamp === ''){$scope.entry[$scope.table].timestamp = moment(new Date()).format();}
      if ($scope.entry[$scope.table].best_before_date === '') {$scope.entry[$scope.table].best_before_date = moment(new Date()).add(2, 'years').format();}
      MakeEntry(form, $scope.table, $scope);
      $scope.ToDatabase();
    };

})




//Most of this stuff is already written elsewhere I think

.controller('StartNewLotCtrl', function($scope, $http, DatabaseServices, $window) {


  $scope.StartNewLot = function(){
    $scope.current.supplier_id = null;
    $scope.entry.lot = {};
    var date = new Date();
    $scope.entry.lot.lot_number = createLotNum(scope.station_code, date);
    $scope.entry.lot.timestamp = moment(new Date()).format();
    $scope.entry.lot.station_code = $scope.station_code;

    var func = function(response){
      $scope.current.lot_number = response.data.lot_number;
      $scope.current.lot = response.data;
    };
    DatabaseServices.DatabaseEntryReturn('lot', $scope.entry.lot, func);
  };


  $scope.ScanBox = function(box_id){
    var func = function(response){
      if (response.data.length > 0){
        console.log('scanned already');
      }
      else{
        $scope.BoxToLot(box_id);
      }
    };
    var query = '?station_code=eq.' + $scope.station_code + '&box_id=eq.' + box_id;
    DatabaseServices.GetEntry('scan', func, query);
  };

  $scope.BoxToLot = function(box_id){
    var func = function(response){

      var sup = response.data[0].supplier_id;
      if (!$scope.current.supplier_id){
        $scope.current.supplier_id = sup;
        $scope.MakeScan(box_id);
      }
      else if (sup === $scope.current.supplier_id){
        $scope.MakeScan(box_id);
      }
      else {
        alert('new supplier, please create new lot');
      }
    };
    var query = '?id=eq.' + box_id;
    DatabaseServices.GetEntry('box', func, query);
  };

  $scope.MakeScan = function(box_id){
    $scope.entry.scan = {};
    $scope.entry.scan.timestamp = moment(new Date()).format();
    $scope.entry.scan.station_code = $scope.station_code;
    $scope.entry.scan.box_id = box_id;
    $scope.entry.scan.lot_number = $scope.current.lot_number;
    $scope.DatabaseScan();
  };

  $scope.ListItems = function(){
    var query = '?station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.list.box_total = response.data;
    };
    DatabaseServices.GetEntries('box_total', func, query);
  };
  $scope.ListItems();

  $scope.DatabaseScan = function(){    
    var func = function(response){
    Clear('scan', $scope);
    $scope.ListItems();  
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };





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
