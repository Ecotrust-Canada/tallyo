'use strict';


angular.module('scanthisApp.packingController', [])


.controller('PackingCtrl', function($scope, $http, DatabaseServices, toastr) {

  /*put an object in a container if the id matches an object. alerts to overwrite if in another*/
  $scope.PutObjInContainer = function(raw_id){
    if (!raw_id) {
      toastr.error('please scan a code');
    }

    var id_array = raw_id.split("/");
    var id = id_array[0];

    var func = function(response){
      $scope.current.patchitem = response.data[0];
      //if the object is in another collection
      var itemcollection = response.data[0][$scope.station_info.collectionid];
      if (itemcollection && itemcollection !== $scope.current.collectionid  && itemcollection.substring(2,5) === $scope.processor){
        var overwrite = confirm("overwrite from previous?");
        if (overwrite === true){
          $scope.PatchObjWithContainer(id);
        }
        else{
          $scope.obj_id = null; //this is the ng-model for the input form
        }
      }
      //if it is already in current collection
      else if (itemcollection === $scope.current.collectionid){
        toastr.warning('already added');
        $scope.obj_id = null; //this is the ng-model for the input form
      }
      else{
        $scope.PatchObjWithContainer(id);
      }      
    };

    var onErr = function() {
      toastr.error('invalid object'); // show failure toast.
    };

    var query = '?' + $scope.station_info.itemid + '=eq.' + id;
    if ($scope.current.collectionid){
      DatabaseServices.GetEntry($scope.station_info.patchtable, func, query, onErr);
    }
    else
    {
      toastr.error("please select or create collection");
    }
  };
  $scope.MakeScan = function(id){
    $scope.entry.scan = {"station_code": $scope.station_code,};
    $scope.entry.scan[$scope.station_info.itemid] = id;
    $scope.entry.scan.timestamp = moment(new Date()).format();
    $scope.entry.scan[$scope.station_info.collectionid] = $scope.current.collectionid;
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    DatabaseServices.DatabaseEntryReturn('scan', $scope.entry.scan, func);
  };

  /*writes the foreignkey of the object, adds object to list*/
  $scope.PatchObjWithContainer = function(id){

    var func = function(response){
      toastr.success('added'); // show success toast.
      $scope.MakeScan(id);

    };
    var onErr = function(){
      toastr.error('invalid object'); // show failure toast.
    };

    var patch = {};
    patch[$scope.station_info.collectionid] = $scope.current.collectionid;
    var query = '?' + $scope.station_info.itemid + '=eq.' + id;   
    DatabaseServices.PatchEntry($scope.station_info.patchtable, patch, query, func, onErr);
  };  


  $scope.MakeQR = function(){
    var data = dataCombine($scope.current[$scope.station_info.collectiontable], $scope.onLabel.qr);
    var labels = ArrayFromJson($scope.current[$scope.station_info.collectiontable], $scope.onLabel.print);
    console.log(data, labels);
    $scope.printLabel(data, labels);
  };

  $scope.Complete = function(){
    if ($scope.onLabel){
      $scope.MakeQR();
    }
    $scope.current.selected = 'no selected';
    $scope.current.collectionid = 'no selected';
  };
})

.controller('RemovePatchCtrl', function($scope, $http, DatabaseServices) {
  
  $scope.PatchObjRemoveContainer = function(id){
    var func = function(response){
      $scope.current.itemchange = !$scope.current.itemchange;
    };
    var patch = {};
    patch[$scope.station_info.collectionid] = null;
    var query = '?' + $scope.station_info.itemid + '=eq.' + id;
    DatabaseServices.PatchEntry($scope.station_info.patchtable, patch, query, func);
  };

})

.controller('HighlightScanCtrl', function($scope, $http, DatabaseServices) {
  $scope.$watch('current.collectionid', function() {
    var scaninput = document.getElementById('scaninput');
    scaninput.focus();
  });
})

.controller('CalculateBoxCtrl', function($scope, $http, DatabaseServices) {
  $scope.CalcBox = function(){
    var lot_num = GetBoxLotNumber($scope.list.included);
    if (lot_num !== undefined){
      $scope.GetHarvester(lot_num);
    }
    else{
      var harvester_code = '';
      var box_weight = CalculateBoxWeight($scope.list.included);
      var num = 0;
      $scope.PatchBoxWithWeightLot(box_weight, lot_num, num, harvester_code);
    }
  };

  $scope.GetHarvester = function(lot_num){
    var func = function(response){
      var internal_lot_code = response.data[0].internal_lot_code;
      var harvester_code = response.data[0].harvester_code;
      var box_weight = CalculateBoxWeight($scope.list.included);
      var num = $scope.list.included.length;
      $scope.PatchBoxWithWeightLot(box_weight, lot_num, num, harvester_code, internal_lot_code);
    };
    var query = '?lot_number=eq.' + lot_num;
    DatabaseServices.GetEntry('harvester_lot', func, query);
  };

    /*adds final info to box*/
  $scope.PatchBoxWithWeightLot = function(box_weight, lot_num, num, harvester_code, internal_lot_code){
    var func = function(response){
      $scope.current[$scope.station_info.collectiontable] = response.data[0];
    };
    var patch = {'weight': box_weight, 'lot_number': lot_num, 'pieces': num, 'harvester_code': harvester_code, 'internal_lot_code': internal_lot_code};
    var query = '?box_number=eq.' + $scope.current.collectionid;
    DatabaseServices.PatchEntry('box', patch, query, func);
  }; 

  $scope.$watch('list.included', function() {
    if ($scope.list.included !== undefined && $scope.list.included !== null){
      $scope.CalcBox();
    }
  });

})

.controller('HarvesterBoxCtrl', function($scope, $http, DatabaseServices, toastr) { 
  $scope.harvesterArray = [];
  $scope.collectionid = '';

  $scope.CheckHarvester = function(harvester){
    if(harvester){
      if ($scope.harvesterArray.length === 0){
        $scope.harvesterArray.push(harvester);
      }
      else if ($scope.harvesterArray.indexOf(harvester) !== -1){
      }
      else{
        $scope.harvesterArray.push(harvester);
        toastr.error('Warning: Mixing Harvesters in Lot');
      }
    }      
  };

  $scope.$watch('list.included', function() {
    if($scope.current.collectionid !== $scope.collectionid){
      $scope.collectionid = $scope.current.collectionid;
      var all = fjs.pluck('harvester_code', $scope.list.included);
      var unique = fjs.nub(function (arg1, arg2) {
        return arg1 === arg2;
      });
      $scope.harvesterArray = unique(all);
    }else{
      if ($scope.current.patchitem){
        if ($scope.current.patchitem.harvester_code){
          $scope.CheckHarvester($scope.current.patchitem.harvester_code);        
        }
      }
    }    
  });
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
        $scope.raw.string = null;
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

