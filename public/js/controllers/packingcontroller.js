'use strict';


angular.module('scanthisApp.packingController', [])


.controller('PackingCtrl', function($scope, $http, $injector, DatabaseServices) {


  $scope.init = function(table, fk, view, name, obj){

    $scope.includeditems = [];
    $scope.current = [];
    $scope.$watch('current', function(newValue, oldValue) {
      if (newValue[0]){
        $scope.ListContainerItems(newValue[0].id);
      }
    });

    var func = function(response){
      $scope[name] = response.data;
    };
    DatabaseServices.GetEntries(view, func);


    $scope.ContainerFromId = function(id){
      var func = function(response){
        $scope.current[0] = response.data[0];
      };
      var query = '?id=eq.' + id;
      DatabaseServices.GetEntry(table, func, query);
    };

    $scope.ListContainerItems = function(id){
      var func = function(response){
        $scope.includeditems = [];
        for (var i in response.data){
          $scope.includeditems.push(response.data[i]);
        }
      };
      var query = '?' + fk + '=eq.' + id;
      DatabaseServices.GetEntriesReturn(obj, func, query);
    };

    $scope.CurrentContainer = function(id){
      $scope.ContainerFromId(id);
      $scope.ListContainerItems(id);
    };

    $scope.CalcBox = function(){
      var box_weight = CalculateBoxWeight($scope.includeditems);
      var lot_num = GetBoxLotNumber($scope.includeditems);
      $scope.PatchBoxWithWeightLot(box_weight, lot_num);
    };

    $scope.PutObjInContainer = function(id){
      var func = function(response){
        if (response.data[0][fk] && response.data[0][fk] != $scope.current[0].id){
          var overwrite = confirm("overwrite from previous?");
          if (overwrite === true){
            $scope.PatchObjWithContainer(id);
          }
          else{
            $scope.obj_id = null;
          }
        }
        else if (response.data[0][fk] == $scope.current[0].id){
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

    $scope.PatchObjWithContainer = function(id){
      var func = function(response){
        $scope.obj_id = null;
        $scope.includeditems.push(response.data[0]);
      };
      var patch = {};
      patch[fk] = $scope.current[0].id;
      var query = '?id=eq.' + id;    
      if (id && idNotInArray($scope.includeditems, id)){
        DatabaseServices.PatchEntry(obj, patch, query, func);
      }
    };

    $scope.PatchObjRemoveContainer = function(id){
      var func = function(response){
        $scope.includeditems = removeFromArray($scope.includeditems, id);
      };
      var patch = {};
      patch[fk] = null;
      var query = '?id=eq.' + id;
      DatabaseServices.PatchEntry(obj, patch, query, func);
    };

    $scope.PatchBoxWithWeightLot = function(box_weight, lot_num){
      var func = function(response){
        $scope.current[0] = response.data[0];
      };
      var patch = {'weight': box_weight, 'lot_number': lot_num};
      var query = '?id=eq.' + $scope.current[0].id;
      DatabaseServices.PatchEntry('box', patch, query, func);
    };

    
  };
    

});
