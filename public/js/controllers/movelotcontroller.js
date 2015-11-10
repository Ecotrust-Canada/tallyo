'use strict';


angular.module('scanthisApp.movelotController', [])


.controller('LotCtrl', function($scope, $http, DatabaseServices) {
  
  $scope.GetLotLocations = function(){
    var query = '';
    var func = function(response){
      //var array1 = response.data;
      $scope.list.lot_location = response.data;
      /*for (var i =0;i<array1.length;i++){
        array1[i].stations = array1[i].stations.split(',');        
      }
      console.log(array1);*/
    };
    DatabaseServices.GetEntries('lot_aggregated', func, query);
  };

  $scope.GetLotLocations();

})









/*.controller('LotCtrl', function($scope, $http, DatabaseServices) {
  
  $scope.ListLots = function(stage_id){
    var query = '?stage_id=eq.' + stage_id;
    var func = function(response){
      $scope.lot_stage[stage_id] = response.data;
    };
    DatabaseServices.GetEntries('harvester_lot', func, query);
  };



  $scope.init = function(array){
    $scope.array = array;
    $scope.lot_stage = {};


    $scope.listAllLots = function(){
      for (var i =0;i<$scope.array.length;i++){
        $scope.ListLots($scope.array[i]);
      }
    };


    $scope.listAllLots();

  };

})*/



.controller('MoveLotCtrl', function($scope, $http, DatabaseServices) {
  /*
   *
   *Plant manager records stage/location of each lot within plant
   *
   */


  /*change stage on lot*/
  $scope.PatchLotWithNextStage = function(lot_number){
    var func = function(response){
      $scope.listAllLots();
    };
    var patch = {'stage_id': $scope.to_stage };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.PatchEntry('lot', patch, query, func);
  };

  /*change stage on lot*/
  $scope.PatchLotWithPrevStage = function(lot_number){
    var func = function(response){
      $scope.listAllLots();
    };
    var patch = {'stage_id': $scope.prev_stage };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.PatchEntry('lot', patch, query, func);
  };


  /*initialize with stages and labels, refresh button*/
  $scope.init = function(prev_stage, from_stage, to_stage, label, title){
    $scope.prev_stage = prev_stage;
    $scope.from_stage = from_stage;
    $scope.to_stage = to_stage;
    $scope.label = label;
    $scope.title = title;

    
  };
        

});
