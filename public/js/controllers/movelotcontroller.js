'use strict';


angular.module('scanthisApp.movelotController', [])

.controller('MoveLotCtrl', function($scope, $http, $injector, DatabaseServices) {
  $injector.invoke(BaseCtrl, this, {$scope: $scope});

  $scope.ListLots = function(stage_id){
    var query = '?stage_id=eq.' + stage_id;
    $scope.GetEntries('supplier_lot','lots', query);
  };

  $scope.PatchLotWithStage = function(lot_number){
    var func = function(response){
      $scope.ListLots($scope.from_stage);
    };
    var patch = {'stage_id': $scope.to_stage };
    var query = '?lot_number=eq.' + lot_number;
    DatabaseServices.PatchEntry('lot', patch, query, func);
  };

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
