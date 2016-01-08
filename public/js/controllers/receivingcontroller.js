'use strict';


angular.module('scanthisApp.receivingController', [])


.controller('QRScanCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.form = {};

  $scope.readQR = function(){
    var rawArray = $scope.raw.string.split("/");
    for (var i=0;i<$scope.valuesarray.length;i++){
      $scope.form[$scope.valuesarray[i]] = rawArray[i];
    }
    $scope.MakeItemFromQR();
  };



  $scope.MakeItemScanEntry = function(form){
    var date = moment(new Date()).format();
    $scope.entry.scan = {};
    $scope.entry[$scope.station_info.itemtable] = {};

    $scope.entry[$scope.station_info.itemtable].timestamp = date;
    $scope.entry[$scope.station_info.itemtable].station_code = $scope.station_code;
    $scope.entry[$scope.station_info.itemtable][$scope.station_info.collectionid] = $scope.current.collectionid;
    
    $scope.entry.scan.timestamp = date;
    $scope.entry.scan.station_code = $scope.station_code;
    MakeEntry(form, $scope.station_info.itemtable, $scope);
  };
  $scope.DatabaseItem = function(){    
    var func = function(response){
      $scope.entry.scan[$scope.station_info.itemid] = response.data[$scope.station_info.itemid];
      $scope.DatabaseScan();
      $scope.raw.string = null;
      toastr.success("added");     
    };
    if (NoMissingValues($scope.entry.scan, $scope.station_info.itemid)){
      DatabaseServices.DatabaseEntryReturn($scope.station_info.itemtable, $scope.entry[$scope.station_info.itemtable], func);
    }
    else{ toastr.error("missing values"); }
  };

  $scope.DatabaseScan = function(){    
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  $scope.MakeItemFromQR = function(){
    if ($scope.current.collectionid){
      var func = function(response){
        if (response.data.length >0){
          $scope.raw.string = null;
          toastr.warning("already exists");
        }
        else{
          $scope.MakeItemScanEntry($scope.form);
          $scope.DatabaseItem();
        }
      };
      var query = '?' + $scope.station_info.itemid + '=eq.' + $scope.form[$scope.station_info.itemid] + '&station_code=eq.' + $scope.station_code;
      DatabaseServices.GetEntries($scope.station_info.itemtable, func, query);
    }
    else{
      $scope.raw.string = null; 
      toastr.error("select Collection");
    }
  };

})

.controller('RemoveItemCtrl', function($scope, $http, DatabaseServices) {
  $scope.RemoveItem = function(id){
    var query = '?' + $scope.station_info.itemid + '=eq.' + id;
    var func = function(){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.RemoveEntry($scope.station_info.itemtable, query, func);
  };

})


.controller('AddtoTableCtrl', function($scope, $http, DatabaseServices, toastr) {
  var table = $scope.tableinform;

  $scope.form = {};
  $scope.entry[table] = {};
  $scope.formchange = true;


  var AddtoList = function(response){
    var thedata = response.data;
    if ($scope.list[table] !== undefined){
      $scope.list[table].push(thedata);
      toastr.success("added");
    }    
  };

  //database entry
  $scope.ToDatabase = function(responsefunction){
    var func = function(response){
      $scope.formchange = !$scope.formchange;
      responsefunction(response);
    };
    if (NotEmpty($scope.form)){
      DatabaseServices.DatabaseEntryReturn(table, $scope.entry[table], func);
    }
    else{ toastr.error("empty form"); }
  };

  //fills out entry from form
  $scope.Submit = function(form, responsefunction){
    if (table === 'product'){
      $scope.entry.product.product_code = ($scope.form.sap_item_code ? $scope.form.sap_item_code : createProdCode(new Date()));
      MakeEntry(form, 'product', $scope);
      $scope.entry.product.best_before = ($scope.form.best_before ? moment.duration($scope.form.best_before, 'years') : moment.duration(1, 'years'));
    }
    else{
      MakeEntry(form, table, $scope);
    }
    $scope.ToDatabase(responsefunction);
  };

  $scope.SubmitAddtoList = function(form){
    $scope.Submit(form, AddtoList);
  };

})


.controller('LotSelectCtrl', function($scope, $http, DatabaseServices, toastr) {

  $scope.ListLots = function(){
    var query = '?end_date=gte.'+ moment(new Date()).format();
    var func = function(response){
      $scope.list.lot = response.data;
    };
    DatabaseServices.GetEntries('lot', func, query);
  };

  $scope.ListLots();
})


.controller('AddInventoryCtrl', function($scope, $http, DatabaseServices, toastr) {


  $scope.entry.scan = {};

  $scope.ScanIn = function(){
    if (!$scope.raw.string) {
      toastr.error('please scan a code');
    }
    else{
      var rawArray = $scope.raw.string.split("/");
      var id = rawArray[0];

      var func = function(response){
        $scope.CheckScan(id);
      };
      var onErr = function() {
        toastr.error('invalid object'); // show failure toast.
      };
      var query = '?' + $scope.station_info.itemid + '=eq.' + id;
      DatabaseServices.GetEntry($scope.station_info.patchtable, func, query, onErr);
      } 
  };
 

  $scope.CheckScan = function(id){
    var func = function(response){
      if (response.data.length >0){
        $scope.raw.string = null;
        toastr.warning("already exists");
      }
      else{
        $scope.entry.scan[$scope.station_info.itemid] = id;
        $scope.entry.scan.station_code = $scope.station_code;
        $scope.entry.scan.timestamp = moment(new Date()).format();
        $scope.DatabaseScan();
      }
    };
    var query = '?' + $scope.station_info.itemid + '=eq.' + id + '&station_code=eq.' + $scope.station_code;
    DatabaseServices.GetEntries('scan', func, query);
  };



  $scope.DatabaseScan = function(){    
    var func = function(response){
      console.log(response.data);
      $scope.current.itemchange = !$scope.current.itemchange;
      toastr.success('added');
      $scope.raw.string = null;
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };


})



;
