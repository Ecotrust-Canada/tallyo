'use strict';


angular.module('scanthisApp.packingController', [])


.controller('PackingCtrl', function($scope, $http, DatabaseServices) {
  /*
   *
   *creating a 'container' and assigning other objects as being in container
   *
   *Items in boxes and boxes in shipments
   *
   */
   
   //"init('box', 'box_id', 'recent_boxes', 'boxes', 'item')"
  $scope.init = function(table, fk, view, name, obj){
    
    $scope.ListContainerItems = function(id){
      var func = function(response){
        $scope.list.included = [];
        for (var i in response.data){
          $scope.list.included.push(response.data[i]);
        }
      };
      var query = '?' + fk + '=eq.' + id;
      DatabaseServices.GetEntries(obj, func, query);
    };
    

    var func = function(response){
      $scope.list[name] = response.data;
    };
    DatabaseServices.GetEntries(view, func);

    /*get container object from selected id*/
    $scope.ContainerFromId = function(id){
      var func = function(response){
        $scope.current[table] = response.data[0];
      };
      var query = '?id=eq.' + id;
      DatabaseServices.GetEntry(table, func, query);
    };

    /*list all the items in a given container*/
    

    /*select a previous container form drop down*/
    $scope.CurrentContainer = function(id){
      $scope.ContainerFromId(id);
      $scope.ListContainerItems(id);
    };

    /*calculate the weight and lot_number of a box*/
    $scope.CalcBox = function(){
      var box_weight = CalculateBoxWeight($scope.included.items);
      var lot_num = GetBoxLotNumber($scope.included.items);
      var num = $scope.included.items.length;
      $scope.PatchBoxWithWeightLot(box_weight, lot_num, num);
    };

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

    /*writes the foreignkey of the object, adds object to list*/
    $scope.PatchObjWithContainer = function(id){
      var func = function(response){
        $scope.obj_id = null;
        $scope.list.included.push(response.data[0]);
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
        $scope.included.items = removeFromArray($scope.included.items, id);
      };
      var patch = {};
      patch[fk] = null;
      var query = '?id=eq.' + id;
      DatabaseServices.PatchEntry(obj, patch, query, func);
    };

    /*adds final info to box*/
    $scope.PatchBoxWithWeightLot = function(box_weight, lot_num, num){
      var func = function(response){
        $scope.current[table] = response.data[0];
      };
      var patch = {'weight': box_weight, 'lot_number': lot_num, 'num_loins': num};
      var query = '?id=eq.' + $scope.current[table].id;
      DatabaseServices.PatchEntry('box', patch, query, func);
    };

    
  };
    

});
