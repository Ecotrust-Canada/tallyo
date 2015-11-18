'use strict';


angular.module('scanthisApp.packingController', [])


.controller('PackingCtrl', function($scope, $http, DatabaseServices) {

  /*put an object in a container if the id matches an object. alerts to overwrite if in another*/
  $scope.PutObjInContainer = function(id){
    var func = function(response){
      //if the object is in another collection
      var itemcollection = response.data[0][$scope.station_info.collectionid];
      if (itemcollection && itemcollection !== $scope.current.collectionid){
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
        alert("already added");
        $scope.obj_id = null; //this is the ng-model for the input form
      }
      else{
        $scope.PatchObjWithContainer(id);
      }      
    };
    var query = '?' + $scope.station_info.itemid + '=eq.' + id;
    if ($scope.current.collectionid){
      DatabaseServices.GetEntry($scope.station_info.patchtable, func, query);
    }
    else
    {
      alert("please select or create collection");
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
      $scope.MakeScan(id);
    };
    var patch = {};
    patch[$scope.station_info.collectionid] = $scope.current.collectionid;
    var query = '?' + $scope.station_info.itemid + '=eq.' + id;   
    DatabaseServices.PatchEntry($scope.station_info.patchtable, patch, query, func);
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

.controller('CalculateBoxCtrl', function($scope, $http, DatabaseServices) {
  $scope.CalcBox = function(){
    var lot_num = GetBoxLotNumber($scope.list.included);
    $scope.GetHarvester(lot_num);
  };

  $scope.GetHarvester = function(lot_num){
    var func = function(response){
      var harvester_code = response.data[0].harvester_code;
      var box_weight = CalculateBoxWeight($scope.list.included);
      var num = $scope.list.included.length;
      $scope.PatchBoxWithWeightLot(box_weight, lot_num, num, harvester_code);
    };
    var query = '?lot_number=eq.' + lot_num;
    DatabaseServices.GetEntry('harvester_lot', func, query);
  };

    /*adds final info to box*/
  $scope.PatchBoxWithWeightLot = function(box_weight, lot_num, num, harvester_code){
    var func = function(response){
      $scope.current[$scope.station_info.collectiontable] = response.data[0];
    };
    var patch = {'weight': box_weight, 'lot_number': lot_num, 'pieces': num, 'harvester_code': harvester_code};
    var query = '?box_number=eq.' + $scope.current.collectionid;
    DatabaseServices.PatchEntry('box', patch, query, func);
  }; 

})




.controller('BoxLabelCtrl', function($scope, $http, DatabaseServices) {

  $scope.BoxQR = function(){
    var stringarray = ObjSubset($scope.current.box, ["box_number", "size", "grade", "pieces", "weight", "case_number", "lot_number", "harvester_code"]);
    var qrstring = QRCombine(stringarray);
    $scope.printDiv(qrstring);
  };


});
