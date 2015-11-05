'use strict';


angular.module('scanthisApp.itemController', [])


.controller('ScanOnlyCtrl', function($scope, $http, DatabaseServices) {


  

  /*removes an item from the database*/
  $scope.RemoveItem = function(scan_id){
    var query = '?id=eq.' + scan_id;
    var func = function(){
      removeFromArray($scope.list.included, scan_id);
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

  /*creates a new row in the database, item table*/
  $scope.DatabaseScan = function(form){
    $scope.MakeScanEntry(form);
    var func = function(response){
      $scope.list.included.push(response.data);
      Clear('scan', $scope);
    };
    if (NoMissingValues($scope.entry.scan)){
      DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
    }
    else{ alert("missing values"); }
  };


  /*fills in fields in json to submit to database*/
  $scope.MakeScanEntry = function(form){
    $scope.entry.scan.lot_number = $scope.current.collectionid;
    $scope.entry.scan.timestamp = moment(new Date()).format();
    MakeEntry(form, 'scan', $scope);
  };

  $scope.Submit = function(form){
    $scope.DatabaseScan(form);
  };

  /*switch between scanning and view summary*/
  $scope.show = function(){
    if ($scope.showSummary === false){
      $scope.showSummary = true;
      $scope.showScan = false;
      $scope.view_summary = "Back to scan";
    }
    else {
      $scope.showSummary = false;
      $scope.showScan = true;
      $scope.view_summary = "view summary";
    }
  };

  /*initialize with correct entry json object and display*/
  $scope.init = function(fields, options){
    $scope.entry.scan = {'timestamp': '', 'lot_number': '', 'station_code': $scope.station_code};
    $scope.fields = fields;
    $scope.options = options;


    for (var key in fields){
      $scope.entry.scan[key] = '';
    }
    if (options.summaryhidden === 'true'){
      InitShowSummary($scope);
    }
    else{
      $scope.showScan = true;
      $scope.showSummary = true;
    }
  };
})





.controller('LoinCtrl', function($scope, $http, DatabaseServices) {

  $scope.GetMaxLoin = function(form){
    var query = '?lot_number=eq.' + $scope.current.collectionid;
    var func = function(response){
      var num = 1;
      if (response.data.length >0){
        num = response.data[0].max_loin + 1;
      }
      $scope.MakeLoinScanEntry(form, num);
      $scope.DatabaseLoin();
    };
    DatabaseServices.GetEntries('loin_number', func, query);
  };

  /*removes an item from the database*/
  $scope.RemoveItem = function(id){
    var query = '?id=eq.' + id;
    var func = function(){
      $scope.RemoveScan(id);
    };
    DatabaseServices.RemoveEntry('loin', query, func);
  };

  $scope.RemoveScan = function(id){
    var query = '?loin_id=eq.' + id;
    var func = function(){
      $scope.ListCollectionItems('station_code');
    };
    DatabaseServices.RemoveEntry('scan', query, func);
  };

  /*creates a new row in the database, item table*/
  $scope.DatabaseLoin = function(){    
    var func = function(response){
      $scope.entry.scan.loin_id = response.data.id;
      Clear('loin', $scope);
      $scope.DatabaseScan();     
    };
    if (NoMissingValues($scope.entry.scan, 'loin_id')){
      DatabaseServices.DatabaseEntryReturn('loin', $scope.entry.loin, func);
    }
    else{ alert("missing values"); }
  };


  $scope.DatabaseScan = function(){    
    var func = function(response){
    //$scope.QRWindowOpen($scope.entry.scan.loin_id);
    Clear('scan', $scope);    
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  $scope.Submit = function(form){
   $scope.GetMaxLoin(form);
   //$scope.qrtest();
  };
  
  /*fills in fields in json to submit to database*/
  $scope.MakeLoinScanEntry = function(form, num){
    $scope.entry.loin.loin_number = num;
    $scope.entry.loin.lot_number = $scope.current.collectionid;
    $scope.entry.scan.lot_number = $scope.current.collectionid;
    $scope.entry.loin.timestamp = moment(new Date()).format();
    $scope.entry.scan.timestamp = $scope.entry.loin.timestamp;
    $scope.entry.scan.station_code = $scope.station_code;
    MakeEntry(form, 'scan', $scope);
  };

  /*switch between scanning and view summary*/
  $scope.show = function(){
    if ($scope.showSummary === false){
      $scope.showSummary = true;
      $scope.showScan = false;
      $scope.view_summary = "Back to scan";
    }
    else {
      $scope.showSummary = false;
      $scope.showScan = true;
      $scope.view_summary = "view summary";
    }
  };

  /*initialize with correct entry json object and display*/
  $scope.init = function(fields, options){
    $scope.entry.loin = {'timestamp': '', 'lot_number': '', 'loin_number':''};
    $scope.entry.scan = {'station_code':'', 'timestamp':'', 'loin_id':'', 'lot_number':''};
    $scope.fields = fields;
    $scope.options = options;

    for (var key in fields){
      $scope.entry.scan[key] = '';
    }


    if (options.summaryhidden === 'true'){
      InitShowSummary($scope);
    }
    else{
      $scope.showScan = true;
      $scope.showSummary = true;
    }
  };



})



.controller('BoxCtrl', function($scope, $http, DatabaseServices) {


  $scope.change = function(){
    var rawArray = $scope.raw.string.split("|");
    $scope.form.size = rawArray[0];
    $scope.form.grade = rawArray[1];
    $scope.form.pieces = rawArray[2];
    $scope.form.weight = rawArray[3];
    $scope.form.case_number = rawArray[4];
    $scope.form.lot_number = rawArray[5];
    $scope.form.harvester_id = rawArray[6];
    $scope.MakeBox();
  };

  $scope.ListItems = function(){
    var query = '?station_code=eq.' + $scope.station_code;
    var func = function(response){
      $scope.list.box_total = response.data;
    };
    DatabaseServices.GetEntries('box_total', func, query);
  };
  $scope.ListItems();



  $scope.MakeBoxScanEntry = function(form){
    $scope.entry.box.timestamp = moment(new Date()).format();
    $scope.entry.scan.timestamp = $scope.entry.box.timestamp;
    $scope.entry.scan.station_code = $scope.station_code;
    MakeEntry(form, 'box', $scope);
  };
  $scope.DatabaseBox = function(){    
    var func = function(response){
      $scope.entry.scan.box_id = response.data.id;
      //Clear('box', $scope);
      $scope.DatabaseScan();     
    };
    if (NoMissingValues($scope.entry.scan, 'box_id')){
      DatabaseServices.DatabaseEntryReturn('box', $scope.entry.box, func);
    }
    else{ alert("missing values"); }
  };

  $scope.DatabaseScan = function(){    
    var func = function(response){
    //Clear('scan', $scope);
    $scope.ListItems();  
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  $scope.MakeBox = function(){
    $scope.MakeBoxScanEntry($scope.form);
    $scope.DatabaseBox();
  };

  $scope.init = function(){
    $scope.entry.box = {'timestamp': '', 'lot_number': ''};
    $scope.entry.scan = {'station_code': '', 'timestamp': '', 'box_id':''};
  };


})


;

