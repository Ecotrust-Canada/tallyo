'use strict';


angular.module('scanthisApp.createlotController', [])

.controller('CreateLotCtrl', function($scope, $http, DatabaseServices) {
  /*
   *Selecting current lot from drop down
   */

  /*list the available lots for the current stage*/
  $scope.ListLots = function(stage_id){
    var query = '?stage_id=eq.' + stage_id;
    var func = function(response){
      $scope.lots = response.data;
    };
    DatabaseServices.GetEntries('supplier_lot', func, query);
  };

  /*Sets the current lot number for the stage*/
  $scope.PatchStageWithLot = function(lot_number){
    var func = function(response){
      $scope.current.lot = lot_number;
    };
    var patch = {'current_lot_number': lot_number};
    var query = '?id=eq.' + $scope.stage_id;
    DatabaseServices.PatchEntryNoAlert('stage', patch, query, func);
  };



  $scope.ListLots($scope.stage_id);
  //$scope.current = {};

});
