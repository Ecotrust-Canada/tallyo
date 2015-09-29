'use strict';

// Declare app level module which depends on views, and components
angular.module('scanthisApp', [
  'ngRoute',
  'scanthisApp.harsam_admin',
  'scanthisApp.harsam_boxing',
  'scanthisApp.harsam_shipping',
  'scanthisApp.directives',
  'scanthisApp.routing',
  'scanthisApp.filters'
])

.controller('SetStation', function($scope, $http, $injector) {
  //$injector.invoke(EntryCtrl, this, {$scope: $scope});
  $scope.init = function(station_id){
    $scope.station_id = station_id;
  };
})

.controller('SetStage', function($scope, $http, $injector) {
  //$injector.invoke(EntryCtrl, this, {$scope: $scope});
  $scope.init = function(stage_id){
    $scope.stage_id = stage_id;
  };
})


.controller('ItemCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});
  $scope.init = function(fields, options){
    $scope.item_entry = {'timestamp': '', 'lot_number': '', 'stage_id': $scope.stage_id, 'station_id': $scope.station_id};
    $scope.fields = fields;
    $scope.options = options;
    for (var key in fields){
      $scope.item_entry[key] = '';
    }
    if (options.summaryhidden === 'true'){
      InitShowSummary($scope);
    }
    else{
      $scope.showScan = true;
      $scope.showSummary = true;
    }
    $scope.ListLots($scope.stage_id);
    $scope.$watch('currentlot', function(newValue, oldValue) {
      $scope.ListItems(newValue, $scope.station_id);
    });
  };
})

.controller('sharedCtrl', function($scope, $http, $injector) {
  $injector.invoke(EntryCtrl, this, {$scope: $scope});
  $scope.stage_id = 2;

  /*checks if there is an existing lot matching query, if not creates new one (calls newlot)*/
  $scope.CreateLot = function(queryString, date){
    $http.get('http://10.10.50.30:3000/lot' + queryString).then(function(response) {
      if (response.data.length > 0){
        $scope.currentlot = response.data[0].lot_number;
        $scope.SupplierFromLotNumber($scope.currentlot);
      }//end if
      else{
        var lot_number = createLotNum($scope.stage_id, date);
        $scope.MakeLotEntry(date, lot_number);
        $scope.DatabaseLot(lot_number);     
      }
    }, function(response){
      alert(response.status);
    });//end get lot
  };

  $scope.LotFromSupplier = function(){
    $http.get('http://10.10.50.30:3000/stage?id=eq.' + $scope.stage_id).then(function(response){
      var supplier_id = response.data[0].current_supplier_id;
      var date = new Date();
      var queryString = LotQuery({'supplier_id': supplier_id, 'date': date});
      $scope.lot_entry = {'stage_id': $scope.stage_id, 'supplier_id': supplier_id, 'lot_number': '', 'start_date': '', 'end_date': ''};
      $scope.CreateLot(queryString, date);
    }, function(response){
      alert(response.statusText);
    });
  };

  $scope.LotFromSupplier();

});










