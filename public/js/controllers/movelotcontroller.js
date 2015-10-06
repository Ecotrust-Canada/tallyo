'use strict';


angular.module('scanthisApp.movelotController', [])

.controller('MoveLotCtrl', function($scope, $http, DatabaseServices) {
  /*
   *
   *Plant manager records stage/location of each lot within plant
   *
   */


  /*list lots for a stage*/
  $scope.ListLots = function(stage_id){
    var query = '?stage_id=eq.' + stage_id;
    var func = function(response){
      $scope.lots = response.data;
    };
    DatabaseServices.GetEntries('supplier_lot', func, query);
  };

  /*change stage on lot*/
  $scope.PatchLotWithStage = function(lot_number){
    var func = function(response){
      $scope.ListLots($scope.from_stage);
    };
    var patch = {'stage_id': $scope.to_stage };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.PatchEntry('lot', patch, query, func);
  };

  /*initialize with stages and labels, refresh button*/
  $scope.init = function(from_stage, to_stage, label, title){
    $scope.from_stage = from_stage;
    $scope.to_stage = to_stage;
    $scope.label = label;
    $scope.title = title;

    $scope.ListLots($scope.from_stage);
    $scope.ReList = function(){
      $scope.ListLots($scope.from_stage);
    };
  };
        

});
