'use strict';


angular.module('scanthisApp.packingController', [])


.controller('PackingCtrl', function($scope, $http, DatabaseServices) {

  $scope.init = function(table, obj, displayobj, scanobj){
    var fk = table + '_id';
    
    /*put an object in a container if the id matches an object. alerts to overwrite if in another*/
    $scope.PutObjInContainer = function(id){
      var func = function(response){
        if (response.data[0][fk] && response.data[0][fk] != $scope.current[table].id){
          var overwrite = confirm("overwrite from previous?");
          if (overwrite === true){
            $scope.PatchObjWithContainer(id);
          }
          else{
            $scope.obj_id = null;
          }
        }
        else if (response.data[0][fk] == $scope.current[table].id){
          alert("already added");
          $scope.obj_id = null;
        }
        else{
          $scope.PatchObjWithContainer(id);
        }      
      };
      var query = '?id=eq.' + id;
      DatabaseServices.GetEntry(obj, func, query);
    };

    $scope.MakeScan = function(id){
      $scope.entry.scan = {"station_code": $scope.station_code,};
      $scope.entry.scan[scanobj] = id;
      $scope.entry.scan.timestamp = moment(new Date()).format();
      $scope.entry.scan[$scope.station_info.itemquery] = $scope.current.collectionid;
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
      patch[fk] = $scope.current[table].id;
      var query = '?id=eq.' + id;    
      if (id && idNotInArray($scope.list.included, id)){
        DatabaseServices.PatchEntry(obj, patch, query, func);
      }
    };

    /*remove an object from a acontainer*/
    $scope.PatchObjRemoveContainer = function(id){
      var func = function(response){
        $scope.list.included = removeFromArray($scope.list.included, id);
      };
      var patch = {};
      patch[fk] = null;
      var query = '?id=eq.' + id;
      DatabaseServices.PatchEntry(obj, patch, query, func);
    };     
  };
})

.controller('RemovePatchCtrl', function($scope, $http, DatabaseServices) {
  
  $scope.init = function(table, obj, displayobj, scanobj){
    var fk = table + '_id';

    $scope.PatchObjRemoveContainer = function(id){
      var func = function(response){
        $scope.current.itemchange = !$scope.current.itemchange;
      };
      var patch = {};
      patch[fk] = null;
      var query = '?id=eq.' + id;
      DatabaseServices.PatchEntry(obj, patch, query, func);
    };
  };


})

.controller('CalculateBoxCtrl', function($scope, $http, DatabaseServices) {
  $scope.CalcBox = function(){
    var lot_num = GetBoxLotNumber($scope.list.included);
    $scope.GetHarvester(lot_num);
  };

  $scope.GetHarvester = function(lot_num){
    var func = function(response){
      var harvester_id = response.data[0].harvester_id;
      var box_weight = CalculateBoxWeight($scope.list.included);
      var num = $scope.list.included.length;
      $scope.PatchBoxWithWeightLot(box_weight, lot_num, num, harvester_id);
    };
    var query = '?lot_number=eq.' + lot_num;
    DatabaseServices.GetEntry('harvester_lot', func, query);
  };

    /*adds final info to box*/
  $scope.PatchBoxWithWeightLot = function(box_weight, lot_num, num, harvester_id){
    var func = function(response){
      $scope.current[$scope.station_info.collectiontable] = response.data[0];
    };
    var patch = {'weight': box_weight, 'lot_number': lot_num, 'pieces': num, 'harvester_id': harvester_id};
    var query = '?id=eq.' + $scope.current[$scope.station_info.collectiontable].id;
    DatabaseServices.PatchEntry('box', patch, query, func);
  }; 

})




.controller('BoxLabelCtrl', function($scope, $http, DatabaseServices) {

  $scope.BoxQR = function(){
    var stringarray = ObjSubset($scope.current.box, ["size", "grade", "pieces", "weight", "case_number", "lot_number", "harvester_id"]);
    var qrstring = QRCombine(stringarray);
    $scope.qr.string = qrstring;
  };


});
